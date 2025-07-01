import { isTestnetChainId } from '@pancakeswap/chains'
import { Currency, getCurrencyAddress } from '@pancakeswap/sdk'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { usdPriceBatcher } from 'utils/batcher'
import { useMemo } from 'react'
import { useStablecoinPrice } from './useStablecoinPrice'

type Config = {
  enabled?: boolean
}

export function useCurrencyUsdPrice(
  currency: Currency | undefined | null,
  { enabled = true }: Config = {},
): { data: number } {
  const price = useStablecoinPrice(currency, { enabled })
  return useMemo(() => {
    if (!price) return { data: 0, isLoading: true }
    return {
      data: parseFloat(price.greaterThan(1) ? price.toSignificant(6) : price.toSignificant(9)),
      isLoading: false,
    }
  }, [price])
}

export const currencyUSDPriceAtom = atomFamily(
  (currency?: Currency) => {
    return atom(() => {
      if (!currency) {
        throw new Error('No currency provided')
      }
      if (isTestnetChainId(currency?.chainId)) {
        return 0
      }
      return usdPriceBatcher.fetch(currency)
    })
  },
  (a, b) => {
    if (a === b) {
      return true
    }
    if (!a || !b) {
      return false
    }
    return getCurrencyAddress(a) === getCurrencyAddress(b)
  },
)

export const currenciesUSDPriceAtom = atomFamily(
  (currencies: Currency[]) => {
    return atom(async (get) => {
      return Promise.all(currencies.map((currency) => get(currencyUSDPriceAtom(currency))))
    })
  },
  (a, b) => {
    if (a === b) {
      return true
    }
    if (a.length !== b.length) {
      return false
    }
    return a.every((currency, index) => getCurrencyAddress(currency) === getCurrencyAddress(b[index]))
  },
)
