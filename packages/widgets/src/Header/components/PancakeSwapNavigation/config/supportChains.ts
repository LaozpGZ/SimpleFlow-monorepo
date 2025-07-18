import { ChainId } from '@pancakeswap/chains'

export { supportedChainId as SUPPORT_FARMS } from '@pancakeswap/farms'
export { SUPPORTED_CHAIN_IDS as POOL_SUPPORTED_CHAINS } from '@pancakeswap/pools'
export { SUPPORTED_CHAIN_IDS as POSITION_MANAGERS_SUPPORTED_CHAINS } from '@pancakeswap/position-managers'
export { SUPPORTED_CHAIN_IDS as PREDICTION_SUPPORTED_CHAINS } from '@pancakeswap/prediction'

export const SUPPORT_ONLY_BSC = [ChainId.BSC]
export const LIQUID_STAKING_SUPPORTED_CHAINS = [
  ChainId.BSC,
  ChainId.ETHEREUM,
  ChainId.BSC_TESTNET,
  ChainId.ARBITRUM_GOERLI,
  ChainId.MONAD_TESTNET,
]
export const FIXED_STAKING_SUPPORTED_CHAINS = [ChainId.BSC]

export const V3_MIGRATION_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.ETHEREUM]
export const V2_BCAKE_MIGRATION_SUPPORTED_CHAINS = [ChainId.BSC]

export const SUPPORT_CAKE_STAKING = [ChainId.BSC, ChainId.BSC_TESTNET]
