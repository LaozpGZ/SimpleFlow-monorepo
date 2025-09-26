import { Currency } from '@pancakeswap/sdk'
import { Address, Hex, encodeFunctionData, toHex } from 'viem'
import invariant from 'tiny-invariant'

import { stableNGPoolFactoryABI } from './abi'
import {
  STABLE_NG_POOL_FACTORY_ADDRESS,
  ADDRESS_ZERO,
  NULL_METHOD_ID,
  DEFAULT_IMPLEMENTATION_IDX,
  DEFAULT_ASSET_TYPE,
} from './constants'
import { CreateStableNGPoolOptions, MethodParameters, PoolPreset, PRESET_CONFIGS } from './types'

/**
 * Validates that two currencies are different
 */
function validateCurrencies(tokenA: Currency, tokenB: Currency): void {
  invariant(!tokenA.equals(tokenB), 'IDENTICAL_CURRENCIES')
  invariant(tokenA.wrapped.address !== tokenB.wrapped.address, 'IDENTICAL_ADDRESSES')
}

/**
 * Sorts two currencies and returns them in deterministic order
 */
function sortCurrencies(tokenA: Currency, tokenB: Currency): [Currency, Currency] {
  return tokenA.wrapped.sortsBefore(tokenB.wrapped) ? [tokenA, tokenB] : [tokenB, tokenA]
}

/**
 * StableSwapNG Pool Factory for creating and managing stable swap pools
 */
export abstract class StableSwapNGPoolFactory {
  public static ABI = stableNGPoolFactoryABI

  public static ADDRESS = STABLE_NG_POOL_FACTORY_ADDRESS

  /**
   * Cannot be constructed.
   */
  // eslint-disable-next-line
  private constructor() {}

  /**
   * Encodes the createPool function call
   */
  private static encodeCreatePool(options: CreateStableNGPoolOptions): Hex {
    const [tokenA, tokenB] = sortCurrencies(options.tokenA, options.tokenB)

    // Generate pool name and symbol
    const name = `${tokenA.symbol}-${tokenB.symbol}`
    const symbol = `${tokenA.symbol}-${tokenB.symbol}`

    // Prepare token addresses
    const coins = [tokenA.wrapped.address as Address, tokenB.wrapped.address as Address]

    // Use provided values or defaults
    const A = options.A ?? 1000n
    const fee = options.fee ?? 1000000n // 0.01%
    const offpegFeeMultiplier = options.offpegFeeMultiplier ?? 100000000000n // 10
    const maExpTime = options.maExpTime ?? 866n
    const implementationIdx = options.implementationIdx ?? DEFAULT_IMPLEMENTATION_IDX
    const assetTypes = options.assetTypes ?? ([DEFAULT_ASSET_TYPE, DEFAULT_ASSET_TYPE] as const)
    const methodIds = options.methodIds ?? ([NULL_METHOD_ID, NULL_METHOD_ID] as const)
    const oracles = options.oracles ?? ([ADDRESS_ZERO, ADDRESS_ZERO] as const)

    console.info('[debug] StableSwapNGPoolFactory.encodeCreatePool call parameters', {
      name,
      symbol,
      coins,
      A,
      fee,
      offpegFeeMultiplier,
      maExpTime,
      implementationIdx,
      assetTypes,
      methodIds,
      oracles,
    })

    return encodeFunctionData({
      abi: StableSwapNGPoolFactory.ABI,
      functionName: 'createPool',
      args: [
        name,
        symbol,
        coins,
        A,
        fee,
        offpegFeeMultiplier,
        maExpTime,
        implementationIdx,
        assetTypes,
        methodIds,
        oracles,
      ],
    })
  }

  /**
   * Creates call parameters for pool creation
   */
  public static createPoolCallParameters(options: CreateStableNGPoolOptions): MethodParameters {
    validateCurrencies(options.tokenA, options.tokenB)

    return {
      calldata: this.encodeCreatePool(options),
      value: toHex(0),
    }
  }

  /**
   * Creates call parameters using a preset configuration
   */
  public static createPoolWithPresetCallParameters(
    tokenA: Currency,
    tokenB: Currency,
    preset: PoolPreset,
  ): MethodParameters {
    const presetConfig = PRESET_CONFIGS[preset]
    invariant(presetConfig, `Unknown preset: ${preset}`)

    return this.createPoolCallParameters({
      tokenA,
      tokenB,
      ...presetConfig,
    })
  }
}
