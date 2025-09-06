import { atom } from 'jotai'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { Field } from '../types/limitOrder.types'
import { inputCurrencyAtom, outputCurrencyAtom } from './currency/currencyAtoms'
import { independentFieldAtom, typedValueAtom } from './fieldAtoms'

const baseCurrencyAtom = atom((get) =>
  get(independentFieldAtom) === Field.CURRENCY_A ? get(inputCurrencyAtom) : get(outputCurrencyAtom),
)
const quoteCurrencyAtom = atom((get) =>
  get(independentFieldAtom) === Field.CURRENCY_A ? get(outputCurrencyAtom) : get(inputCurrencyAtom),
)

const independentAmountAtom = atom(async (get) => {
  const value = get(typedValueAtom)
  const currency = await get(baseCurrencyAtom)
  return tryParseAmount(value, currency)
})

const dependentAmountAtom = atom(async (get) => {
  const independentAmount = await get(independentAmountAtom)

  const quoteCurrency = await get(quoteCurrencyAtom)

  const result = independentAmount ? +independentAmount?.toExact() * 2 : 2

  // Testing
  return tryParseAmount(result.toString(), quoteCurrency)
})

export const formattedAmountsAtom = atom(async (get) => {
  const independentField = get(independentFieldAtom)

  const typedValue = get(typedValueAtom)

  if (!typedValue) {
    return {
      [Field.CURRENCY_A]: '',
      [Field.CURRENCY_B]: '',
    }
  }

  const dependentAmount = await get(dependentAmountAtom)
  const formattedDependentAmount = formatAmount(dependentAmount)

  return {
    [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? typedValue : formattedDependentAmount,
    [Field.CURRENCY_B]: independentField === Field.CURRENCY_B ? typedValue : formattedDependentAmount,
  }
})

/// Setters
export const setInputAtom = atom(null, (_get, set, { field, value }: { field: Field; value: string | undefined }) => {
  set(typedValueAtom, value ?? '')
  set(independentFieldAtom, field)
})
