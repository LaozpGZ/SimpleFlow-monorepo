import { atom } from 'jotai'
import { BigNumber as BN } from 'bignumber.js'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { formatPrice } from '@pancakeswap/utils/formatFractions'
import { DEFAULT_PERCENTAGE_MAP } from 'views/PCSLimitOrders/constants'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { currentMarketPriceAtom, customMarketPriceAtom } from './marketPriceAtoms'

export const differencePercentageAtom = atom(async (get) => {
  const customMarketPrice = get(customMarketPriceAtom)
  if (!customMarketPrice) return undefined

  const currentMarketPrice = await get(currentMarketPriceAtom)
  if (!currentMarketPrice) return undefined

  if (customMarketPrice === currentMarketPrice) return undefined

  const customMarketPriceBN = BN(customMarketPrice)
  const currentMarketPriceBN = BN(currentMarketPrice)

  const difference = customMarketPriceBN.minus(currentMarketPriceBN)
  const percentage = difference.dividedBy(currentMarketPriceBN).multipliedBy(100)

  return percentage.toFormat(2)
})

export const setPercentDifferenceAtom = atom(null, async (get, set, percent: number) => {
  if (!percent) return

  const currentMarketPrice = await get(currentMarketPriceAtom)
  if (!currentMarketPrice) return

  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return

  const selectedPool = await get(selectedPoolAtom)
  if (!selectedPool) return

  const calculatedPrice = BN(currentMarketPrice).multipliedBy(BN(1).plus(BN(percent).dividedBy(100)))

  // Get nearest tick to calculated price
  const price = tryParsePrice(inputCurrency, outputCurrency, calculatedPrice.toFormat(6))
  if (!price) {
    console.error("Couldn't parse price for percent difference")
    return
  }

  const tick = tryParseTick(price, selectedPool?.pool.tickSpacing)

  if (!tick) {
    console.error("Couldn't parse tick for percent difference")
    return
  }

  const adjustedPrice = tickToPrice(inputCurrency, outputCurrency, tick)

  set(customMarketPriceAtom, formatPrice(adjustedPrice, 6))
})

// Preset percentage values
// For example, if selecting 1% results in tick-adjusted price at 0.98%, then 1% button should
// be considered active if percentage is 0.98%
export const presetPercentMapAtom = atom(async (get) => {
  const currentMarketPrice = await get(currentMarketPriceAtom)
  if (!currentMarketPrice) return DEFAULT_PERCENTAGE_MAP

  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return DEFAULT_PERCENTAGE_MAP

  const selectedPool = await get(selectedPoolAtom)
  if (!selectedPool) return DEFAULT_PERCENTAGE_MAP

  const percentages = Object.keys(DEFAULT_PERCENTAGE_MAP)

  const percentMap: Record<keyof typeof DEFAULT_PERCENTAGE_MAP, string> = DEFAULT_PERCENTAGE_MAP

  percentages.forEach((percent) => {
    const calculatedPrice = BN(currentMarketPrice).multipliedBy(BN(1).plus(BN(percent).dividedBy(100)))

    const price = tryParsePrice(inputCurrency, outputCurrency, calculatedPrice.toFormat(6))
    if (!price) {
      console.error("Couldn't parse price for Preset percent difference")
      return
    }

    const tick = tryParseTick(price, selectedPool?.pool.tickSpacing)
    if (!tick) {
      console.error("Couldn't parse tick for Preset percent difference")
      return
    }

    const newPrice = tickToPrice(inputCurrency, outputCurrency, tick)

    // Find the proper percentage now
    const newPriceFormatted = formatPrice(newPrice, 6)
    if (!newPriceFormatted) return
    const difference = BN(newPriceFormatted).minus(currentMarketPrice)
    const newPercentage = BN(difference).dividedBy(currentMarketPrice).multipliedBy(100)

    percentMap[percent] = newPercentage.toFormat(2)
  })

  return percentMap
})
