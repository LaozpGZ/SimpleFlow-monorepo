import { ChainId, NonEVMChainId, chainNames } from '@pancakeswap/chains'
import memoize from '@pancakeswap/utils/memoize'
import {
  Chain,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  bscTestnet,
  goerli,
  linea,
  mainnet,
  monadTestnet,
  opBNB,
  opBNBTestnet,
  scrollSepolia,
  sepolia,
  zksync,
} from 'wagmi/chains'

export const CHAIN_QUERY_NAME = chainNames

const CHAIN_QUERY_NAME_TO_ID = Object.entries(CHAIN_QUERY_NAME).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName.toLowerCase()]: chainId as unknown as ChainId,
    ...acc,
  }
}, {} as Record<string, ChainId>)

export const getChainId = memoize((chainName: string) => {
  if (!chainName) return undefined
  return CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()] ? +CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()] : undefined
})

// SimpleChain 主网 (Chain ID: 1913)
const simplechain: Chain = {
  id: ChainId.BSC, // 1913
  name: 'SimpleChain',
  nativeCurrency: { name: 'SRW', symbol: 'SRW', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.simplechain.com'] },
    public: { http: ['https://rpc.simplechain.com'] },
  },
  blockExplorers: {
    default: { name: 'SimpleChain Explorer', url: 'https://explorer.simplechain.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: false,
}

// SimpleChain 测试网 (Chain ID: 1914)
const simplechainTestnet: Chain = {
  id: ChainId.LINEA_TESTNET, // 1914
  name: 'SimpleChain Testnet',
  nativeCurrency: { name: 'SRW', symbol: 'SRW', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.simplechain.com'] },
    public: { http: ['https://testnet-rpc.simplechain.com'] },
  },
  blockExplorers: {
    default: { name: 'SimpleChain Testnet Explorer', url: 'https://testnet-explorer.simplechain.com' },
  },
  contracts: {
    multicall3: {
      address: '0xC005b39086AF12248eA2507C22b0e38f0463a79b',
    },
  },
  testnet: true,
}

const MONAD_RPC_URLS = [
  'https://rpc.monad.xyz',
  'https://rpc1.monad.xyz',
  'https://rpc3.monad.xyz',
  'https://rpc-mainnet.monadinfra.com',
  process.env.NEXT_PUBLIC_MONAD_RPC,
  process.env.NEXT_PUBLIC_MONAD_BACKUP_RPC,
].filter(Boolean) as [string, ...string[]]

const monad: Chain = {
  id: ChainId.MONAD_MAINNET,
  name: 'Monad',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: MONAD_RPC_URLS },
    public: { http: MONAD_RPC_URLS },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url: 'https://monadvision.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x8553AA1615549A86882151784b329B017aA7c832',
    },
  },
  testnet: false,
}

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS: ChainId[] = [
  ChainId.ARBITRUM_ONE,
  ChainId.ARBITRUM_GOERLI,
  ChainId.ZKSYNC,
  ChainId.ZKSYNC_TESTNET,
  ChainId.LINEA_TESTNET,
  ChainId.LINEA,
  ChainId.BASE,
  ChainId.BASE_TESTNET,
  ChainId.OPBNB,
  ChainId.OPBNB_TESTNET,
  ChainId.ARBITRUM_SEPOLIA,
  ChainId.BASE_SEPOLIA,
  ChainId.MONAD_MAINNET,
]

export const CHAINS: [Chain, ...Chain[]] = [
  simplechain,
  simplechainTestnet,
  bscTestnet,
  mainnet,
  goerli,
  sepolia,
  zksync,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  linea,
  base,
  baseGoerli,
  baseSepolia,
  opBNB,
  opBNBTestnet,
  scrollSepolia,
  monad,
  monadTestnet,
]

// Minimal Solana chain descriptor for explorer and non‑EVM utilities
export const SOLANA_CHAIN = {
  id: NonEVMChainId.SOLANA,
  blockExplorers: {
    default: { name: 'Solscan', url: 'https://solscan.io' },
  },
} as const
