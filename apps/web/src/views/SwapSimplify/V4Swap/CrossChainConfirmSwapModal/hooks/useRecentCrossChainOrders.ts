import { BridgeOrder, OrderType } from '@pancakeswap/price-api-sdk'
import { Token } from '@pancakeswap/sdk'
import { CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { createQueryKey, UseQueryParameters } from 'utils/reactQuery'
import { Address } from 'viem'
import { GetRecentCrossChainOrdersResponse } from '../api'
import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../types'

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
      const fromToken = new Token(1, '0x0000000000000000000000000000000000000000', 18, 'ETH', 'Ethereum')
      const toToken = new Token(56, '0x0000000000000000000000000000000000000000', 18, 'BNB', 'BNB Chain')

      // Create a single order object to be used for both order and originalOrder
      const mockOrder: BridgeOrder<TradeType> = {
        bridgeFee: CurrencyAmount.fromRawAmount(fromToken, '1000000000000000000'),
        type: OrderType.PCS_BRIDGE,
        trade: {
          tradeType: TradeType.EXACT_INPUT,
          inputAmount: CurrencyAmount.fromRawAmount(fromToken, '1000000000000000000'),
          outputAmount: CurrencyAmount.fromRawAmount(toToken, '1000000000000000000'),
          routes: [],
        },
      }

      return {
        orders: [
          {
            id: 'abc1',
            status: CrossChainOrderStatus.ORDER_SUCCESS,
            order: mockOrder,
            originalOrder: mockOrder,
            steps: [
              {
                id: '1',
                status: CrossChainOrderStepStatus.SUCCESS,
                type: CrossChainOrderStepType.BRIDGE,
                inputAmount: '1000000000000000000',
                outputAmount: '1000000000000000000',
                inputCurrency: fromToken,
                outputCurrency: toToken,
                inputChainName: 'Ethereum',
                outputChainName: 'BNB Chain',
                tx: {
                  chainId: 1,
                  hash: '0x123',
                },
              },
            ],
          },
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
