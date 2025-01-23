import { ChainId } from '@pancakeswap/chains'

export interface IDOConfig {
  id: string
  version: number
  projectUrl: string
  chainId: ChainId
}
export const idos: IDOConfig[] = [
  {
    id: 'myshell',
    version: 8,
    projectUrl: 'https://myshell.ai/',
    chainId: ChainId.BSC,
  },
]
