import { Currency, Native, UnifiedCurrency } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import isEqual from 'lodash/isEqual'
import { currencyAtom } from 'hooks/Tokens'
import currencyId from 'utils/currencyId'
import { Field } from '../types/limitOrder.types'

// TODO: Sync with Query State (inputCurrency & outputCurrency, like swap). Idea: Create -> locationAtom and atomWithUrlQuery
const baseCurrencyFamily = atomFamily((chainId: number) => atom(Native.onChain(chainId).symbol), isEqual)
const quoteCurrencyFamily = atomFamily((chainId: number) => atom(CAKE[chainId].address), isEqual)

// Currency Id atoms
export const baseCurrencyIdAtom = atom(
  (get) => {
    const { chainId } = get(accountActiveChainAtom)
    return get(baseCurrencyFamily(chainId ?? 56))
  },
  (get, set, newValue: string) => {
    const { chainId } = get(accountActiveChainAtom)
    set(baseCurrencyFamily(chainId ?? 56), newValue)
  },
)

export const quoteCurrencyIdAtom = atom(
  (get) => {
    const { chainId } = get(accountActiveChainAtom)
    return get(quoteCurrencyFamily(chainId ?? 56))
  },
  (get, set, newValue: string) => {
    const { chainId } = get(accountActiveChainAtom)
    set(quoteCurrencyFamily(chainId ?? 56), newValue)
  },
)

// Currency Atoms
export const baseCurrencyAtom = atom((get) => get(currencyAtom(get(baseCurrencyIdAtom))))
export const quoteCurrencyAtom = atom((get) => get(currencyAtom(get(quoteCurrencyIdAtom))))

// Flip currencies
export const flipCurrenciesAtom = atom(null, (get, set) => {
  const idA = get(baseCurrencyIdAtom)
  const idB = get(quoteCurrencyIdAtom)

  set(baseCurrencyIdAtom, idB)
  set(quoteCurrencyIdAtom, idA)
})

// Set currency for a Field
export const setCurrencyAtom = atom(
  null,
  async (get, set, { field, newCurrency }: { field: Field; newCurrency: UnifiedCurrency }) => {
    const newId = currencyId(newCurrency)

    const otherCurrency = field === Field.INPUT ? await get(quoteCurrencyAtom) : await get(baseCurrencyAtom)

    // TODO: Check if any other validation needed
    if (otherCurrency && newCurrency.equals(otherCurrency)) {
      // Flip Currencies
      set(flipCurrenciesAtom)
      return
    }

    if (field === Field.INPUT) set(baseCurrencyIdAtom, newId)
    else set(quoteCurrencyIdAtom, newId)
  },
)
