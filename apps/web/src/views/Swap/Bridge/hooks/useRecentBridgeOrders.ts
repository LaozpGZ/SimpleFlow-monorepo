import { useInfiniteQuery } from '@tanstack/react-query'
import { createQueryKey } from 'utils/reactQuery'
import { Address } from 'viem'
import { getUserBridgeOrdersV2 } from '../api'
import { BridgeStatus } from '../types'

const getRecentBridgeOrdersQueryKey = createQueryKey<'recent-bridge-orders', [address: Address]>('recent-bridge-orders')

interface UseRecentBridgeOrdersParameters {
  address?: Address
}

export const useRecentBridgeOrders = ({ address }: UseRecentBridgeOrdersParameters) => {
  return useInfiniteQuery({
    queryKey: getRecentBridgeOrdersQueryKey([address!]),
    queryFn: async ({ pageParam }) => {
      if (!address) {
        throw new Error("No address provided for user's bridge orders")
      }

      const responsev2 = await getUserBridgeOrdersV2(address, pageParam)

      // TODO: v2 will return {EVM: UserBridgeOrdersResponse, NON-EVM: UserBridgeOrdersResponse}
      // merge them, for rows, concat them by timestamp,
      const mergedRows = [...responsev2.EVM.rows, ...responsev2['NON-EVM'].rows].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      return {
        endCursor: responsev2.EVM.endCursor,
        continuation: responsev2['NON-EVM'].endCursor,
        hasNextPage: responsev2.EVM.hasNextPage || responsev2['NON-EVM'].hasNextPage,
        rows: mergedRows,
      }
    },
    enabled: !!address,
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => {
      return {
        after: lastPage.endCursor as string,
        continuation: lastPage.continuation as string,
      }
    },
    retry: 3,
    retryDelay: 1_000,
    refetchOnMount: true,
    refetchInterval: (query) =>
      query.state.data?.pages
        .flatMap((page) => (Array.isArray(page.rows) ? page.rows.map((row) => row.status) : []))
        .find((status) => status === BridgeStatus.PENDING || status === BridgeStatus.BRIDGE_PENDING)
        ? 20_000
        : 60_000,
  })
}
