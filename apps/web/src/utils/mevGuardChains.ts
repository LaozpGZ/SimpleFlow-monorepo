import type { Chain } from 'viem'
import { bsc } from 'viem/chains'

export const BSCMevGuardChain = {
  ...bsc,
  rpcUrls: {
    default: {
      http: ['https://bscrpc.simpleflow.finance'],
    },
  },
  name: 'SimpleFlow MEV Guard',
} satisfies Chain
