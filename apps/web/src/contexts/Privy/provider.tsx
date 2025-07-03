import { WagmiProvider as Provider } from '@privy-io/wagmi'
import { PropsWithChildren } from 'react'
import { type WagmiProviderProps } from 'wagmi'

export function WagmiWithPrivyProvider({ children, ...props }: PropsWithChildren<WagmiProviderProps>) {
  return <Provider {...props}>{children}</Provider>
}
