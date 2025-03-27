import { ChainId } from '@pancakeswap/chains'
import { INFI_SUPPORTED_CHAINS } from '../../constants/infinity'
import { QuoteProvider, QuoterConfig, QuoterOptions, RouteType, RouteWithQuote, RouteWithoutQuote } from '../types'
import { isInfinityBinPool, isInfinityClPool, isV3Pool } from '../utils'
import { createOffChainQuoteProvider } from './offChainQuoteProvider'
import {
  createInfinityBinOnChainQuoteProvider,
  createInfinityClOnChainQuoteProvider,
  createMixedRouteOnChainQuoteProvider,
  createMixedRouteOnChainQuoteProviderV2,
  createV3OnChainQuoteProvider,
} from './onChainQuoteProvider'

// For evm
export function createQuoteProvider(config: QuoterConfig): QuoteProvider<QuoterConfig> {
  const { onChainProvider, multicallConfigs, gasLimit } = config
  const offChainQuoteProvider = createOffChainQuoteProvider()
  const mixedRouteOnChainQuoteProviderV1 = createMixedRouteOnChainQuoteProvider({
    onChainProvider,
    multicallConfigs,
    gasLimit,
  })
  const mixedRouteOnChainQuoteProviderV2 = createMixedRouteOnChainQuoteProviderV2({
    onChainProvider,
    multicallConfigs,
    gasLimit,
  })
  const v3OnChainQuoteProvider = createV3OnChainQuoteProvider({ onChainProvider, multicallConfigs, gasLimit })
  const infinityClOnChainQuoteProvider = createInfinityClOnChainQuoteProvider({
    onChainProvider,
    multicallConfigs,
    gasLimit,
  })
  const infinityBinOnChainQuoteProvider = createInfinityBinOnChainQuoteProvider({
    onChainProvider,
    multicallConfigs,
    gasLimit,
  })

  const createGetRouteWithQuotes = (isExactIn = true) => {
    const getOffChainQuotes = isExactIn
      ? offChainQuoteProvider.getRouteWithQuotesExactIn
      : offChainQuoteProvider.getRouteWithQuotesExactOut
    const getV3Quotes = isExactIn
      ? v3OnChainQuoteProvider.getRouteWithQuotesExactIn
      : v3OnChainQuoteProvider.getRouteWithQuotesExactOut
    const getInfinityClQuotes = isExactIn
      ? infinityClOnChainQuoteProvider.getRouteWithQuotesExactIn
      : infinityClOnChainQuoteProvider.getRouteWithQuotesExactOut
    const getInfinityBinQuotes = isExactIn
      ? infinityBinOnChainQuoteProvider.getRouteWithQuotesExactIn
      : infinityBinOnChainQuoteProvider.getRouteWithQuotesExactOut
    const createMixedRouteQuoteFetcher = (chainId: ChainId) => {
      const mixedRouteOnChainQuoteProvider = INFI_SUPPORTED_CHAINS.includes(chainId as any)
        ? mixedRouteOnChainQuoteProviderV2
        : mixedRouteOnChainQuoteProviderV1
      return isExactIn
        ? mixedRouteOnChainQuoteProvider.getRouteWithQuotesExactIn
        : mixedRouteOnChainQuoteProvider.getRouteWithQuotesExactOut
    }

    return async function getRoutesWithQuotes(
      routes: RouteWithoutQuote[],
      { blockNumber, gasModel, signal }: QuoterOptions,
    ): Promise<RouteWithQuote[]> {
      const { chainId } = routes[0]?.input || {}
      const getMixedRouteQuotes = createMixedRouteQuoteFetcher(chainId)

      const infinityClRoutes: RouteWithoutQuote[] = []
      const infinityBinRoutes: RouteWithoutQuote[] = []
      const v3SingleHopRoutes: RouteWithoutQuote[] = []
      const v3MultihopRoutes: RouteWithoutQuote[] = []
      const mixedRoutesHaveV3Pool: RouteWithoutQuote[] = []
      const routesCanQuoteOffChain: RouteWithoutQuote[] = []
      for (const route of routes) {
        if (route.type === RouteType.V2 || route.type === RouteType.STABLE) {
          routesCanQuoteOffChain.push(route)
          continue
        }
        if (route.type === RouteType.V3) {
          if (route.pools.length === 1) {
            v3SingleHopRoutes.push(route)
            continue
          }
          v3MultihopRoutes.push(route)
          continue
        }
        if (route.type === RouteType.InfinityCL) {
          if (isExactIn) {
            mixedRoutesHaveV3Pool.push(route)
            continue
          }
          infinityClRoutes.push(route)
          continue
        }
        if (route.type === RouteType.InfinityBIN) {
          if (isExactIn) {
            mixedRoutesHaveV3Pool.push(route)
            continue
          }
          infinityBinRoutes.push(route)
          continue
        }
        const { pools } = route
        if (pools.some((pool) => isV3Pool(pool) || isInfinityClPool(pool) || isInfinityBinPool(pool))) {
          mixedRoutesHaveV3Pool.push(route)
          continue
        }
        routesCanQuoteOffChain.push(route)
      }

      const results = await Promise.allSettled([
        getOffChainQuotes(routesCanQuoteOffChain, { blockNumber, gasModel, signal }),
        getMixedRouteQuotes(mixedRoutesHaveV3Pool, { blockNumber, gasModel, retry: { retries: 0 }, signal }),
        getV3Quotes(v3SingleHopRoutes, { blockNumber, gasModel, signal }),
        getV3Quotes(v3MultihopRoutes, { blockNumber, gasModel, retry: { retries: 1 }, signal }),
        getInfinityClQuotes(infinityClRoutes, { blockNumber, gasModel, signal }),
        getInfinityBinQuotes(infinityBinRoutes, { blockNumber, gasModel, signal }),
      ])
      if (results.every((result) => result.status === 'rejected')) {
        throw new Error(results.map((result) => (result as PromiseRejectedResult).reason).join(','))
      }
      return results
        .filter((result): result is PromiseFulfilledResult<RouteWithQuote[]> => result.status === 'fulfilled')
        .reduce<RouteWithQuote[]>((acc, cur) => [...acc, ...cur.value], [])
    }
  }

  return {
    getRouteWithQuotesExactIn: createGetRouteWithQuotes(true),
    getRouteWithQuotesExactOut: createGetRouteWithQuotes(false),
    getConfig: () => config,
  }
}
