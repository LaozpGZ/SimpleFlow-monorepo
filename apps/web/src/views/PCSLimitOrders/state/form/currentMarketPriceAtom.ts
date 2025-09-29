import { atom } from 'jotai'
import { getSqrtPriceFromCurrentTick } from 'views/PCSLimitOrders/utils/ticks'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
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

  const { sqrtPrice } = getSqrtPriceFromCurrentTick({
    zeroForOne,
    tickCurrent,
    tickSpacing,
    inputCurrency,
    outputCurrency,
  })

  if (!sqrtPrice.isFinite() || sqrtPrice.isZero()) return '0'

  return sqrtPrice.toFixed(6)
})
