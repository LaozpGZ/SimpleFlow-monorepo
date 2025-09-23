import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const WalletAccountListener = () => {
  const { wallet, disconnect } = useWallet()

  useEffect(() => {
    if (!wallet || wallet.adapter?.name !== 'Trust') return undefined

    const trustSolana = window?.trustwallet?.solana
    if (!trustSolana) return undefined

    const handleAccountChanged = async (newAccount: any) => {
      const accountStr = newAccount?.toBase58?.() || null
      console.info('Wallet account changed:', accountStr)
      await disconnect()
    }

    trustSolana.on('accountChanged', handleAccountChanged)

    return () => {
      trustSolana.off('accountChanged', handleAccountChanged)
    }
  }, [wallet, disconnect])

  return null
}

export default WalletAccountListener
