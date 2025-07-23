import type { ExclusiveDutchOrderInfoJSON, ExclusiveDutchOrderTrade } from '@pancakeswap/pcsx-sdk'
import type { InfinityRouter, PoolType, Route, RouteType } from '@pancakeswap/smart-router'
import type { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import type { AMMOrder } from './amm'
import { Hex } from './common'
import { OrderType } from './orderType'

export type Order =
  | {
      type: OrderType.DUTCH_LIMIT
      order: {
        auctionPeriodSecs: number
        deadlineBufferSecs: number
        orderInfo: ExclusiveDutchOrderInfoJSON
        encodedOrder: Hex
        permitData: any // TODO: add permit data type
        quoteId: string
        requestId: string
        slippageTolerance: string
        startTimeBufferSecs: number
      }
    }
  | {
      type: OrderType.PCS_CLASSIC
      order: AMMOrder
    }
  | {
      type: OrderType.PCS_BRIDGE
      order: BridgeOrder
    }

export type BridgeTrade<tradeType extends TradeType = TradeType> = {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  tradeType: tradeType
  routes: Route[]
}

export type BridgeTransactionData = Record<string, any>

export type ClassicOrder<tradeType extends TradeType = TradeType> = {
  type: OrderType.PCS_CLASSIC
  trade: InfinityRouter.InfinityTradeWithoutGraph<tradeType>
}

export type XOrder<
  input extends Currency = Currency,
  output extends Currency = Currency,
  tradeType extends TradeType = TradeType,
> = {
  type: OrderType.DUTCH_LIMIT
  ammTrade?: InfinityRouter.InfinityTradeWithoutGraph<tradeType>
  trade: ExclusiveDutchOrderTrade<input, output>
  get bestQuote(): ExclusiveDutchOrderTrade<input, output> | InfinityRouter.InfinityTradeWithoutGraph<tradeType> | null
}

export type BridgeOrder<tradeType extends TradeType = TradeType> = {
  type: OrderType.PCS_BRIDGE
  trade: BridgeTrade<tradeType>
  bridgeFee: CurrencyAmount<Currency>
  expectedFillTimeSec: number
  bridgeTransactionData: BridgeTransactionData
}

// SVM Order types
export interface SVMPool {
  type: PoolType.SVM
  id: string
  feeAmount: string
  feeRate: number
}

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

export interface RouteStats {
  numSubRoutes: number
  totalHops: number
  avgHopsPerRoute: number
}

export interface SVMOrderTrade<T extends TradeType = TradeType> {
  tradeType: T
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  priceImpact: null
  routes: SVMRoute[]
  routeStats: RouteStats
  quoteQueryHash?: string
}

export type SVMOrder<tradeType extends TradeType = TradeType> = {
  type: OrderType.PCS_SVM
  trade: SVMOrderTrade<tradeType>
}

export type PriceOrder<
  input extends Currency = Currency,
  output extends Currency = Currency,
  tradeType extends TradeType = TradeType,
> = ClassicOrder<tradeType> | XOrder<input, output, tradeType> | BridgeOrder<tradeType> | SVMOrder<tradeType>
