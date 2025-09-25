import { useQuery } from '@tanstack/react-query'
import { fetchCLPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCallback, useMemo, useState } from 'react'
import { useCurrency } from 'hooks/Tokens'
import { tickToPrice } from 'hooks/infinity/utils'
import { formatPrice } from 'utils/formatCurrencyAmount'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { formatUnits } from '@pancakeswap/utils/viem/formatUnits'
import useCatchTxError from 'hooks/useCatchTxError'
import { useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { SqrtPriceMath, TickMath } from '@pancakeswap/v3-sdk'
import { FAST_INTERVAL } from 'config/constants'
import { BigNumber as BN } from 'bignumber.js'
import { OrderStatus, ResponseOrder } from '../types/orders.types'
import { simulateLimitOrderContract } from '../utils/orders'
import { useUserLimitOrders } from './useUserLimitOrders'
import { bigNumberToPrice } from '../utils/price'

export const useOrder = (order: ResponseOrder) => {
  const { t } = useTranslation()
  const { account, chainId } = useAccountActiveChain()

  const { refetch: refetchUserLimitOrders } = useUserLimitOrders()
  const contract = useCLLimitOrderHookContract()

  const { fetchWithCatchTxError } = useCatchTxError()
  const { toastError } = useToast()

  const [isInverted, setIsInverted] = useState(false)

  // Provide live status to Table Row after Cancel/Withdraw txn
  const [liveStatus, setLiveStatus] = useState(order.status)

  // Pool
  const { data: pool } = useQuery({
    queryKey: ['order-pool', order.pool_id],
    queryFn: async () => fetchCLPoolInfo(order.pool_id, chainId),
    refetchInterval: FAST_INTERVAL,
  })

  // Currencies
  const currency0 = useCurrency(pool?.currency0, chainId)
  const currency1 = useCurrency(pool?.currency1, chainId)

  const currencyA = useMemo(
    () => (order.zero_for_one ? currency0 : currency1),
    [order.zero_for_one, currency0, currency1],
  )
  const currencyB = useMemo(
    () => (order.zero_for_one ? currency1 : currency0),
    [order.zero_for_one, currency1, currency0],
  )

  // Limit Price
  const limitPrice = useMemo(() => {
    if (!pool || !currencyA || !currencyB) return undefined
    const price = tickToPrice(currencyA, currencyB, order.tick_lower)
    const priceUpper = tickToPrice(currencyA, currencyB, order.tick_lower + pool.parameters.tickSpacing)

    const sqrtPrice = isInverted
      ? BN(price.invert().toFixed(18))
          .multipliedBy(BN(priceUpper.invert().toFixed(18)))
          .sqrt()
      : BN(price.toFixed(18))
          .multipliedBy(BN(priceUpper.toFixed(18)))
          .sqrt()

    const parsedSqrtPrice = bigNumberToPrice(sqrtPrice, currencyA, currencyB)
    return formatPrice(parsedSqrtPrice, 6, 'en-US')
  }, [pool, currencyA, currencyB, order.tick_lower, isInverted, order.zero_for_one, currencyA, currencyB])

  const [originalAmountA, originalAmountB] = useMemo(() => {
    if (!currency0 || !currency1 || !pool) return [undefined, undefined]

    const liquidity = BigInt(order.liquidity)

    // Contract handles tick range as [tickLower, tickLower + tickSpacing]
    const tickLower = order.tick_lower
    const tickUpper = order.tick_lower + pool.parameters.tickSpacing

    const token0Amount = SqrtPriceMath.getAmount0Delta(
      TickMath.getSqrtRatioAtTick(tickLower),
      TickMath.getSqrtRatioAtTick(tickUpper),
      liquidity,
      false,
    )

    const token1Amount = SqrtPriceMath.getAmount1Delta(
      TickMath.getSqrtRatioAtTick(tickLower),
      TickMath.getSqrtRatioAtTick(tickUpper),
      liquidity,
      false,
    )

    const result = order.zero_for_one
      ? [formatUnits(token0Amount, currency0?.decimals), formatUnits(token1Amount, currency1?.decimals)]
      : [formatUnits(token1Amount, currency1?.decimals), formatUnits(token0Amount, currency0?.decimals)]

    return result
  }, [currency0, currency1, order.liquidity, order.tick_lower, pool?.parameters.tickSpacing])

  // Amounts Received
  const { data: [amount0Received, amount1Received] = [0n, 0n], refetch: refetchAmountsReceived } = useQuery({
    queryKey: ['order-amounts-received', account, chainId, order.order_id, order.pool_id],
    queryFn: async () => {
      if (!account) return undefined

      // Use amounts returned from API
      if (order.status === OrderStatus.Withdrawn) {
        return [BigInt(order.amount0), BigInt(order.amount1)]
      }

      if (order.status === OrderStatus.Open || order.status === OrderStatus.PartiallyFilled) {
        const response = await simulateLimitOrderContract(
          contract,
          'cancelOrder',
          [BigInt(order.order_id), account],
          account,
        )
        return response.result as unknown as [bigint, bigint]
      }

      if (order.status === OrderStatus.Filled) {
        const response = await simulateLimitOrderContract(
          contract,
          'withdraw',
          [BigInt(order.order_id), account],
          account,
        )
        return response.result as unknown as [bigint, bigint]
      }

      return [0n, 0n]
    },
    initialData: [0n, 0n],
  })

  const amountAReceived = useMemo(() => {
    if (!currencyA?.decimals || !currencyB?.decimals) return undefined
    if (order.zero_for_one) return formatUnits(amount0Received, currencyA?.decimals)
    return formatUnits(amount1Received, currencyB?.decimals)
  }, [order.zero_for_one, amount0Received, amount1Received, currencyA?.decimals, currencyB?.decimals, originalAmountA])

  const amountBReceived = useMemo(() => {
    if (!currencyB?.decimals || !currencyA?.decimals) return undefined
    if (order.zero_for_one) return formatUnits(amount1Received, currencyB?.decimals)
    return formatUnits(amount0Received, currencyA?.decimals)
  }, [order.zero_for_one, amount1Received, amount0Received, originalAmountB])

  // Check for partial fill case
  const isPartialFill = useMemo(() => {
    if (order.status === OrderStatus.Filled || order.status === OrderStatus.Withdrawn || !pool) return false

    // If tickLower < tickCurrent < tickLower + tickSpacing
    if (pool.tick > order.tick_lower && pool.tick < order.tick_lower + pool.parameters.tickSpacing) {
      return true
    }

    // If zeroForOne is false, then tickCurrent === tickLower is partial fill (Special case)
    if (order.zero_for_one === false && pool.tick === order.tick_lower) {
      return true
    }

    return false
  }, [order, pool])

  const filledPercentage = useMemo(() => {
    if (isPartialFill && originalAmountB && amountBReceived) {
      const expectedOutput = BN(originalAmountB)
      const filledOutput = BN(amountBReceived)
      const result = filledOutput.dividedBy(expectedOutput).multipliedBy(100)
      return result.lt(1) ? '< 1' : result.toFixed(0)
    }

    return liveStatus === OrderStatus.Filled || liveStatus === OrderStatus.Withdrawn ? '100' : '0'
  }, [isPartialFill, liveStatus, originalAmountB, amountBReceived, order.order_id])

  // Actions
  const handleCancelOrder = useCallback(async () => {
    if (!account) return

    try {
      const receipt = await fetchWithCatchTxError(async () => {
        return contract.write.cancelOrder([BigInt(order.order_id), account], {
          account,
          chain: contract.chain,
        })
      })

      if (receipt?.status) {
        if (receipt.status === 'success') {
          console.log(
            `%c [Order ${order.order_id}][Cancel Order Transaction successful]`,
            'background:lightgreen;color: white',
            receipt.transactionHash,
          )

          setLiveStatus(OrderStatus.Cancelled)
          refetchUserLimitOrders()
          refetchAmountsReceived()
        }
      }
    } catch (error: any) {
      toastError(t('Failed'), error.message || error.details || error)
    }
  }, [contract, account, order.order_id, fetchWithCatchTxError, refetchUserLimitOrders])

  const handleWithdrawOrder = useCallback(async () => {
    if (!account) return

    try {
      const receipt = await fetchWithCatchTxError(async () => {
        return contract.write.withdraw([BigInt(order.order_id), account], {
          account,
          chain: contract.chain,
        })
      })
      if (receipt?.status) {
        if (receipt.status === 'success') {
          console.log(
            `%c [Order ${order.order_id}][Withdraw Order Transaction successful]`,
            'background:lightgreen;color: white',
            receipt.transactionHash,
          )

          setLiveStatus(OrderStatus.Withdrawn)
          refetchUserLimitOrders()
          refetchAmountsReceived()
        }
      }
    } catch (error: any) {
      toastError(t('Failed'), error.message || error.details || error)
    }
  }, [contract, account, order.order_id, fetchWithCatchTxError, refetchUserLimitOrders])

  return {
    pool,
    liveStatus: isPartialFill
      ? OrderStatus.PartiallyFilled
      : // Ignore PartiallyFilled status from BE
      liveStatus === OrderStatus.PartiallyFilled
      ? OrderStatus.Open
      : liveStatus,
    currencyA,
    currencyB,
    limitPrice,
    isInverted,
    originalAmountA,
    originalAmountB,
    amountAReceived,
    amountBReceived,
    filledPercentage,
    setIsInverted,
    handleCancelOrder,
    handleWithdrawOrder,
  }
}
