import { ChainId } from '@pancakeswap/chains'
import { getNodeRealUrl } from 'utils/node/nodeReal'
import { getGroveUrl } from 'utils/node/pokt'
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  bscTestnet,
  linea,
  monadTestnet,
  opBNB,
  opBNBTestnet,
  scrollSepolia,
  sepolia,
  zksync,
  zksyncSepoliaTestnet,
} from 'wagmi/chains'

const MONAD_RPC_URLS = [
  process.env.NEXT_PUBLIC_MONAD_RPC,
  process.env.NEXT_PUBLIC_MONAD_BACKUP_RPC,
  'https://rpc-mainnet.monadinfra.com',
  'https://rpc.monad.xyz',
  'https://rpc1.monad.xyz',
  'https://rpc3.monad.xyz',
].filter(Boolean) as [string, ...string[]]

const ARBITRUM_NODES = [
  ...arbitrum.rpcUrls.default.http,
  'https://arbitrum-one.publicnode.com',
  'https://arbitrum.llamarpc.com',
].filter(Boolean)

export const SERVER_NODES = {
  [ChainId.BSC]: [
    'https://rpc.simplechain.com',
  ],
  [ChainId.BSC_TESTNET]: bscTestnet.rpcUrls.default.http,
  [ChainId.ETHEREUM]: [
    getNodeRealUrl(ChainId.ETHEREUM, process.env.SERVER_NODE_REAL_API_ETH) || '',
    'https://ethereum.publicnode.com',
    'https://eth.llamarpc.com',
    // Remove cloudflare-eth.com, seems it returns wrong gas_estimation for some reason
    // 'https://cloudflare-eth.com',
  ],
  [ChainId.GOERLI]: [
    getNodeRealUrl(ChainId.GOERLI, process.env.SERVER_NODE_REAL_API_GOERLI) || '',
    'https://eth-goerli.public.blastapi.io',
  ].filter(Boolean),
  [ChainId.ARBITRUM_ONE]: ARBITRUM_NODES,
  [ChainId.ARBITRUM_GOERLI]: arbitrumGoerli.rpcUrls.default.http,
  [ChainId.ZKSYNC]: [
    ...zksync.rpcUrls.default.http,
    getNodeRealUrl(ChainId.ZKSYNC, process.env.SERVER_NODE_REAL_API_ETH) || '',
  ].filter(Boolean),
  [ChainId.ZKSYNC_TESTNET]: zksyncSepoliaTestnet.rpcUrls.default.http,
  [ChainId.LINEA]: linea.rpcUrls.default.http,
  [ChainId.LINEA_TESTNET]: [
    'https://testnet-rpc.simplechain.com',
  ],
  [ChainId.OPBNB_TESTNET]: opBNBTestnet.rpcUrls.default.http,
  [ChainId.OPBNB]: [
    ...opBNB.rpcUrls.default.http,
    getNodeRealUrl(ChainId.OPBNB, process.env.SERVER_NODE_REAL_API_ETH) || '',
  ].filter(Boolean),
  [ChainId.BASE]: [
    'https://base.publicnode.com',
    // process.env.NEXT_PUBLIC_NODE_REAL_BASE_PRODUCTION,
    ...base.rpcUrls.default.http,
  ],
  [ChainId.BASE_TESTNET]: baseGoerli.rpcUrls.default.http,
  [ChainId.SCROLL_SEPOLIA]: scrollSepolia.rpcUrls.default.http,
  [ChainId.SEPOLIA]: sepolia.rpcUrls.default.http,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia.rpcUrls.default.http,
  [ChainId.BASE_SEPOLIA]: baseSepolia.rpcUrls.default.http,
  [ChainId.MONAD_MAINNET]: MONAD_RPC_URLS,
  [ChainId.MONAD_TESTNET]: [
    'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6',
    ...monadTestnet.rpcUrls.default.http,
  ],
} satisfies Partial<Record<ChainId, readonly string[]>>

export const PUBLIC_NODES: Partial<Record<ChainId, readonly string[]>> = {
  [ChainId.BSC]: [
    'https://rpc.simplechain.com',
  ] as readonly string[],
  [ChainId.BSC_TESTNET]: bscTestnet.rpcUrls.default.http,
  [ChainId.ETHEREUM]: [
    getNodeRealUrl(ChainId.ETHEREUM, process.env.NEXT_PUBLIC_NODE_REAL_API_ETH) || '',
    process.env.NEXT_PUBLIC_NODIES_ETH || '',
    // getGroveUrl(ChainId.ETHEREUM, process.env.NEXT_PUBLIC_GROVE_API_KEY) || '',
    'https://ethereum.publicnode.com',
    'https://eth.llamarpc.com',
    // Remove cloudflare-eth.com
    // for cross-chain swap, it will use the wrong gas_estimation for some reason
    // 'https://cloudflare-eth.com',
  ].filter(Boolean) as readonly string[],
  [ChainId.GOERLI]: [
    getNodeRealUrl(ChainId.GOERLI, process.env.NEXT_PUBLIC_NODE_REAL_API_GOERLI) || '',
    'https://eth-goerli.public.blastapi.io',
  ].filter(Boolean) as readonly string[],
  [ChainId.ARBITRUM_ONE]: [
    ...ARBITRUM_NODES,
    process.env.NEXT_PUBLIC_NODIES_ARB || '',
    getNodeRealUrl(ChainId.ARBITRUM_ONE, process.env.NEXT_PUBLIC_NODE_REAL_API_ETH) || '',
    // getGroveUrl(ChainId.ARBITRUM_ONE, process.env.NEXT_PUBLIC_GROVE_API_KEY) || '',
  ].filter(Boolean) as readonly string[],
  [ChainId.ARBITRUM_GOERLI]: arbitrumGoerli.rpcUrls.default.http,
  [ChainId.ZKSYNC]: [
    ...zksync.rpcUrls.default.http,
    getNodeRealUrl(ChainId.ZKSYNC, process.env.NEXT_PUBLIC_NODE_REAL_API_ETH) || '',
  ].filter(Boolean) as readonly string[],
  [ChainId.ZKSYNC_TESTNET]: zksyncSepoliaTestnet.rpcUrls.default.http,
  [ChainId.LINEA]: linea.rpcUrls.default.http,
  [ChainId.LINEA_TESTNET]: [
    'https://testnet-rpc.simplechain.com',
  ],
  [ChainId.OPBNB_TESTNET]: opBNBTestnet.rpcUrls.default.http,
  [ChainId.OPBNB]: [
    ...opBNB.rpcUrls.default.http,
    getNodeRealUrl(ChainId.OPBNB, process.env.NEXT_PUBLIC_NODE_REAL_API_ETH) || '',
    'https://opbnb.publicnode.com',
  ].filter(Boolean) as readonly string[],
  [ChainId.BASE]: [
    'https://base.publicnode.com',
    process.env.NEXT_PUBLIC_NODIES_BASE || '',
    // getGroveUrl(ChainId.BASE, process.env.NEXT_PUBLIC_GROVE_API_KEY) || '',
    // process.env.NEXT_PUBLIC_NODE_REAL_BASE_PRODUCTION,
    'https://base.llamarpc.com',
    'https://base.meowrpc.com',
    ...base.rpcUrls.default.http,
  ].filter(Boolean) as readonly string[],
  [ChainId.BASE_TESTNET]: baseGoerli.rpcUrls.default.http,
  [ChainId.SCROLL_SEPOLIA]: scrollSepolia.rpcUrls.default.http,
  [ChainId.SEPOLIA]: sepolia.rpcUrls.default.http,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia.rpcUrls.default.http,
  [ChainId.BASE_SEPOLIA]: baseSepolia.rpcUrls.default.http,
  [ChainId.MONAD_MAINNET]: MONAD_RPC_URLS,
  [ChainId.MONAD_TESTNET]: [
    'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6',
    ...monadTestnet.rpcUrls.default.http,
  ],
} satisfies Partial<Record<ChainId, readonly string[]>>
