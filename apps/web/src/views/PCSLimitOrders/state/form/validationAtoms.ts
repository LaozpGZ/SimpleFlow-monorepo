import { atom } from 'jotai'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { formattedAmountsAtom } from './inputAtoms'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

export const commitButtonEnabledAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return false

  const formattedAmounts = await get(formattedAmountsAtom)

  return formattedAmounts[Field.CURRENCY_A] && formattedAmounts[Field.CURRENCY_B]
})
