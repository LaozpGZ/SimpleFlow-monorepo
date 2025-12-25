import { ChainId } from '@simpleflow/chains'

export const PANCAKE_EXTENDED = 'https://tokens.simpleflow.finance/pancakeswap-extended.json'

const COINGECKO_BSC = 'https://tokens.coingecko.com/binance-smart-chain/all.json'
const COINGECKO_ARB = 'https://tokens.coingecko.com/arbitrum-one/all.json'
const COINGECKO_BASE = 'https://tokens.coingecko.com/base/all.json'
const COINGECKO_LINEA = 'https://tokens.coingecko.com/linea/all.json'
const PANCAKE_ONDO_RWA_LIST = 'https://tokens.simpleflow.finance/ondo-rwa-tokens.json'
export const RWA_URLS = [PANCAKE_ONDO_RWA_LIST]

export const PANCAKE_ETH_DEFAULT = 'https://tokens.simpleflow.finance/pancakeswap-eth-default.json'
export const PANCAKE_ZKSYNC_DEFAULT = 'https://tokens.simpleflow.finance/pancakeswap-zksync-default.json'
export const PANCAKE_ARB_DEFAULT = 'https://tokens.simpleflow.finance/pancakeswap-arbitrum-default.json'
export const PANCAKE_LINEA_DEFAULT = 'https://tokens.simpleflow.finance/pancakeswap-linea-default.json'
export const PANCAKE_BASE_DEFAULT = 'https://tokens.simpleflow.finance/pancakeswap-base-default.json'
export const PANCAKE_OPBNB_DEFAULT = 'https://tokens.simpleflow.finance/pancakeswap-opbnb-default.json'
export const PANCAKE_SOLANA_DEFAULT = 'https://tokens.simpleflow.finance/pancakeswap-solana-default.json'
// SimpleChain - 暂无官方代币列表，使用空数组
export const PANCAKE_SIMPLECHAIN_DEFAULT = '' // SimpleChain Mainnet
export const PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT = '' // SimpleChain Testnet

const COINGECKO_ETH = 'https://tokens.coingecko.com/uniswap/all.json'
// export const CMC = 'https://tokens.simpleflow.finance/cmc.json' // not updated for a while

const ETH_URLS = [PANCAKE_ETH_DEFAULT, COINGECKO_ETH, ...RWA_URLS]
const BSC_URLS = [PANCAKE_EXTENDED, COINGECKO_BSC, ...RWA_URLS]
const ARBITRUM_URLS = [PANCAKE_ARB_DEFAULT, COINGECKO_ARB]
const LINEA_URLS = [PANCAKE_LINEA_DEFAULT, COINGECKO_LINEA]
const ZKSYNC_URLS = [
  PANCAKE_ZKSYNC_DEFAULT,
  // 'https://tokens.coingecko.com/zksync/all.json'
]
const OP_SUPER_CHAIN_URL =
  'https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json'
const BASE_URLS = [PANCAKE_BASE_DEFAULT, OP_SUPER_CHAIN_URL, COINGECKO_BASE]
const OPBNB_URLS = [PANCAKE_OPBNB_DEFAULT]
const SIMPLECHAIN_URLS: string[] = [] // SimpleChain - 暂无代币列表
const SIMPLECHAIN_TESTNET_URLS: string[] = [] // SimpleChain - 暂无代币列表

// List of official tokens list
export const OFFICIAL_LISTS = [
  PANCAKE_EXTENDED,
  PANCAKE_ETH_DEFAULT,
  PANCAKE_ZKSYNC_DEFAULT,
  PANCAKE_ARB_DEFAULT,
  PANCAKE_LINEA_DEFAULT,
  PANCAKE_BASE_DEFAULT,
  PANCAKE_OPBNB_DEFAULT,
  // PANCAKE_SIMPLECHAIN_DEFAULT,  // SimpleChain - 暂无
]

export const UNSUPPORTED_LIST_URLS: string[] = []
export const WARNING_LIST_URLS: string[] = []

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  ...BSC_URLS,
  ...ETH_URLS,
  ...ZKSYNC_URLS,
  ...LINEA_URLS,
  ...BASE_URLS,
  ...ARBITRUM_URLS,
  OP_SUPER_CHAIN_URL,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
  ...WARNING_LIST_URLS,
  ...OPBNB_URLS,
  ...SIMPLECHAIN_URLS,
  ...SIMPLECHAIN_TESTNET_URLS,
  ...RWA_URLS,
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  PANCAKE_EXTENDED,
  PANCAKE_ETH_DEFAULT,
  PANCAKE_ZKSYNC_DEFAULT,
  PANCAKE_ARB_DEFAULT,
  PANCAKE_LINEA_DEFAULT,
  PANCAKE_BASE_DEFAULT,
  PANCAKE_OPBNB_DEFAULT,
  OP_SUPER_CHAIN_URL,
  COINGECKO_BSC,
  COINGECKO_ETH,
  COINGECKO_ARB,
  COINGECKO_BASE,
  // PANCAKE_SIMPLECHAIN_DEFAULT,  // SimpleChain - 暂无
  // PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT,  // SimpleChain - 暂无
  COINGECKO_LINEA,
  ...RWA_URLS,
]

export const MULTI_CHAIN_LIST_URLS: { [chainId: number]: string[] } = {
  [ChainId.BSC]: BSC_URLS,
  [ChainId.ETHEREUM]: ETH_URLS,
  [ChainId.ZKSYNC]: ZKSYNC_URLS,
  [ChainId.ARBITRUM_ONE]: ARBITRUM_URLS,
  [ChainId.LINEA]: LINEA_URLS,
  [ChainId.BASE]: BASE_URLS,
  [ChainId.OPBNB]: OPBNB_URLS,
  [ChainId.SIMPLECHAIN]: SIMPLECHAIN_URLS,
  [ChainId.SIMPLECHAIN_TESTNET]: SIMPLECHAIN_TESTNET_URLS,
}
