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
    pool: { tickSpacing, tickCurrent },
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

  // Calculate tickLower and tickUpper
  const zeroForOne = tickCurrent > targetTick

  const tickLower = zeroForOne ? targetTick : targetTick - tickSpacing
  const tickUpper = zeroForOne ? targetTick + tickSpacing : targetTick

  const priceLower = tickToPrice(inputCurrency, outputCurrency, tickLower)
  const priceUpper = tickToPrice(inputCurrency, outputCurrency, tickUpper)

  return { tickLower, tickUpper, priceLower, priceUpper }
})
