import { BridgeOrder } from '@pancakeswap/price-api-sdk'
import { Percent } from '@pancakeswap/swap-sdk-core'

export function computeBridgeOrderFee(order: BridgeOrder) {
  return {
    priceImpactWithoutFee: new Percent(0, 100),
    lpFeeAmount: order.bridgeFee,
  }
}
