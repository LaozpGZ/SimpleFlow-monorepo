import { atom } from 'jotai'
import { WalletConfigV2, WalletIds } from './types'

export const errorAtom = atom<string>('')

export const selectedWalletAtom = atom<WalletConfigV2<unknown> | null>(null)

export const lastUsedWalletNameAtom = atom('', (get, set, update: WalletIds) => {
  const list = get(previouslyUsedWalletsAtom)
  set(previouslyUsedWalletsAtom, [update, ...list.filter((i) => i !== update)])
})

export const previouslyUsedWalletsKey = 'previous-used-wallets'
const previouslyUsedWalletsStoreSeparator = ','

export const previouslyUsedWalletsAtom = atom([] as WalletIds[], (_get, set, update: WalletIds[]) => {
  set(previouslyUsedWalletsAtom, update)
  if (update && Array.isArray(update)) {
    localStorage?.setItem(previouslyUsedWalletsKey, update.join(previouslyUsedWalletsStoreSeparator))
  }
})

previouslyUsedWalletsAtom.onMount = (set) => {
  const preferred = localStorage?.getItem(previouslyUsedWalletsKey)
  if (preferred) {
    set(preferred.split(previouslyUsedWalletsStoreSeparator) as WalletIds[])
  }
}
