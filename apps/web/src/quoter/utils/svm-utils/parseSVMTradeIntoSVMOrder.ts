import { type SVMOrder, OrderType, SVMTrade } from '@pancakeswap/price-api-sdk'
import { PoolType, Route, RouteType, SVMPool } from '@pancakeswap/smart-router'
import { SolRouterTrade } from '@pancakeswap/solana-router-sdk'
import { TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { QuoteQuery } from 'quoter/quoter.types'

/**
 * SVM Trade to SVM Order mapping
 * SolRouterTrade → SVMOrder
 * ├── tradeType (from query.tradeType)
 * ├── inputAmount ✓ (direct copy)
 * ├── outputAmount ✓ (direct copy)
 * ├── routes: RouterPlan[] → Route[] (convert each RouterPlan)
 * |───────|RouterPlan → Route
 * |───────|RouterPlan.swapInfo.ammKey → SVMPool.id
 * |───────|RouterPlan.swapInfo.feeAmount → SVMPool.feeAmount
 * |───────|RouterPlan.percent → Route.percent
 * |───────|RouterPlan.swapInfo.inAmount → Route.inputAmount (convert to CurrencyAmount)
 * |───────|RouterPlan.swapInfo.outAmount → Route.outputAmount (convert to CurrencyAmount)
 * ├── priceImpactPct → priceImpactPct ✓ (direct copy)
 * ├── transaction ✓ (direct copy)
 * ├── otherAmountThreshold ✓ (direct copy)
 * └── + quoteQueryHash (from query.hash)
 */
export function parseSVMTradeIntoSVMOrder(svmTrade: SolRouterTrade, query: QuoteQuery): SVMOrder<TradeType> {
  // Convert RouterPlan[] to Route[]
  const routes: Route[] = svmTrade.routes.map((routerPlan) => {
    // Create SVMPool from RouterPlan.swapInfo
    const svmPool: SVMPool = {
      type: PoolType.SVM,
      id: routerPlan.swapInfo.ammKey.toString(),
      feeAmount: routerPlan.swapInfo.feeAmount,
    }

    // Convert string amounts to CurrencyAmount objects
    const inputAmount = UnifiedCurrencyAmount.fromRawAmount(svmTrade.inputAmount.currency, routerPlan.swapInfo.inAmount)
    const outputAmount = UnifiedCurrencyAmount.fromRawAmount(
      svmTrade.outputAmount.currency,
      routerPlan.swapInfo.outAmount,
    )

    // Create Route object
    return {
      type: RouteType.SVM,
      pools: [svmPool],
      path: [svmTrade.inputAmount.currency, svmTrade.outputAmount.currency],
      inputAmount,
      outputAmount,
      percent: routerPlan.percent,
    }
  })

  // Create SVMTrade
  const svmTradeData: SVMTrade<TradeType> = {
    tradeType: query.tradeType || svmTrade.tradeType,
    inputAmount: svmTrade.inputAmount,
    outputAmount: svmTrade.outputAmount,
    priceImpactPct: svmTrade.priceImpactPct,
    routes,
    quoteQueryHash: query.hash,
    transaction: svmTrade.transaction,
    otherAmountThreshold: svmTrade.otherAmountThreshold,
  }

  // Create SVMOrder
  return {
    type: OrderType.PCS_SVM,
    trade: svmTradeData,
  }
}
