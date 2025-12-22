import { ChainId } from '@pancakeswap/chains'

export const DEFAULT_BLOCK_CONFLICT_TOLERANCE = 0

export const BLOCK_CONFLICT_TOLERANCE: { [key in ChainId]?: number } = {
  [ChainId.BSC]: 12,
  [ChainId.BSC_TESTNET]: 12,
  [ChainId.SIMPLECHAIN_TESTNET]: 3,
}
