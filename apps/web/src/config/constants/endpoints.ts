import { ChainId, STABLESWAP_SUBGRAPHS, V2_SUBGRAPHS, V3_SUBGRAPHS } from '@simpleflow/chains'

export const THE_GRAPH_PROXY_API = 'https://thegraph.simpleflow.finance'

export const GRAPH_API_PROFILE = `${THE_GRAPH_PROXY_API}/profile`

export const GRAPH_API_LOTTERY = `${THE_GRAPH_PROXY_API}/lottery-bsc`
export const SNAPSHOT_BASE_URL = process.env.NEXT_PUBLIC_SNAPSHOT_BASE_URL
export const API_PROFILE = 'https://profile.simpleflow.finance'
export const API_NFT = 'https://nft.simpleflow.finance/api/v1'
export const SNAPSHOT_API = `${SNAPSHOT_BASE_URL}/graphql`
// export const ONRAMP_API_BASE_URL = 'https://monkfish-app-s4mda.ondigitalocean.app'
export const ONRAMP_API_BASE_URL = 'https://onramp2-api.simpleflow.finance'
export const NOTIFICATION_HUB_BASE_URL = 'https://notification-hub.simpleflow.finance'
/**
 * V1 will be deprecated but is still used to claim old rounds
 */
export const GRAPH_API_PREDICTION_V1 = `${THE_GRAPH_PROXY_API}/prediction-v1-bsc`

export const V3_BSC_INFO_CLIENT = `https://thegraph.simpleflow.finance/v3-bsc-info`

export const GRAPH_API_NFTMARKET = `${THE_GRAPH_PROXY_API}/nft-marketplace-bsc`
export const GRAPH_HEALTH = 'https://indexer.upgrade.thegraph.com/status'

export const TC_MOBOX_SUBGRAPH = `${THE_GRAPH_PROXY_API}/trading-competition-v3`
export const TC_MOD_SUBGRAPH = `${THE_GRAPH_PROXY_API}/trading-competition-v4`

export const BIT_QUERY = 'https://graphql.bitquery.io'

export const ACCESS_RISK_API = 'https://red.alert.simpleflow.finance/red-api'

export const CELER_API = 'https://api.celerscan.com/scan'

export const V2_SUBGRAPH_URLS = {
  ...V2_SUBGRAPHS,
  [ChainId.BASE]: `${THE_GRAPH_PROXY_API}/exchange-v2-base`,
  [ChainId.ETHEREUM]: `${THE_GRAPH_PROXY_API}/exchange-v2-eth`,
  [ChainId.BSC]: `${THE_GRAPH_PROXY_API}/exchange-v2-bsc`,
  [ChainId.ARBITRUM_ONE]: `${THE_GRAPH_PROXY_API}/exchange-v2-arb`,
  [ChainId.ZKSYNC]: `${THE_GRAPH_PROXY_API}/exchange-v2-zksync`,
  [ChainId.LINEA]: `${THE_GRAPH_PROXY_API}/exchange-v2-linea`,
  [ChainId.OPBNB]: `${THE_GRAPH_PROXY_API}/exchange-v2-opbnb`,
}

export const ASSET_CDN = process.env.NEXT_PUBLIC_ASSET_CDN || 'https://assets.simpleflow.finance'

export const V3_SUBGRAPH_URLS = {
  ...V3_SUBGRAPHS,
  [ChainId.BASE]: `${THE_GRAPH_PROXY_API}/exchange-v3-base`,
  [ChainId.ETHEREUM]: `${THE_GRAPH_PROXY_API}/exchange-v3-eth`,
  [ChainId.BSC]: `${THE_GRAPH_PROXY_API}/exchange-v3-bsc`,
  [ChainId.ARBITRUM_ONE]: `${THE_GRAPH_PROXY_API}/exchange-v3-arb`,
  [ChainId.ZKSYNC]: `${THE_GRAPH_PROXY_API}/exchange-v3-zksync`,
  [ChainId.LINEA]: `${THE_GRAPH_PROXY_API}/exchange-v3-linea`,
  [ChainId.OPBNB]: `${THE_GRAPH_PROXY_API}/exchange-v3-opbnb`,
}

export const STABLESWAP_SUBGRAPHS_URLS = {
  ...STABLESWAP_SUBGRAPHS,
  [ChainId.BSC]: `${THE_GRAPH_PROXY_API}/exchange-stableswap-bsc`,
  [ChainId.ARBITRUM_ONE]: `${THE_GRAPH_PROXY_API}/exchange-stableswap-arb`,
  [ChainId.ETHEREUM]: `${THE_GRAPH_PROXY_API}/exchange-stableswap-eth`,
}

export const X_API_ENDPOINT = process.env.NEXT_PUBLIC_QUOTING_API

export const BRIDGE_API_ENDPOINT = process.env.NEXT_PUBLIC_BRIDGE_API

export const QUOTING_API_PREFIX = `${X_API_ENDPOINT}/order-price`

export const QUOTING_API = `${QUOTING_API_PREFIX}/get-price`

export const FARMS_API = 'https://farms-api.simpleflow.finance'
export const FARMS_API_V2 = 'https://farms-api-v2.simpleflow.finance/api'

export const WALLET_API = process.env.NEXT_PUBLIC_WALLET_API || 'https://wallet-api.simpleflow.finance'

export const BINANCE_DATA_API = 'https://data-api.binance.vision/api'

export const PREDICTION_PRICE_API = '/api/prediction/price'

export const urlConfigs = {
  BASE_HOST: process.env.NEXT_PUBLIC_SOLANA_EXPLORE_API_ENDPOINT,
  POOL_LIST: '/cached/v1/pools/info/list',
  MINT_PRICE: '/cached/v1/tokens/price',
  INFO: '/cached/v1/pools/stats/overview',
  POOL_SEARCH_BY_ID: '/cached/v1/pools/info/ids',
  POOL_POSITION_LINE: '/cached/v1/pools/line/position',
  POOL_LIQUIDITY_LINE: '/cached/v1/pools/line/liquidity',
  POOL_TVL_LINE: '/cached/v1/pools/line/tvl',
  POOL_KEY_BY_ID: '/cached/v1/pools/info/ids',
  BIRDEYE_TOKEN_PRICE: '/cached/v1/tokens/birdeye/defi/multi_price',
  TOKEN_LIST: 'https://api-v3.raydium.io/mint/list',
  PCS_TOKEN_LIST: 'https://tokens.simpleflow.finance/pancakeswap-solana-default.json',
}
