import { usePrivy } from '@privy-io/react-auth'
import { WagmiProvider as Provider } from '@privy-io/wagmi'
import { PropsWithChildren } from 'react'
import { type WagmiProviderProps, WagmiProvider } from 'wagmi'

export function WagmiWithPrivyProvider({ children, ...props }: PropsWithChildren<WagmiProviderProps>) {
  const { authenticated, ready } = usePrivy()

  if (ready && authenticated) {
    return <Provider {...props}>{children}</Provider>
  }

  return <WagmiProvider {...props}>{children}</WagmiProvider>
}
