import { atom } from 'jotai'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { atomWithQuery } from 'jotai-tanstack-query'
import { FAST_INTERVAL } from 'config/constants'
import { inputCurrencyAtom, outputCurrencyAtom, quoteCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { independentFieldAtom, fieldBeforeCustomPriceAtom } from './fieldAtoms'

export const customMarketPriceAtom = atom<CurrencyAmount<Currency> | undefined>(undefined)
export const setCustomMarketPriceAtom = atom(null, async (get, set, value: string) => {
  const outputCurrency = await get(outputCurrencyAtom)

  if (!outputCurrency) return

  const outputAmount = tryParseCurrencyAmount(value, outputCurrency)

  if (outputAmount) {
    const currentIndependentField = get(independentFieldAtom)
    const currentFieldBeforeCustomPrice = get(fieldBeforeCustomPriceAtom)

    // Only store the field if we haven't set a custom price before
    if (currentFieldBeforeCustomPrice === null) {
      set(fieldBeforeCustomPriceAtom, currentIndependentField)
    }

    set(customMarketPriceAtom, outputAmount)
  }
})

// Atom to clear custom market price and reset field state
export const clearCustomMarketPriceAtom = atom(null, (get, set) => {
  set(customMarketPriceAtom, undefined)
  set(fieldBeforeCustomPriceAtom, null)
})

// Current market price, with refetch
export const currentMarketPriceAtom = atomWithQuery((get) => ({
  queryKey: [get(inputCurrencyAtom), get(outputCurrencyAtom), get(selectedPoolAtom)],
  queryFn: async () => {
    const inputCurrency = await get(inputCurrencyAtom)
    const outputCurrency = await get(outputCurrencyAtom)
    const selectedPool = await get(selectedPoolAtom)

    if (!selectedPool || !inputCurrency || !outputCurrency) return undefined

    const { pool, routingSdkPool } = selectedPool

    const independentAmount = tryParseCurrencyAmount('1', inputCurrency)
    if (!independentAmount) return undefined

    const gasPriceWei = await get(gasPriceWeiAtom(pool.chainId))

    const bestTrade = await findBestTrade({
      amount: independentAmount,
      quoteCurrency: outputCurrency,
      tradeType: TradeType.EXACT_INPUT,
      candidatePools: [routingSdkPool],
      gasPriceWei: gasPriceWei?.toString() || '',
      maxHops: 1,
      maxSplits: 0,
      quoteId: `limit-order-${Date.now()}`,
    })

    const outputAmount = bestTrade?.outputAmountWithGasAdjusted
    return outputAmount
  },
  refetchInterval: FAST_INTERVAL,
  retry: 3,
  retryDelay: 2_000,
}))

// Final Market Price considering user-entered price OR pool's price
export const marketPriceAtom = atom(async (get) => {
  const { data: currentMarketPrice } = get(currentMarketPriceAtom)
  const customMarketPrice = get(customMarketPriceAtom)

  if (customMarketPrice) return customMarketPrice
  if (currentMarketPrice) return currentMarketPrice

  return undefined
})
