// import { WagmiProvider as Provider } from '@privy-io/wagmi'
import { PropsWithChildren } from 'react'
import { type WagmiProviderProps, WagmiProvider as Provider } from 'wagmi'

export function WagmiProvider({ children, ...props }: PropsWithChildren<WagmiProviderProps>) {
  return <Provider {...props}>{children}</Provider>
}
