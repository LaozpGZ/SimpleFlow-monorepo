import { useQuery } from '@tanstack/react-query'
import { fetchCLPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCallback, useMemo, useState } from 'react'
import { useCurrency } from 'hooks/Tokens'
import { tickToPrice } from 'hooks/infinity/utils'
import { formatPrice } from 'utils/formatCurrencyAmount'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { formatUnits } from '@pancakeswap/utils/viem/formatUnits'
import { simulateLimitOrderContract } from '../utils/orders'
import { OrderStatus, ResponseOrder } from '../types/orders.types'

export const useOrder = (order: ResponseOrder) => {
  const { account, chainId } = useAccountActiveChain()

  const contract = useCLLimitOrderHookContract()

  const { data: pool } = useQuery({
    queryKey: ['order-pool', order.pool_id],
    queryFn: () => fetchCLPoolInfo(order.pool_id, chainId),
  })

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

  const [isInverted, setIsInverted] = useState(false)

  const limitPrice = useMemo(() => {
    if (!pool || !currencyA || !currencyB) return undefined
    const price = tickToPrice(currencyA, currencyB, order.tick_lower)
    const finalPrice = isInverted ? price.invert() : price
    return formatPrice(finalPrice, 6, 'en-US')
  }, [pool, currencyA, currencyB, order.tick_lower, isInverted, order.zero_for_one, currencyA, currencyB])

  const { data: [amount0Received, amount1Received] = [0n, 0n] } = useQuery({
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

  const handleCancelOrder = useCallback(() => {}, [])
  const handleWithdrawOrder = useCallback(() => {}, [])

  return {
    pool,
    currencyA,
    currencyB,
    limitPrice,
    isInverted,
    amountAReceived,
    amountBReceived,
    setIsInverted,
    handleCancelOrder,
    handleWithdrawOrder,
  }
}
