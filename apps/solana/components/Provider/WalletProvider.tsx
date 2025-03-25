import { useMemo } from 'react'
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter'
import { SolflareWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets'

export const WalletProvider: React.FC<React.PropsWithChildren<{ children: React.ReactNode }>> = ({ children }) => {
  const wallets = useMemo(() => [new UnsafeBurnerWalletAdapter(), new SolflareWalletAdapter()], [])
  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        env: 'mainnet-beta',
        autoConnect: true,
        metadata: {
          name: 'Pancakeswap',
          description: '',
          url: 'https://pancakeswap.finance/',
          iconUrls: [''],
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  )
}
