import { atom } from 'jotai'
import { CrossChainOrderData } from '../types'

export const crossChainOrderDataAtom = atom<CrossChainOrderData>({
  status: null,
  order: null,
  originalOrder: null,
  steps: [],
  resultInformation: undefined,
})

export const crossChainOrderStatus = atom((get) => get(crossChainOrderDataAtom).status)
