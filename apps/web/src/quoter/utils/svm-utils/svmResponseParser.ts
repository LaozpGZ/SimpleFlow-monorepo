import {
  OrderType,
  type RouteStats,
  type SVMOrder,
  type SVMOrderTrade,
  type SVMPool,
  type SVMRoute,
} from '@pancakeswap/price-api-sdk'
import { PoolType, RouteType } from '@pancakeswap/smart-router'
import { CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import type { SVMSwapType } from './types'

// SVM Quote Response types (matching Solana app structure)
interface RoutePlanItem {
  poolId: string
  inputMint: string
  outputMint: string
  feeMint: string
  feeRate: number
  feeAmount: string
  splitPercent: number
  routeIndex: number
}

interface QuoteResponseData {
  swapType: SVMSwapType
  inputMint: string
  inputAmount: string
  outputMint: string
  outputAmount: string
  slippageBps: number
  priceImpactPct: number
  otherAmountThreshold?: string
  routePlan: RoutePlanItem[]
  routeStats: RouteStats
}

export function parseSVMQuoteResponse(responseData: QuoteResponseData, query: QuoteQuery): SVMOrder {
  if (!query.baseCurrency || !query.currency || !query.amount) {
    throw new Error('Invalid QuoteQuery for SVM response parsing')
  }

  // Parse route plan into SVM routes
  const routeMap = new Map<number, SVMRoute>()

  responseData.routePlan.forEach((routeItem) => {
    if (!routeMap.has(routeItem.routeIndex)) {
      // Create new route for this index
      const route: SVMRoute = {
        type: RouteType.SVM,
        inputAmount: query.amount,
        outputAmount: CurrencyAmount.fromRawAmount(query.currency, responseData.outputAmount),
        pools: [],
        path: [query.baseCurrency, query.currency],
        percent: routeItem.splitPercent,
        amount: CurrencyAmount.fromRawAmount(
          query.baseCurrency,
          Math.floor((Number(query.amount.quotient) * routeItem.splitPercent) / 100),
        ),
        routeIndex: routeItem.routeIndex,
      }
      routeMap.set(routeItem.routeIndex, route)
    }

    // Add pool to route
    const route = routeMap.get(routeItem.routeIndex)
    const pool: SVMPool = {
      type: PoolType.SVM,
      id: routeItem.poolId,
      feeAmount: routeItem.feeAmount,
      feeRate: routeItem.feeRate,
    }
    route.pools.push(pool)
  })

  const routes = Array.from(routeMap.values())

  // Create SVM trade
  const trade: SVMOrderTrade = {
    tradeType: query.tradeType || TradeType.EXACT_INPUT,
    inputAmount: CurrencyAmount.fromRawAmount(query.baseCurrency, responseData.inputAmount),
    outputAmount: CurrencyAmount.fromRawAmount(query.currency, responseData.outputAmount),
    priceImpact: null, // SVM doesn't provide price impact
    routes,
    routeStats: responseData.routeStats,
    quoteQueryHash: query.hash,
  }

  // Create SVM order
  const order: SVMOrder = {
    type: OrderType.PCS_SVM,
    trade,
  }

  return order
}
