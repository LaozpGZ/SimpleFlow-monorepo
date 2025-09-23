import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { initialize } from '@solflare-wallet/wallet-adapter'
import { useSetAtom } from 'jotai'
import { accountActiveChainAtom } from './atoms/accountStateAtoms'

initialize()

export const SolanaWalletStateUpdater = () => {
  const { connected, connecting, publicKey } = useWallet()
  const setWalletState = useSetAtom(accountActiveChainAtom)

  useEffect(() => {
    const solanaAccount = publicKey?.toBase58() || null
    setWalletState((prev) => {
      return { ...prev, solanaAccount }
    })
  }, [connected, connecting, publicKey, setWalletState])

  return null
}
