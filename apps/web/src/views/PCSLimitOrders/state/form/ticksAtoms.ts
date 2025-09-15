import { atom } from 'jotai'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { currentMarketPriceAtom, customMarketPriceAtom } from './marketPriceAtoms'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

export const ticksAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return undefined

  const selectedPool = await get(selectedPoolAtom)
  if (!selectedPool || !selectedPool.pool) return undefined

  const {
    pool: { tickSpacing },
  } = selectedPool

  // Get price for limit order
  const customMarketPrice = get(customMarketPriceAtom)
  const { data: currentMarketPrice } = get(currentMarketPriceAtom)
  const marketPrice = customMarketPrice || currentMarketPrice
  if (!marketPrice) return undefined

  // Get limit order tick from price
  const price = tryParsePrice(inputCurrency, outputCurrency, marketPrice)
  if (!price) return undefined

  const targetTick = tryParseTick(price, tickSpacing)
  if (!targetTick) return undefined

  const tickLower = targetTick
  const tickUpper = targetTick + tickSpacing

  const priceLower = tickToPrice(inputCurrency, outputCurrency, tickLower)
  const priceUpper = tickToPrice(inputCurrency, outputCurrency, tickUpper)

  // Calculate tickLower and tickUpper
  // const zeroForOne = tickCurrent > targetTick

  // TODO: Verify this logic if we need to consider direction at all
  // const tickLower = zeroForOne ? targetTick : targetTick - tickSpacing
  // const tickUpper = zeroForOne ? targetTick + tickSpacing : targetTick

  // Special Case: current tick is between targetTick and targetTick + tickSpacing
  // if (targetTick < tickCurrent && tickCurrent < targetTick + tickSpacing) {
  //   return { tickLower: targetTick, tickUpper: targetTick + tickSpacing }
  // }

  return { tickLower, tickUpper, priceLower, priceUpper }
})
