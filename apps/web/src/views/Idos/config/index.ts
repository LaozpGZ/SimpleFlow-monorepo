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
      'MyShell is an AI creator platform for everyone to build, share, and own AI agents. Our vision is to create a unified platform that provides product-driven value for web2 users and offers the crypto community participating ownership in practical AI applications, bridging the gap between frontier AI applications and blockchain technology.',
  },
}
