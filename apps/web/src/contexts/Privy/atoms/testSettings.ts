import { atomWithStorage } from 'jotai/utils'

// Developer/test settings for Privy wallet behavior
export const forceEmbeddedWalletAtom = atomWithStorage('pcs:forceEmbeddedWallet', false)

// Additional test settings can be added here
export const testSettingsAtom = atomWithStorage('pcs:testSettings', {
  forceEmbeddedWallet: false,
  showDebugInfo: false,
})

export type TestSettings = {
  forceEmbeddedWallet: boolean
  showDebugInfo: boolean
}
