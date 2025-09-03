import { Native } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { atom } from 'jotai'
import { atomWithSearchParams } from 'jotai-location'
import { atomFamily } from 'jotai/utils'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'

// Issue: Not sure if it's because of atomWithSearchParams or not,
// but the query value are read but then removed from the url
const inputCurrencyFamily = atomFamily((chainId: number) =>
  atomWithSearchParams('inputCurrency', Native.onChain(chainId).symbol),
)
const outputCurrencyFamily = atomFamily((chainId: number) =>
  atomWithSearchParams('outputCurrency', CAKE[chainId].address),
)

export const inputCurrencyIdAtom = atom(
  (get) => {
    const { chainId } = get(accountActiveChainAtom)
    return get(inputCurrencyFamily(chainId ?? 56))
  },
  (get, set, newValue: string) => {
    const { chainId } = get(accountActiveChainAtom)
    set(inputCurrencyFamily(chainId ?? 56), newValue)
  },
)

export const outputCurrencyIdAtom = atom(
  (get) => {
    const { chainId } = get(accountActiveChainAtom)
    return get(outputCurrencyFamily(chainId ?? 56))
  },
  (get, set, newValue: string) => {
    const { chainId } = get(accountActiveChainAtom)
    set(outputCurrencyFamily(chainId ?? 56), newValue)
  },
)
