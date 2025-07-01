import { createConfig } from '@privy-io/wagmi'
import { bsc, bscTestnet, sepolia } from 'viem/chains'
import { http } from 'wagmi'

export const supportedChains = [sepolia, bscTestnet, bsc] as const

export const config = createConfig({
  chains: supportedChains,
  transports: {
    [bscTestnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
  },
})
