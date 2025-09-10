import { atom } from 'jotai'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'

export const typedValueAtom = atom('')
export const independentFieldAtom = atom(Field.CURRENCY_A)
// Track the field that was independent before custom price was set
export const fieldBeforeCustomPriceAtom = atom<Field | null>(null)
