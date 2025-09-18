import { atom } from 'jotai'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { BigNumber as BN } from 'bignumber.js'
import { invertTickForLimitOrder } from 'views/PCSLimitOrders/utils/ticks'
import { nearestUsableTick } from '@pancakeswap/v3-sdk'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { currentMarketPriceAtom, customMarketPriceAtom } from './marketPriceAtoms'
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
  const currentMarketPrice = await get(currentMarketPriceAtom)
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

  // Calculate tickLower and tickUpper
  const tickLower = zeroForOne ? targetTick : targetTick - tickSpacing
  const tickUpper = zeroForOne ? targetTick + tickSpacing : targetTick

  // To determine if selling or buying at worse price, need quoting ticks and not inverted ticks
  const isSellingOrBuyingAtWorsePrice = zeroForOne ? tickLower <= tickCurrent : tickUpper >= tickCurrent

  const priceLower = tickToPrice(inputCurrency, outputCurrency, tickLower)
  const priceUpper = tickToPrice(inputCurrency, outputCurrency, tickUpper)

  // Price = sqrt(priceLower * priceUpper)
  const price = BN(priceLower.toFixed(18))
    .multipliedBy(BN(priceUpper.toFixed(18)))
    .sqrt()

  // Calculate Limit Order ticks (opposite direction to pool)
  const invertedTickLower = nearestUsableTick(invertTickForLimitOrder(tickUpper, tickCurrent), tickSpacing)
  const invertedTickUpper = nearestUsableTick(invertTickForLimitOrder(tickLower, tickCurrent), tickSpacing)
  const invertedTargetTick = zeroForOne ? invertedTickUpper : invertedTickLower

  // FOR TESTING
  const invertedPriceLower = tickToPrice(inputCurrency, outputCurrency, invertedTickLower)
  const invertedPriceUpper = tickToPrice(inputCurrency, outputCurrency, invertedTickUpper)
  const invertedPrice = BN(invertedPriceLower.toFixed(18))
    .multipliedBy(BN(invertedPriceUpper.toFixed(18)))
    .sqrt()

  console.log('ticksAtom', {
    tickLower,
    tickUpper,
    invertedTickLower,
    invertedTickUpper,
    invertedTargetTick,
    tickCurrent,
    targetTick,
    zeroForOne,
    price: price.toFormat(6),
    invertedPrice: invertedPrice.toFormat(6),
  })

  return {
    price,
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
  }
})
