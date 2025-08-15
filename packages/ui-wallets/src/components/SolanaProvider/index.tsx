import { useMemo } from 'react'
import { Adapter, WalletError } from '@solana/wallet-adapter-base'
import { SolflareWalletAdapter, WalletConnectWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { walletConnectConfig } from './walletConnect.config'

export type SolanaProviderProps = React.PropsWithChildren<{
  endpoint: string
}>

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children, endpoint }) => {
  const walletConnectAdapter = useMemo(() => {
    const connectWallet: WalletConnectWalletAdapter[] = []
    try {
      connectWallet.push(new WalletConnectWalletAdapter(walletConnectConfig))
    } catch (e) {
      // console.error('WalletConnect error', e)
    }
    return connectWallet
  }, [])

  const onWalletError = (error: WalletError, adapter?: Adapter) => {
    // if (!adapter) return
  }

  // list of wallet adapter that not support WalletStandard
  const walletsAdapter = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new SlopeWalletAdapter({ endpoint }),
      ...walletConnectAdapter,
      new GlowWalletAdapter(),
      new ExodusWalletAdapter({ endpoint }),
    ],
    [endpoint, walletConnectAdapter],
  )

  return (
    <ConnectionProvider endpoint={endpoint} config={{ disableRetryOnRateLimit: true }}>
      <WalletProvider autoConnect onError={onWalletError} wallets={walletsAdapter}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}
