import { ChainId } from '@pancakeswap/chains'
import { getNodeRealUrl } from 'utils/node/nodeReal'
import { getGroveUrl } from 'utils/node/pokt'

export const SERVER_NODES = {
  [ChainId.BSC]: [
    getNodeRealUrl(ChainId.BSC, process.env.SERVER_NODE_REAL_API_ETH) || '',
    process.env.NEXT_PUBLIC_NODE_PRODUCTION || '',
    getGroveUrl(ChainId.BSC, process.env.NEXT_PUBLIC_GROVE_API_KEY) || '',
    'https://bsc.publicnode.com',
    // 'https://binance.llamarpc.com',
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed1.bnbchain.org',
  ].filter(Boolean),
  [ChainId.BSC_TESTNET]: [
    'https://bsc-testnet-dataseed.bnbchain.org',
    'https://bsc-testnet.bnbchain.org',
    'https://bsc-prebsc-dataseed.bnbchain.org',
  ],
  [ChainId.SIMPLECHAIN_TESTNET]: ['https://testnet-rpc.simplechain.com'],
} satisfies Partial<Record<ChainId, readonly string[]>>

export const PUBLIC_NODES: Partial<Record<ChainId, readonly string[]>> = {
  [ChainId.BSC]: [
    process.env.NEXT_PUBLIC_NODE_PRODUCTION || '',
    getNodeRealUrl(ChainId.BSC, process.env.NEXT_PUBLIC_NODE_REAL_API_ETH) || '',
    process.env.NEXT_PUBLIC_NODIES_BSC || '',
    // getGroveUrl(ChainId.BSC, process.env.NEXT_PUBLIC_GROVE_API_KEY) || '',
    'https://bsc.publicnode.com',
    // 'https://binance.llamarpc.com',
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed1.bnbchain.org',
  ].filter(Boolean) as readonly string[],
  [ChainId.BSC_TESTNET]: [
    getNodeRealUrl(ChainId.BSC_TESTNET, process.env.SERVER_NODE_REAL_API_ETH) || '',
    'https://bsc-testnet-dataseed.bnbchain.org',
    'https://bsc-testnet.bnbchain.org',
    'https://bsc-prebsc-dataseed.bnbchain.org',
  ].filter(Boolean) as readonly string[],
  [ChainId.SIMPLECHAIN_TESTNET]: ['https://testnet-rpc.simplechain.com'],
} satisfies Partial<Record<ChainId, readonly string[]>>
