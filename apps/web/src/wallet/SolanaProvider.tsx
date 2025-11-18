import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { initialize } from '@solflare-wallet/wallet-adapter'
import { useSetAtom } from 'jotai'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
import { PublicKey } from '@solana/web3.js'
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

    const trustWallet = window?.trustwallet?.solana
    if (!trustWallet) return undefined

    const trustPublicKey = trustWallet.publicKey ? new PublicKey(trustWallet.publicKey.toBytes()) : null
    if (!trustPublicKey || !publicKey || !trustPublicKey.equals(publicKey)) {
      console.info('[TW] Public keys do not match', {
        adapterPublicKey: publicKey?.toBase58(),
        trustPublicKey: trustPublicKey?.toBase58(),
      })
      return undefined
    }

    console.info('[TW] provider', trustWallet)
    console.info('[TW] Wallet connected, attaching listener')

    const handleAccountChange = async (newAccount: any) => {
      const accountStr = newAccount?.toBase58?.() || null
      console.info(`[TW] Wallet account changed → ${accountStr || 'null'} (forcing reload)`)
      safeGetWindow()?.location.reload()
    }

    trustWallet.on('accountChanged', handleAccountChange)

    return () => trustWallet.off('accountChanged', handleAccountChange)
  }, [connected, publicKey])

  return null
}
