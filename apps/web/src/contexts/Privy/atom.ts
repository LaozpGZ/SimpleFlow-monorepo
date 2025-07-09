import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const privySocialLoginAtom = atomWithStorage<boolean>('pcs:privySocialLogin', false, undefined, {
  unstable_getOnInit: true,
})

export function usePrivySocialLoginAtom() {
  return useAtom(privySocialLoginAtom)
}

export const walletModalAtom = atom<boolean>(false)

export function useWalletModalAtom() {
  return useAtom(walletModalAtom)
}
