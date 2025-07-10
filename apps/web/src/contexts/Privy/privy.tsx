'use client'

import { PrivyProvider as Provider } from '@privy-io/react-auth'
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets'
import { PropsWithChildren } from 'react'

import { CHAINS } from 'config/chains'
import { useFirebaseAuth } from './firebase'

export function PrivyProvider({ children }: PropsWithChildren) {
  const { isLoading, getToken } = useFirebaseAuth()

  return (
    <Provider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? ''}
      config={{
        defaultChain: CHAINS[0],
        customAuth: {
          isLoading,
          getCustomAccessToken: getToken,
        },
        supportedChains: CHAINS,
        appearance: {
          accentColor: '#6A6FF5',
          theme: '#222224',
          showWalletLoginFirst: false,
          logo: 'https://auth.privy.io/logos/privy-logo-dark.png',
          walletChainType: 'ethereum-only',
          walletList: ['detected_wallets', 'metamask'],
        },
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
        embeddedWallets: {
          requireUserPasswordOnCreate: true,
          showWalletUIs: false,
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          solana: {
            createOnLogin: 'off',
          },
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
        externalWallets: {},
      }}
    >
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </Provider>
  )
}
