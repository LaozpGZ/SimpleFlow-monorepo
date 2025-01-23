import { ChainId } from '@pancakeswap/chains'

export interface IDOConfig {
  id: string
  version: number
  projectUrl: string
  chainId: ChainId
  description: string
}
export const idos: IDOConfig[] = [
  {
    id: 'myshell',
    version: 8,
    projectUrl: 'https://myshell.ai/',
    chainId: ChainId.BSC,
    description:
      'MyShell is building an AI consumer layer that connects users, creators, and open-source AI researchers.',
  },
]
