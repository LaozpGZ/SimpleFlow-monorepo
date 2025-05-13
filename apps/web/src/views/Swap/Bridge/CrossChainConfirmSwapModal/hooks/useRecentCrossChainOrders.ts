import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { createQueryKey, UseQueryParameters } from 'utils/reactQuery'
import { Address } from 'viem'
// import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../../types'
import { GetRecentCrossChainOrdersResponse } from '../api'

const getRecentCrossChainOrdersQueryKey = createQueryKey<
  'recent-cross-chain-orders',
  [chainId: number, address: Address]
>('recent-cross-chain-orders')

interface UseRecentCrossChainOrdersParameters extends UseQueryParameters {
  chainId?: number
  address?: Address
}

export const useRecentCrossChainOrders = ({ chainId, address }: UseRecentCrossChainOrdersParameters) => {
  const queryOptions: UseQueryOptions<GetRecentCrossChainOrdersResponse, Error, GetRecentCrossChainOrdersResponse> = {
    queryKey: getRecentCrossChainOrdersQueryKey([chainId!, address!]),
    queryFn: () => {
      if (!chainId || !address) {
        throw new Error('No chainId or address provided')
      }
      // TODO: Use actual API call
      // return getRecentCrossChainOrders(chainId, address)

      //
      // Returning test orders for now
      //

      return {
        orders: [
          // {
          //   id: 'abc1',
          //   status: CrossChainOrderStatus.ORDER_SUCCESS,
          //   order: mockOrder,
          //   originalOrder: mockOrder,
          //   steps: [
          //     {
          //       id: '1',
          //       status: CrossChainOrderStepStatus.SUCCESS,
          //       type: CrossChainOrderStepType.BRIDGE,
          //       inputAmount: '1000000000000000000',
          //       outputAmount: '1000000000000000000',
          //       inputCurrency: fromToken,
          //       outputCurrency: toToken,
          //       inputChainName: 'Ethereum',
          //       outputChainName: 'BNB Chain',
          //       tx: {
          //         chainId: 1,
          //         hash: '0x123',
          //       },
          //     },
          //   ],
          // },
        ],
      }
    },
    enabled: !!chainId && !!address,
    staleTime: 5_000,
    retry: 3,
    refetchOnMount: true,
  }

  return useQuery<GetRecentCrossChainOrdersResponse, Error, GetRecentCrossChainOrdersResponse>(queryOptions)
}
