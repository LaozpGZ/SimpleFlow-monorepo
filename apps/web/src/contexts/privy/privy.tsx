import { PrivyProvider as Provider } from '@privy-io/react-auth'
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets'
import { PropsWithChildren } from 'react'

import { useFirebaseAuth } from './firebase'
import { supportedChains } from './wagmi/config'

export function PrivyProvider({ children }: PropsWithChildren) {
  const { isLoading, getToken } = useFirebaseAuth()

  return (
    <Provider
      appId="cm9jd1prg03msl80mz1jnuv9f"
      clientId="client-WY5iumRXNUjYdviuz7nf3m3z3atS4iHaRMWLTekR5Qpjp"
      config={{
        defaultChain: supportedChains[0],
        customAuth: {
          isLoading,
          getCustomAccessToken: getToken,
        },
        supportedChains: supportedChains as any,
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
          showWalletUIs: true,
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
