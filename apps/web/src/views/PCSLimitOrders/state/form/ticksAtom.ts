import { atom } from 'jotai'
import { tickToPrice } from 'hooks/infinity/utils'
import {
  getSqrtPriceFromMarketPrice,
  getTickAdjustedPrice,
  invertTickForLimitOrder,
} from 'views/PCSLimitOrders/utils/ticks'
import { nearestUsableTick } from '@pancakeswap/v3-sdk'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { customMarketPriceAtom } from './customMarketPriceAtom'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

/**
 * Ticks derived from current/custom market price
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

  const sqrtPriceData = getSqrtPriceFromMarketPrice(
    marketPrice,
    inputCurrency,
    outputCurrency,
    tickSpacing,
    tickCurrent,
    zeroForOne,
  )
  if (!sqrtPriceData) return undefined

  const { sqrtPrice, tickLower, tickUpper, priceLower, priceUpper, targetTick, isSellingOrBuyingAtWorsePrice } =
    sqrtPriceData

  // Calculated inverted ticks
  // INVERTED needed only if selling/buying at a Bad price. Keeping it for support just in case
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
