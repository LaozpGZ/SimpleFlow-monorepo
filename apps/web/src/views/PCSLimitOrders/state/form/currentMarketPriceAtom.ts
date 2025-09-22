import { atom } from 'jotai'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { getSqrtPriceFromMarketPrice, getTickAdjustedPrice } from 'views/PCSLimitOrders/utils/ticks'
import { tickToPrice } from 'hooks/infinity/utils'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/selectedPoolAtom'

export const currentMarketPriceAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return undefined

  const { data: selectedPool } = get(selectedPoolAtom)
  if (!selectedPool || !selectedPool.pool) return undefined

  const {
    pool: { tickSpacing, tickCurrent },
    zeroForOne,
  } = selectedPool

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

  if (!currentMarketPrice) return undefined

  const sqrtPriceData = getSqrtPriceFromMarketPrice(
    currentMarketPrice,
    inputCurrency,
    outputCurrency,
    tickSpacing,
    tickCurrent,
    zeroForOne,
  )
  if (!sqrtPriceData) return undefined

  const { sqrtPrice } = sqrtPriceData

  if (!sqrtPrice.isFinite() || sqrtPrice.isZero()) return undefined

  return formatNumber(sqrtPrice, {
    maxDecimalDisplayDigits: 6,
    maximumSignificantDigits: 6,
  })
})
