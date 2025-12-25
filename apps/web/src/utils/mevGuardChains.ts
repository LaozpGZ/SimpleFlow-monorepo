import type { Chain } from 'viem'
import { bsc } from 'viem/chains'

export const BSCMevGuardChain = {
  ...bsc,
  rpcUrls: {
    default: {
      http: ['https://bscrpc.simpleflow.finance'],
    },
  },
  name: 'PancakeSwap MEV Guard',
} satisfies Chain
