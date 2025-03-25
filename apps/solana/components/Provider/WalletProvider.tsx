import { useMemo } from 'react'
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useTheme } from 'next-themes'

export const WalletProvider: React.FC<React.PropsWithChildren<{ children: React.ReactNode }>> = ({ children }) => {
  const { resolvedTheme } = useTheme()
  const wallets = useMemo(() => [new SolflareWalletAdapter()], [])

  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        env: 'mainnet-beta',
        autoConnect: true,
        walletlistExplanation: {
          href: 'https://station.jup.ag/docs/additional-topics/wallet-list',
        },
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
        metadata: {
          name: 'UnifiedWallet',
          description: 'UnifiedWallet',
          url: 'https://jup.ag',
          iconUrls: ['https://jup.ag/favicon.ico'],
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  )
}
