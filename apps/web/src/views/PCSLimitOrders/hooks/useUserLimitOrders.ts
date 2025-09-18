import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { PCS_LIMIT_ORDER_HISTORY_URL } from '../constants'
import { Order, OrderStatus, ResponseOrder } from '../types/orders.types'

async function getUserLimitOrders(chainName: string, address: string) {
  const response = await fetch(`${PCS_LIMIT_ORDER_HISTORY_URL}/${chainName}/${address}`)
  if (!response.ok) {
    console.error('Failed to fetch user limit orders', response)
    return []
  }
  return (await response.json()) as ResponseOrder[]
}

export const useUserLimitOrders = () => {
  const contract = useCLLimitOrderHookContract()

  const { account, chainId } = useAccountActiveChain()
  const chainName = chainIdToExplorerInfoChainName[chainId]

  return useQuery({
    queryKey: ['userLimitOrders', chainId, account],
    queryFn: async () => {
      if (!account) return []
      const data = await getUserLimitOrders(chainName, account)

      console.log('%c [Order History Data]', 'background: green;color: white', data)
      const orders = await Promise.allSettled(
        data.map(async (item) => {
          // Fetch Amounts //
          let amount0: bigint | undefined
          let amount1: bigint | undefined

          // If order status is OPEN, simulate Cancel
          if (item.status === OrderStatus.Open) {
            const { result } = await contract.simulate.cancelOrder([BigInt(item.order_id), account])
            amount0 = result[0]
            amount1 = result[1]
          }
          // If order status is Filled, simulate Withdraw
          if (item.status === OrderStatus.Filled) {
            const { result } = await contract.simulate.withdraw([BigInt(item.order_id), account])
            amount0 = result[0]
            amount1 = result[1]
          }

          // But how to fetch amounts if order is cancelled or withdrawn 🤔

          return {
            amount0,
            amount1,
            ...item,
          }
        }),
      )

      console.log('%c [Orders]', 'background: darkgreen;color: white', orders)

      return orders.filter((order) => order.status === 'fulfilled').map((order) => order.value)
    },
    enabled: !!account && !!chainName,
  })
}
