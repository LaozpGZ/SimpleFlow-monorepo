import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { SPLToken } from '@pancakeswap/swap-sdk-core'

// Atom to store the list of SPLToken
export const solanaTokenListAtom = atom<SPLToken[]>([])

// AtomFamily to get a token by address from the list
export const solanaTokenAtomFamily = atomFamily((address?: string) =>
  atom((get) => (address ? get(solanaTokenListAtom).find((token) => token.address === address) : undefined)),
)

// Dynamic atom to manage Solana list settings
// This will automatically support any new token list keys added to SOLANA_LISTS
export const solanaListSettingsAtom = atom<Record<string, boolean>>({
  raydium: true,
  jupiter: true,
  // New token lists will be added here automatically when they're first accessed
})
