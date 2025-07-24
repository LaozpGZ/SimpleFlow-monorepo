import { ChainId } from '@pancakeswap/chains'
import {
  type BridgeOrder,
  type ClassicOrder,
  OrderType,
  type PriceOrder,
  type SVMOrder,
  type XOrder,
} from '@pancakeswap/price-api-sdk'
import type { Currency, TradeType } from '@pancakeswap/swap-sdk-core'
import { CAKE, STABLE_COIN, USDC, USDT } from '@pancakeswap/tokens'
import { BridgeOrderFee, computeBridgeOrderFee } from './Bridge/utils'
import { computeTradePriceBreakdown, TradePriceBreakdown } from './V3Swap/utils/exchange'

export const TWAP_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.ARBITRUM_ONE, ChainId.BASE, ChainId.LINEA]

export const isTwapSupported = (chainId?: ChainId) => {
  return !chainId ? false : TWAP_SUPPORTED_CHAINS.includes(chainId)
}

export const isXOrder = (order: InterfaceOrder | undefined | null): order is XOrder =>
  order?.type === OrderType.DUTCH_LIMIT

export const isClassicOrder = (order: InterfaceOrder | undefined | null): order is ClassicOrder =>
  order?.type === OrderType.PCS_CLASSIC

export const isBridgeOrder = (order: InterfaceOrder | undefined | null): order is BridgeOrder =>
  order?.type === OrderType.PCS_BRIDGE

export const isSVMOrder = (order: InterfaceOrder | undefined | null): order is SVMOrder =>
  order?.type === OrderType.PCS_SVM

export type InterfaceOrder<
  input extends Currency = Currency,
  output extends Currency = Currency,
  tradeType extends TradeType = TradeType,
> = PriceOrder<input, output, tradeType>

// Type to support commands property
export type BridgeOrderWithCommands = BridgeOrder & {
  commands?: InterfaceOrder[]
  noSlippageCommands?: InterfaceOrder[]
}

export function getDefaultToken(chainId: number): string | undefined {
  return CAKE[chainId]?.address ?? STABLE_COIN[chainId]?.address ?? USDC[chainId]?.address ?? USDT[chainId]?.address
}

export function getPriceBreakdown(order?: PriceOrder): TradePriceBreakdown | BridgeOrderFee | BridgeOrderFee[] {
  if (isSVMOrder(order)) {
    return {
      priceImpactWithoutFee: undefined,
      lpFeeAmount: null,
    }
  }

  if (isBridgeOrder(order)) {
    return computeBridgeOrderFee(order)
  }

  return computeTradePriceBreakdown(isXOrder(order) ? order.ammTrade : order?.trade)
}
