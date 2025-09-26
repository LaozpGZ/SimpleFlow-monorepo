import { Address } from 'viem'

/**
 * StableNG Pool Factory contract address
 */
export const STABLE_NG_POOL_FACTORY_ADDRESS = '0x403894B21EC18877931E6A98C8eD3D3f00Bfc0C6' as Address

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
