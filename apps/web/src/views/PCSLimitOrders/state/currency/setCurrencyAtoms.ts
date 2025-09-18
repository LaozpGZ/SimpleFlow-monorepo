import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { atom } from 'jotai'

import currencyId from 'utils/currencyId'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { independentFieldAtom } from 'views/PCSLimitOrders/state/form/fieldAtoms'
import { outputCurrencyAtom, inputCurrencyAtom, inputCurrencyIdAtom, outputCurrencyIdAtom } from './currencyAtoms'
import { customMarketPriceAtom } from '../form/customMarketPriceAtom'

export const setCurrencyAtom = atom(
  null,
  async (get, set, { field, newCurrency }: { field: Field; newCurrency: UnifiedCurrency }) => {
    const newId = currencyId(newCurrency)

    const otherCurrency = field === Field.CURRENCY_A ? await get(outputCurrencyAtom) : await get(inputCurrencyAtom)

    // TODO: Check if any other validation needed
    if (otherCurrency && newCurrency.equals(otherCurrency)) {
      // Flip Currencies
      set(flipCurrenciesAtom)
      return
    }

    // Clear custom market price when currency changes since it's no longer valid
    set(customMarketPriceAtom, undefined)

    if (field === Field.CURRENCY_A) set(inputCurrencyIdAtom, newId)
    else set(outputCurrencyIdAtom, newId)
  },
)

export const flipCurrenciesAtom = atom(null, (get, set) => {
  const idA = get(inputCurrencyIdAtom)
  const idB = get(outputCurrencyIdAtom)
  const independentField = get(independentFieldAtom)

  // Clear custom market price when currencies are flipped since the price direction changes
  set(customMarketPriceAtom, undefined)

  set(inputCurrencyIdAtom, idB)
  set(outputCurrencyIdAtom, idA)
  set(independentFieldAtom, independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A)
})
