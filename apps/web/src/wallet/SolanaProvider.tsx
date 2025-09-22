import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { initialize } from '@solflare-wallet/wallet-adapter'
import { useSetAtom } from 'jotai'
import { accountActiveChainAtom } from './atoms/accountStateAtoms'

initialize()

export const SolanaWalletStateUpdater = () => {
  const { connected, connecting, publicKey, disconnect } = useWallet()
  const setWalletState = useSetAtom(accountActiveChainAtom)

  useEffect(() => {
    const solanaAccount = publicKey?.toBase58() || null
    setWalletState((prev) => {
      return { ...prev, solanaAccount }
    })
  }, [connected, connecting, publicKey, setWalletState])

  useEffect(() => {
    const handleAccountChange = async () => {
      if (connected) {
        try {
          await disconnect()
        } catch (err) {
          console.error('Failed to disconnect Solana wallet:', err)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('accountChange#pcs', handleAccountChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('accountChange#pcs', handleAccountChange)
      }
    }
  }, [connected, disconnect])

  return null
}
