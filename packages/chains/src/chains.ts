import { ChainId, UnifiedChainId } from './chainId'
import { chainNames, chainFullNames } from './chainNames'

export interface Chain {
  id: UnifiedChainId
  name: string
  fullName: string
  isEVM: boolean
  testnet?: boolean
}

export const Chains: Chain[] = [
  { id: ChainId.BSC, name: chainNames[ChainId.BSC], fullName: chainFullNames[ChainId.BSC], isEVM: true },
  {
    id: ChainId.BSC_TESTNET,
    name: chainNames[ChainId.BSC_TESTNET],
    fullName: chainFullNames[ChainId.BSC_TESTNET],
    isEVM: true,
    testnet: true,
  },
  {
    id: ChainId.SIMPLECHAIN_TESTNET,
    name: chainNames[ChainId.SIMPLECHAIN_TESTNET],
    fullName: chainFullNames[ChainId.SIMPLECHAIN_TESTNET],
    isEVM: true,
    testnet: true,
  },
]
