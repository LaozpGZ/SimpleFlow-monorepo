import { OrderType } from '@pancakeswap/price-api-sdk'
import { BridgeOrderWithCommands, isXOrder } from 'views/Swap/utils'
import { computeTradePriceBreakdown, TradePriceBreakdown } from 'views/Swap/V3Swap/utils/exchange'

export interface BridgeOrderFee extends TradePriceBreakdown {
  type: OrderType
}

export function computeBridgeOrderFee(order: BridgeOrderWithCommands): BridgeOrderFee | BridgeOrderFee[] {
  if (!order.commands) {
    return {
      priceImpactWithoutFee: undefined,
      lpFeeAmount: undefined,
      type: OrderType.PCS_BRIDGE,
    }
  }

  return order.commands.map((command) => {
    if (command.type === OrderType.PCS_BRIDGE) {
      return {
        // TODO: add price impact for bridge
        priceImpactWithoutFee: undefined,
        lpFeeAmount: order.bridgeFee,
        type: command.type,
      }
    }

    const o = isXOrder(command) ? command.ammTrade : command?.trade

    return {
      ...computeTradePriceBreakdown(o),
      type: command.type,
    }
  })
}
