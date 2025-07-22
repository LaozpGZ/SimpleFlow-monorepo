import { OrderType } from '@pancakeswap/price-api-sdk'
import { PoolType, RouteType } from '@pancakeswap/smart-router'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'

// SVM Pool structure
export interface SVMPool {
  type: PoolType.SVM
  id: string
  feeAmount: string
  feeRate: number
}

// SVM Route structure
export interface SVMRoute {
  type: RouteType.SVM
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  pools: SVMPool[]
  path: Currency[]
  percent: number
  amount: CurrencyAmount<Currency>
  routeIndex: number
}

// Route stats from SVM quoter
export interface RouteStats {
  numSubRoutes: number
  totalHops: number
  avgHopsPerRoute: number
}

// SVM Trade extending SmartRouterTrade concept
export interface SVMOrderTrade<T extends TradeType = TradeType> {
  tradeType: T
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  priceImpact: null // SVM doesn't provide price impact
  routes: SVMRoute[]
  routeStats: RouteStats
  quoteQueryHash?: string
}

// SVM Order extending InterfaceOrder
export interface SVMOrder<T extends TradeType = TradeType> {
  type: OrderType.PCS_SVM
  trade: SVMOrderTrade<T>
}
