import { atom } from 'jotai'
import { TonAddress } from './ton.types'

export const addressAtom = atom<TonAddress>('')

export const isConnectedAtom = atom((get) => {
  return Boolean(get(addressAtom))
})
