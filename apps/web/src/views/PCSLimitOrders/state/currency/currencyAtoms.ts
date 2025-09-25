import { Native } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import isEqual from 'lodash/isEqual'
import { currencyAtom } from 'hooks/Tokens'
import { createLoadableAtom } from 'views/PCSLimitOrders/utils/createLoadableAtom'

// TODO: Sync with Query State (inputCurrency & outputCurrency, like swap). Idea: Create -> locationAtom and atomWithUrlQuery
const inputCurrencyFamily = atomFamily((chainId: number) => atom(Native.onChain(chainId).symbol), isEqual)
const outputCurrencyFamily = atomFamily((chainId: number) => atom(CAKE[chainId].address), isEqual)

// Currency Id atoms
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

// Currency Atoms
export const inputCurrencyAtom = atom((get) => get(currencyAtom(get(inputCurrencyIdAtom))))
export const outputCurrencyAtom = atom((get) => get(currencyAtom(get(outputCurrencyIdAtom))))

// Loadable versions of currency atoms
export const inputCurrencyLoadableAtom = createLoadableAtom(inputCurrencyAtom)
export const outputCurrencyLoadableAtom = createLoadableAtom(outputCurrencyAtom)
