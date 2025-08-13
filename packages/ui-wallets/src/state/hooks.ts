import { useAtom, useAtomValue } from 'jotai'
import { previouslyUsedWalletsAtom, selectedEvmWalletAtom, selectedSolanaWalletAtom, selectedWalletAtom } from './atom'

export const useSelectedWallet = () => {
  return useAtomValue(selectedWalletAtom)
}

export const usePreviouslyUsedWallets = () => {
  return useAtomValue(previouslyUsedWalletsAtom)
}

export const useSelectedEvmWallet = () => {
  return useAtom(selectedEvmWalletAtom)
}

export const useSelectedSolanaWallet = () => {
  return useAtom(selectedSolanaWalletAtom)
}
