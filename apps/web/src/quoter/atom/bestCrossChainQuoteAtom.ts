import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { QuoteQuery } from 'quoter/quoter.types'
import { bestQuoteAtom } from './bestQuoteAtom'

export const bestCrossChainQuoteAtom = atomFamily((_option: QuoteQuery) => {
  return atom((get) => {
    return get(bestQuoteAtom(_option))
  })
})
