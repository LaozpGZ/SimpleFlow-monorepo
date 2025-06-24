import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { SolflareWalletAdapter, initialize } from '@solflare-wallet/wallet-adapter'
import {
  PhantomWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
  MathWalletAdapter,
  TokenPocketWalletAdapter,
  CoinbaseWalletAdapter,
  SolongWalletAdapter,
  Coin98WalletAdapter,
  SafePalWalletAdapter,
  BitpieWalletAdapter,
  BitgetWalletAdapter
} from '@solana/wallet-adapter-wallets'

import { type Adapter, type WalletError } from '@solana/wallet-adapter-base'
import { sendWalletEvent } from '@/api/event'
import { useEvent } from '@/hooks/useEvent'
// import { LedgerWalletAdapter } from './Ledger/LedgerWalletAdapter'
import { useAppStore, defaultEndpoint } from '../store/useAppStore'

initialize()

const App: FC<PropsWithChildren<any>> = ({ children }) => {
  const rpcNodeUrl = useAppStore((s) => s.rpcNodeUrl)
  const wsNodeUrl = useAppStore((s) => s.wsNodeUrl)
  const [endpoint, setEndpoint] = useState<string>(rpcNodeUrl || defaultEndpoint)

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SlopeWalletAdapter({ endpoint }),
      new TorusWalletAdapter(),
      // new LedgerWalletAdapter(),
      new GlowWalletAdapter(),
      new TrustWalletAdapter(),
      new MathWalletAdapter({ endpoint }),
      new TokenPocketWalletAdapter(),
      new CoinbaseWalletAdapter({ endpoint }),
      new SolongWalletAdapter({ endpoint }),
      new Coin98WalletAdapter({ endpoint }),
      new SafePalWalletAdapter({ endpoint }),
      new BitpieWalletAdapter({ endpoint }),
      new BitgetWalletAdapter({ endpoint }),
      new ExodusWalletAdapter({ endpoint })
    ],
    [endpoint]
  )

  useEffect(() => {
    if (rpcNodeUrl) setEndpoint(rpcNodeUrl)
  }, [rpcNodeUrl])

  const onWalletError = useEvent((error: WalletError, adapter?: Adapter) => {
    if (!adapter) return
    sendWalletEvent({
      type: 'connectWallet',
      walletName: adapter.name,
      connectStatus: 'failure',
      errorMsg: error.message || error.stack
    })
  })

  return (
    <ConnectionProvider endpoint={endpoint} config={{ disableRetryOnRateLimit: true, wsEndpoint: wsNodeUrl }}>
      <WalletProvider wallets={wallets} onError={onWalletError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
