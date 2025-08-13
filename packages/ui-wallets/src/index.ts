export { MultichainWalletModal } from './components/MultichainWalletModal/MultichainWalletModal'
export type { MultichainWalletModalProps } from './components/MultichainWalletModal/types'

// reexport legacy wallet modal
export { previouslyUsedWalletsAtom as legacyPreviouslyUsedWalletsAtom } from './components/LegacyWalletModal/atom'
export { WalletModalV2 as LegacyWalletModal } from './components/LegacyWalletModal/WalletModal'
export type { WalletModalV2Props as LegacyWalletModalProps } from './components/LegacyWalletModal/types'
export type { WalletConfigV2 as LegacyWalletConfig } from './types'
export { WalletIds as LegacyWalletIds } from './components/LegacyWalletModal/legacyWalletIds'
export * from './error'
