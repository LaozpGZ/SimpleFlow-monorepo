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
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { OrderStatus, ResponseOrder } from '../types/orders.types'
import { simulateLimitOrderContract } from '../utils/orders'
import { useUserLimitOrders } from './useUserLimitOrders'

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
    queryFn: () => fetchCLPoolInfo(order.pool_id, chainId),
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
    const finalPrice = isInverted ? price.invert() : price
    return formatPrice(finalPrice, 6, 'en-US')
  }, [pool, currencyA, currencyB, order.tick_lower, isInverted, order.zero_for_one, currencyA, currencyB])

  // Amounts Received
  const { data: [amount0Received, amount1Received] = [0n, 0n], refetch: refetchAmountsReceived } = useQuery({
    queryKey: ['order-amounts-received', account, chainId, order.order_id, order.pool_id],
    queryFn: async () => {
      if (!account) return undefined

      if (order.status === OrderStatus.Open) {
        const response = await simulateLimitOrderContract(
          contract,
          'cancelOrder',
          [BigInt(order.order_id), account],
          account,
        )
        console.log(
          `%c [Order ${order.order_id}][Simulate Cancel Response]`,
          'background: #fad7b6;color: black',
          response,
        )
        return response.result as unknown as [bigint, bigint]
      }

      if (order.status === OrderStatus.Filled || order.status === OrderStatus.PartiallyFilled) {
        const response = await simulateLimitOrderContract(
          contract,
          'withdraw',
          [BigInt(order.order_id), account],
          account,
        )
        console.log(
          `%c [Order ${order.order_id}][Simulate Withdraw Response]`,
          'background: #fad7b6;color: black',
          response,
        )
        return response.result as unknown as [bigint, bigint]
      }

      // TODO: How to get amount if Withdrawn or Cancelled.
      // BE says will return liquidity value for Withdrawn case
      return [0n, 0n]
    },
    initialData: [0n, 0n],
  })

  const amountAReceived = useMemo(() => {
    if (!currencyA?.decimals || !currencyB?.decimals) return undefined
    if (order.zero_for_one) return formatUnits(amount0Received, currencyA?.decimals)
    return formatUnits(amount1Received, currencyB?.decimals)
  }, [order.zero_for_one, amount0Received, amount1Received, currencyA?.decimals, currencyB?.decimals])

  const amountBReceived = useMemo(() => {
    if (!currencyB?.decimals || !currencyA?.decimals) return undefined
    if (order.zero_for_one) return formatUnits(amount1Received, currencyB?.decimals)
    return formatUnits(amount0Received, currencyA?.decimals)
  }, [order.zero_for_one, amount1Received, amount0Received])

  console.log(`%c [Order ${order.order_id}][amountAReceived]`, 'background:#feeede;color: black', amountAReceived)
  console.log(`%c [Order ${order.order_id}][amountBReceived]`, 'background:#feeede;color: black', amountBReceived)

  // TODO: Check for fees calculation? At least quoted amount should be the same
  const [originalAmountA, originalAmountB] = useMemo(() => {
    if (!currency0 || !currency1 || !pool) return [undefined, undefined]

    const liquidity = BigInt(order.liquidity)

    if (order.zero_for_one) {
      const token0Amount = SqrtPriceMath.getAmount0Delta(
        TickMath.getSqrtRatioAtTick(order.tick_lower),
        TickMath.getSqrtRatioAtTick(order.tick_lower + pool?.parameters.tickSpacing),
        liquidity,
        false,
      )
      const price = tickToPrice(currency0, currency1, order.tick_lower)
      const amount1 = price.quote(CurrencyAmount.fromRawAmount(currency0, token0Amount))
      return [formatUnits(token0Amount, currency0?.decimals), formatUnits(amount1.quotient, currency1?.decimals)]
    }
    const token1Amount = SqrtPriceMath.getAmount1Delta(
      TickMath.getSqrtRatioAtTick(order.tick_lower - pool?.parameters.tickSpacing),
      TickMath.getSqrtRatioAtTick(order.tick_lower),
      liquidity,
      false,
    )
    const price = tickToPrice(currency0, currency1, order.tick_lower)
    const amount0 = price.invert().quote(CurrencyAmount.fromRawAmount(currency1, token1Amount))
    return [formatUnits(amount0.quotient, currency0?.decimals), formatUnits(token1Amount, currency1?.decimals)]
  }, [currency0, currency1, order.liquidity, pool?.tick, order.tick_lower, pool?.parameters.tickSpacing])

  console.log(`%c [Order ${order.order_id}][originalAmountA]`, 'background:red;color: black', originalAmountA)
  console.log(`%c [Order ${order.order_id}][originalAmountB]`, 'background:red;color: black', originalAmountB)

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
    liveStatus,
    currencyA,
    currencyB,
    limitPrice,
    isInverted,
    originalAmountA,
    originalAmountB,
    amountAReceived,
    amountBReceived,
    setIsInverted,
    handleCancelOrder,
    handleWithdrawOrder,
  }
}
