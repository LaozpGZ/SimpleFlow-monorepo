import { ChainId } from '@pancakeswap/chains'
import {
  arbitrum,
  base,
  mainnet as ethereum,
  // linea,
  // opBNB,
  zksync,
  type Chain,
} from 'wagmi/chains'

// SimpleChain 主网定义
export const simplechain: Chain = {
  id: 1913,
  name: 'SimpleChain',
  nativeCurrency: {
    decimals: 18,
    name: 'SRW',
    symbol: 'SRW',
  },
  rpcUrls: {
    default: { http: ['https://rpc.simplechain.com'] },
    public: { http: ['https://rpc.simplechain.com'] },
  },
  blockExplorers: {
    default: { name: 'SimpleChain Explorer', url: 'https://explorer.simplechain.com' },
  },
}

// SimpleChain 测试网定义
export const simplechainTestnet: Chain = {
  id: 1914,
  name: 'SimpleChain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tSRW',
    symbol: 'tSRW',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.simplechain.com'] },
    public: { http: ['https://testnet-rpc.simplechain.com'] },
  },
  blockExplorers: {
    default: { name: 'SimpleChain Testnet Explorer', url: 'https://testnet-explorer.simplechain.com' },
  },
  testnet: true,
}

export const SUPPORT_ONLY_SIMPLECHAIN = [ChainId.SIMPLECHAIN]

export const targetChains = [
  ethereum,
  simplechain,
  zksync,
  arbitrum,
  base,
  // linea,
  // opBNB,
]

export const predictionTaskSupportChains = [simplechain]

export const SUPPORTED_CHAIN = [
  ChainId.ETHEREUM,
  ChainId.SIMPLECHAIN,
  ChainId.ZKSYNC,
  ChainId.ARBITRUM_ONE,
  ChainId.BASE,
  // ChainId.LINEA,
  // ChainId.OPBNB,
]
