import { ChainId, NonEVMChainId, chainNames } from '@pancakeswap/chains'
import memoize from '@pancakeswap/utils/memoize'
import { Chain } from 'wagmi/chains'

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

const SIMPLECHAIN_RPC_URLS = ['https://testnet-rpc.simplechain.com', process.env.NEXT_PUBLIC_SIMPLECHAIN_RPC].filter(
  Boolean,
) as [string, ...string[]]

const simplechain: Chain = {
  id: ChainId.MONAD_MAINNET,
  name: 'SimpleChain',
  nativeCurrency: { name: 'SRW', symbol: 'SRW', decimals: 18 },
  rpcUrls: {
    default: { http: SIMPLECHAIN_RPC_URLS },
    public: { http: SIMPLECHAIN_RPC_URLS },
  },
  blockExplorers: {
    default: {
      name: 'SimpleChain Explorer',
      url: 'https://testnet-explorer.simplechain.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: false,
}

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS: ChainId[] = [ChainId.MONAD_MAINNET]

export const CHAINS: [Chain, ...Chain[]] = [simplechain]

// Minimal Solana chain descriptor for explorer and non‑EVM utilities
export const SOLANA_CHAIN = {
  id: NonEVMChainId.SOLANA,
  blockExplorers: {
    default: { name: 'Solscan', url: 'https://solscan.io' },
  },
} as const
