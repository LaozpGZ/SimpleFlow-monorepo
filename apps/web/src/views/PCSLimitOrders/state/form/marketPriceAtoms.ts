import { atom } from 'jotai'
import { tickToPrice } from 'hooks/infinity/utils'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { BigNumber as BN } from 'bignumber.js'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/poolAtoms'

export const customMarketPriceAtom = atom<string | undefined>(undefined)

// Current market price, with refetch
export const currentMarketPriceAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)
  const selectedPool = await get(selectedPoolAtom)

  if (!selectedPool || !inputCurrency || !outputCurrency) return undefined

  const { pool } = selectedPool

  // Price from pool tick
  const priceFromPoolTick = tickToPrice(inputCurrency, outputCurrency, pool.tickCurrent)

  // TODO: If near tickCurrent, tick-adjust according to zeroForOne

  if (priceFromPoolTick) {
    return formatNumber(BN(priceFromPoolTick.toFixed(18)), {
      maxDecimalDisplayDigits: 6,
      maximumSignificantDigits: 6,
    })
  }

  return undefined
})
