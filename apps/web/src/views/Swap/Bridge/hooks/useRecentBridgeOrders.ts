import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { createQueryKey, UseQueryParameters } from 'utils/reactQuery'
import { Address } from 'viem'
import { getUserBridgeOrders } from '../api'
import { BridgeStatus, UserBridgeOrdersResponse } from '../types'

const getRecentCrossChainOrdersQueryKey = createQueryKey<'recent-cross-chain-orders', [address: Address]>(
  'recent-cross-chain-orders',
)

interface UseRecentBridgeOrdersParameters extends UseQueryParameters {
  address?: Address
}

export const useRecentBridgeOrders = ({ address }: UseRecentBridgeOrdersParameters) => {
  const queryOptions: UseQueryOptions<UserBridgeOrdersResponse, Error, UserBridgeOrdersResponse> = {
    queryKey: getRecentCrossChainOrdersQueryKey([address!]),
    queryFn: () => {
      if (!address) {
        throw new Error("No address provided for user's bridge orders")
      }

      return getUserBridgeOrders(address)
    },
    enabled: !!address,
    retry: 3,
    retryDelay: 1_000,
    refetchOnMount: true,
    refetchInterval: (query) =>
      query.state.data?.rows.find((row) => row.status === BridgeStatus.PENDING) ? 5_000 : 10_000,
  }

  return useQuery<UserBridgeOrdersResponse, Error, UserBridgeOrdersResponse>(queryOptions)
}
