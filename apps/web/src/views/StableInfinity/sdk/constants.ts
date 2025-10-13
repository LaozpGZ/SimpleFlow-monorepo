import { Address } from 'viem'
import { ChainId } from '@pancakeswap/chains'

/**
 * InfinityStable Pool Factory contract addresses by chain
 */
export const CL_STABLE_SWAP_POOL_FACTORY_ADDRESS: Record<ChainId.BSC | ChainId.BSC_TESTNET, Address> = {
  [ChainId.BSC]: '0xA5297FC8479F12A956AeD3A2af0703b845d99A70',
  [ChainId.BSC_TESTNET]: '0xBF1Ac62e35b8d138aC2b6A65DEFa25D4db176c71',
}

/**
 * Zero address constant
 */
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' as Address

/**
 * Default null method ID
 */
export const NULL_METHOD_ID = '0x00000000' as const

/**
 * Default implementation index
 */
export const DEFAULT_IMPLEMENTATION_IDX = 0n

/**
 * Default asset type (standard ERC20)
 */
export const DEFAULT_ASSET_TYPE = 0

/**
 * Maximum fee (1% = 10000000)
 */
export const MAX_FEE = 10000000n

/**
 * Minimum amplification parameter
 */
export const MIN_A = 1n

/**
 * Maximum amplification parameter
 */
export const MAX_A = 10000n
