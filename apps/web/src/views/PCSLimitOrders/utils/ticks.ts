import { Currency } from '@pancakeswap/sdk'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'

/**
 * Get price adjusted to the nearest tick
 * @param price - Price to adjust, in string format
 * @param tickSpacing - Tick spacing
 * @param baseCurrency - Base currency
 * @param quoteCurrency - Quote currency
 * @returns Tick and price, if found
 */
export function getTickAdjustedPrice(
  price: string,
  tickSpacing: number,
  baseCurrency: Currency,
  quoteCurrency: Currency,
) {
  const price_ = tryParsePrice(baseCurrency, quoteCurrency, price)
  if (!price_) {
    console.error('getTickAdjustedPrice: No price found for given value', {
      price,
      tickSpacing,
      baseCurrency,
      quoteCurrency,
    })
    return { tick: undefined, price: undefined }
  }

  // Get closest tick
  const tick = tryParseTick(price_, tickSpacing)
  if (!tick) {
    console.error('getTickAdjustedPrice: No tick found for given price', {
      price,
      price_,
      tickSpacing,
      baseCurrency,
      quoteCurrency,
    })
    return { tick: undefined, price: price_ }
  }
  // Get price from tick
  const priceFromTick = tickToPrice(baseCurrency, quoteCurrency, tick)
  if (!priceFromTick) {
    console.error('getTickAdjustedPrice: No price found for given tick', {
      price,
      price_,
      tick,
      tickSpacing,
      baseCurrency,
      quoteCurrency,
    })
    return { tick, price: price_ }
  }

  return { tick, price: priceFromTick }
}
