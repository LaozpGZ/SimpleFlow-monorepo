import type { ExclusiveDutchOrderInfoJSON, ExclusiveDutchOrderTrade } from '@pancakeswap/pcsx-sdk'
import type { InfinityRouter, Route } from '@pancakeswap/smart-router'
import type {
  Currency,
  CurrencyAmount,
  Percent,
  SPLToken,
  TradeType,
  UnifiedCurrencyAmount,
} from '@pancakeswap/swap-sdk-core'
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

export interface SVMTrade<T extends TradeType = TradeType> {
  tradeType: T
  inputAmount: UnifiedCurrencyAmount<SPLToken>
  outputAmount: UnifiedCurrencyAmount<SPLToken>
  priceImpactPct: Percent
  routes: Route[]
  quoteQueryHash?: string
  transaction: string | null
  maximumAmountIn?: UnifiedCurrencyAmount<SPLToken>
  minimumAmountOut?: UnifiedCurrencyAmount<SPLToken>
}

export type SVMOrder<T extends TradeType = TradeType> = {
  type: OrderType.PCS_SVM
  trade: SVMTrade<T>
}

export type PriceOrder<
  input extends Currency = Currency,
  output extends Currency = Currency,
  tradeType extends TradeType = TradeType,
> = ClassicOrder<tradeType> | XOrder<input, output, tradeType> | BridgeOrder<tradeType> | SVMOrder<tradeType>
