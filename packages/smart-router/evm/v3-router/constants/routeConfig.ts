import { ChainId } from '@pancakeswap/chains'
import { RouteConfig } from '../types'

export const ROUTE_CONFIG_BY_CHAIN: { [key in ChainId]?: Partial<RouteConfig> } = {
  [ChainId.BSC]: {},
  [ChainId.BSC_TESTNET]: {},
  [ChainId.SIMPLECHAIN_TESTNET]: {},
}
