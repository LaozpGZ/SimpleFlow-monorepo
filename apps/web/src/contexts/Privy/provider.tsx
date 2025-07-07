import { WagmiProvider as Provider } from '@privy-io/wagmi'
import { PropsWithChildren } from 'react'
import { type WagmiProviderProps } from 'wagmi'

export function WagmiWithPrivyProvider({ children, ...props }: PropsWithChildren<WagmiProviderProps>) {
  // const { authenticated, ready } = usePrivy()

  // if ((ready && authenticated) || true) {
  return <Provider {...props}>{children}</Provider>
  // }

  // return <WagmiProvider {...props}>{children}</WagmiProvider>
}
