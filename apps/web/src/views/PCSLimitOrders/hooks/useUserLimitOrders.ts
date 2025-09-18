import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { PCS_LIMIT_ORDER_HISTORY_URL } from '../constants'
import { Order } from '../types/orders'

async function getUserLimitOrders(chainName: string, address: string) {
  const response = await fetch(`${PCS_LIMIT_ORDER_HISTORY_URL}/${chainName}/${address}`)
  if (!response.ok) {
    console.error('Failed to fetch user limit orders', response)
    return []
  }
  return (await response.json()) as Order[]
}

export const useUserLimitOrders = () => {
  const { account, chainId } = useAccountActiveChain()
  const chainName = chainIdToExplorerInfoChainName[chainId]

  return useQuery({
    queryKey: ['userLimitOrders', chainId, account],
    queryFn: () => getUserLimitOrders(chainName, account ?? ''),
    enabled: !!account && !!chainName,
  })
}
