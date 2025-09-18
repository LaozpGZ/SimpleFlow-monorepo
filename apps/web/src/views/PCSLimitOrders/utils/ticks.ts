import { Currency, Price } from '@pancakeswap/sdk'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { BigNumber as BN } from 'bignumber.js'
import { bigNumberToPrice } from './price'

export function invertTickForLimitOrder(tick: number, currentTick: number) {
  return 2 * currentTick - tick
}

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
  zeroForOne?: boolean,
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

  // If zeroForOne is set, calculate and return sqrt price
  if (zeroForOne !== undefined) {
    const nextTick = zeroForOne ? tick + tickSpacing : tick - tickSpacing
    const nextPrice = tickToPrice(baseCurrency, quoteCurrency, nextTick)
    if (!nextPrice) {
      console.error('getTickAdjustedPrice: No price found for given tick', {
        tick,
        tickSpacing,
      })
      return { tick, price: priceFromTick }
    }
    const sqrtPrice = BN(priceFromTick.toFixed(18))
      .multipliedBy(BN(nextPrice.toFixed(18)))
      .sqrt()

    // Convert BigNumber to Price<Currency, Currency>
    const parsedSqrtPrice = bigNumberToPrice(sqrtPrice, baseCurrency, quoteCurrency)
    return { tick, price: parsedSqrtPrice }
  }

  return { tick, price: priceFromTick }
}
