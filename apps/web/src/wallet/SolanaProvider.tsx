import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { initialize } from '@solflare-wallet/wallet-adapter'
import { useSetAtom } from 'jotai'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
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

  useEffect(() => {
    if (!connected) return undefined

    const wallet = window?.trustwallet?.solana
    if (!wallet) return undefined

    console.info('[TW] provider', wallet)
    console.info('[TW] Wallet connected, attaching listener')

    const handleAccountChange = async (newAccount: any) => {
      const accountStr = newAccount?.toBase58?.() || null
      console.info(`[TW] Wallet account changed → ${accountStr || 'null'} (forcing reload)`)
      safeGetWindow()?.location.reload()
    }

    wallet.on('accountChanged', handleAccountChange)

    return () => wallet.off('accountChanged', handleAccountChange)
  }, [connected])

  return null
}
