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
  {
    id: ChainId.SIMPLECHAIN,
    name: chainNames[ChainId.SIMPLECHAIN],
    fullName: chainFullNames[ChainId.SIMPLECHAIN],
    isEVM: true,
  },
  { id: ChainId.LINEA, name: chainNames[ChainId.LINEA], fullName: chainFullNames[ChainId.LINEA], isEVM: true },
  {
    id: ChainId.SIMPLECHAIN_TESTNET,
    name: chainNames[ChainId.SIMPLECHAIN_TESTNET],
    fullName: chainFullNames[ChainId.SIMPLECHAIN_TESTNET],
    isEVM: true,
    testnet: true,
  },
  {
    id: ChainId.LINEA_TESTNET,
    name: chainNames[ChainId.LINEA_TESTNET],
    fullName: chainFullNames[ChainId.LINEA_TESTNET],
    isEVM: true,
    testnet: true,
  },
]
