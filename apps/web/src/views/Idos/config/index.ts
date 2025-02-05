import { ChainId } from '@pancakeswap/chains'
import type { Address } from 'viem'

export type IDOConfig = {
  id: string
  version: number
  projectUrl: string
  chainId: ChainId
  description: string
  contractAddress: Address
}

export const idoConfigDict: Record<string, IDOConfig> = {
  myshell: {
    id: 'myshell',
    version: 8,
    projectUrl: 'https://myshell.ai/',
    chainId: ChainId.BSC,
    contractAddress: '0x',
    description:
      'MyShell is building an AI consumer layer that connects users, creators, and open-source AI researchers.',
  },
}
