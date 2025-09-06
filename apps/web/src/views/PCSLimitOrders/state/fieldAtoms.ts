import { atom } from 'jotai'
import { Field } from '../types/limitOrder.types'

export const typedValueAtom = atom('')
export const independentFieldAtom = atom(Field.CURRENCY_A)
