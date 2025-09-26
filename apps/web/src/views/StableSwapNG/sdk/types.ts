import { Currency } from '@pancakeswap/sdk'
import { Address, Hex } from 'viem'

/**
 * Generated method parameters for executing a call.
 */
export interface MethodParameters {
  /**
   * The hex encoded calldata to perform the given operation
   */
  calldata: Hex
  /**
   * The amount of ether (wei) to send in hex.
   */
  value: Hex
}

/**
 * Options for creating a StableNG pool
 */
export interface CreateStableNGPoolOptions {
  /**
   * First token in the pool
   */
  tokenA: Currency
  /**
   * Second token in the pool
   */
  tokenB: Currency
  /**
   * Pool amplification parameter (default: 1000)
   */
  A?: bigint
  /**
   * Pool swap fee in wei (default: 1000000 = 0.01%)
   */
  fee?: bigint
  /**
   * Off-peg fee multiplier (default: 100000000000 = 10)
   */
  offpegFeeMultiplier?: bigint
  /**
   * Moving average expiration time (default: 866)
   */
  maExpTime?: bigint
  /**
   * Implementation index (default: 0)
   */
  implementationIdx?: bigint
  /**
   * Asset types for each token (default: [0, 0])
   */
  assetTypes?: readonly [number, number]
  /**
   * Method IDs for price oracles (default: ['0x00000000', '0x00000000'])
   */
  methodIds?: readonly [Hex, Hex]
  /**
   * Oracle addresses (default: [ADDRESS_ZERO, ADDRESS_ZERO])
   */
  oracles?: readonly [Address, Address]
}

/**
 * Pool key returned by the factory
 */
export interface PoolKey {
  poolAddress: Address
  poolKey: Hex
}

/**
 * Preset configurations for different pool types
 */
export type PoolPreset = 'fiat' | 'crypto' | 'lrt'

export interface PresetConfig {
  A: bigint
  fee: bigint
  offpegFeeMultiplier: bigint
  maExpTime: bigint
}

/**
 * Constants
 */
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' as Address

/**
 * Default preset configurations
 */
export const PRESET_CONFIGS: Record<PoolPreset, PresetConfig> = {
  fiat: {
    A: 1000n,
    fee: 1000000n, // 0.01%
    offpegFeeMultiplier: 100000000000n, // 10
    maExpTime: 866n,
  },
  crypto: {
    A: 500n,
    fee: 2000000n, // 0.02%
    offpegFeeMultiplier: 200000000000n, // 20
    maExpTime: 866n,
  },
  lrt: {
    A: 2000n,
    fee: 500000n, // 0.005%
    offpegFeeMultiplier: 50000000000n, // 5
    maExpTime: 866n,
  },
}
