import { atom } from 'jotai'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { BigNumber as BN } from 'bignumber.js'
import { getTickAdjustedPrice, invertTickForLimitOrder } from 'views/PCSLimitOrders/utils/ticks'
import { nearestUsableTick } from '@pancakeswap/v3-sdk'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { customMarketPriceAtom } from './customMarketPriceAtom'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

/**
 * Ticks in pool's perspective.
 * NOT according to limit order ticks, which are going to be opposite to pool's direction
 */
export const ticksAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return undefined

  const selectedPool = await get(selectedPoolAtom)
  if (!selectedPool || !selectedPool.pool) return undefined

  const {
    pool: { tickSpacing, tickCurrent },
    zeroForOne,
  } = selectedPool

  // Get price for limit order
  const customMarketPrice = get(customMarketPriceAtom)

  // Get Current Market Price from Pool's tick
  const tickCurrentPrice = tickToPrice(inputCurrency, outputCurrency, tickCurrent)
  const tickAdjustedPrice = getTickAdjustedPrice(
    tickCurrentPrice.toFixed(18),
    tickSpacing,
    inputCurrency,
    outputCurrency,
    zeroForOne,
  )
  const currentMarketPrice = tickAdjustedPrice.price?.toFixed(18)

  const marketPrice = customMarketPrice || currentMarketPrice
  if (!marketPrice) return undefined

  // Get limit order tick from price
  const parsedPrice = tryParsePrice(inputCurrency, outputCurrency, marketPrice)
  if (!parsedPrice) return undefined

  let targetTick = tryParseTick(parsedPrice, tickSpacing)
  if (!targetTick) return undefined

  // If current tick is between targetTick and its next tick, adjust it depending on direction
  if (targetTick <= tickCurrent && targetTick + tickSpacing >= tickCurrent) {
    if (zeroForOne) targetTick += tickSpacing
    else targetTick -= tickSpacing
  }

  // Calculate tickLower and tickUpper (Already correct for placing limit order)
  const tickLower = zeroForOne ? targetTick : targetTick - tickSpacing
  const tickUpper = zeroForOne ? targetTick + tickSpacing : targetTick

  // To determine if selling or buying at worse price, if worse, would need inverted ticks (disable this case in UI anyways)
  const isSellingOrBuyingAtWorsePrice = zeroForOne ? tickLower <= tickCurrent : tickUpper >= tickCurrent

  const priceLower = tickToPrice(inputCurrency, outputCurrency, tickLower)
  const priceUpper = tickToPrice(inputCurrency, outputCurrency, tickUpper)

  // Sqrt price = sqrt(priceLower * priceUpper)
  const sqrtPrice = BN(priceLower.toFixed(18))
    .multipliedBy(BN(priceUpper.toFixed(18)))
    .sqrt()

  // Calculated inverted ticks
  // INVERTED needed only if selling/buying at BAD price
  // Can consider removing this altogether, or keeping it to support bad prices just in case
  const invertedTickLower = nearestUsableTick(invertTickForLimitOrder(tickUpper, tickCurrent), tickSpacing)
  const invertedTickUpper = nearestUsableTick(invertTickForLimitOrder(tickLower, tickCurrent), tickSpacing)
  const invertedTargetTick = zeroForOne ? invertedTickUpper : invertedTickLower

  return {
    sqrtPrice,
    tickLower,
    tickUpper,
    priceLower,
    priceUpper,
    targetTick,
    zeroForOne,
    invertedTickLower,
    invertedTickUpper,
    invertedTargetTick,
    isSellingOrBuyingAtWorsePrice,
    currentMarketPrice,
  }
})
