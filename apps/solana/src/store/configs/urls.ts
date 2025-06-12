import { API_URLS } from '@raydium-io/raydium-sdk-v2'

export const urlConfigs = {
  ...API_URLS,
  BASE_HOST: process.env.NEXT_PUBLIC_EXPLORE_API_ENDPOINT ?? API_URLS.BASE_HOST,
  POOL_LIST: '/cached/v1/pools/info/list',
  MINT_PRICE: '/cached/v1/tokens/price',
  INFO: '/cached/v1/pools/stats/overview',
  POOL_SEARCH_BY_ID: '/cached/v1/pools/info/ids',
  POOL_POSITION_LINE: '/cached/v1/pools/line/position',
  // todo: switch to our own
  TOKEN_LIST: 'https://api-v3.raydium.io/mint/list',
  POOL_KEY_BY_ID: 'https://api-v3.raydium.io/pools/key/ids'
}
