import { Currency, Native } from '@pancakeswap/sdk'
import {
  decodeHooksRegistration,
  getPoolId,
  INFI_CL_POOL_MANAGER_ADDRESSES,
  isInfinitySupported,
} from '@pancakeswap/infinity-sdk'
import { Address, PublicClient } from 'viem'
import { GetInfinityCandidatePoolsParams } from '../types'
import { getPairCombinations } from '../../v3-router/functions'
import { createOnChainPoolFactory } from '../../v3-router/providers'
import { InfinityStablePool, PoolType } from '../../v3-router/types'
import { PoolMeta } from '../../v3-router/providers/poolProviders/internalTypes'
import { stableNGHookABI } from './abi'

// find_pool_for_coins(_from: address, _to: address, i: uint256 = 0) -> address:
const stableNGHookFactoryABI = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'pool_list',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'pool_count',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
]

/**
 * Mock Hook Factory for Stable Swap
 * This should eventually call the actual hook factory contract
 */
class StableNGHookFactory {
  private poolsCache: { data: any[]; timestamp: number; poolCount: number } | null = null

  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  constructor(private readonly contractAddress: Address, private readonly publicClient: PublicClient) {
    this.contractAddress = contractAddress
    this.publicClient = publicClient
  }

  // implement getPools
  async getPools(): Promise<any[]> {
    // Check if cache is valid
    const now = Date.now()
    if (this.poolsCache && now - this.poolsCache.timestamp < this.CACHE_DURATION) {
      console.log('returning cached pools')
      return this.poolsCache.data
    }

    console.log('calling getPools')
    // First, get the current pool count
    const poolCountResult = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: stableNGHookFactoryABI,
      functionName: 'pool_count',
    })

    const poolCount = Number(poolCountResult?.toString())

    // If we have cached data and pool count hasn't changed, return cached data
    if (this.poolsCache && this.poolsCache.poolCount === poolCount) {
      console.log('pool count unchanged, returning cached pools')
      // Update timestamp to extend cache validity
      this.poolsCache = { ...this.poolsCache, timestamp: now }
      return this.poolsCache.data
    }

    if (poolCount === 0) {
      // Cache empty result
      this.poolsCache = { data: [], timestamp: now, poolCount }
      return []
    }

    // TODO: optimize this to use a single call
    const pools = []
    for (let i = 0; i < poolCount; i++) {
      // eslint-disable-next-line no-await-in-loop
      const pool = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: stableNGHookFactoryABI,
        functionName: 'pool_list',
        args: [i],
      })
      pools.push(pool)
    }

    // Cache the result with pool count
    this.poolsCache = { data: pools, timestamp: now, poolCount }
    return pools
  }

  get address(): Address {
    return this.contractAddress
  }
}

export async function getInfinityStableCandidatePools({
  currencyA,
  currencyB,
  clientProvider,
}: Omit<GetInfinityCandidatePoolsParams, 'gasLimit'>) {
  if (!currencyA || !currencyB) {
    throw new Error(`Invalid currencyA ${currencyA} or currencyB ${currencyB}`)
  }
  const native = Native.onChain(currencyA?.chainId)
  const wnative = native.wrapped
  const pairs = await getPairCombinations(currencyA, currencyB)
  const pairsWithNative = [...pairs]
  for (const pair of pairs) {
    const index = pair.findIndex((c) => c.wrapped.equals(wnative))
    if (index >= 0) {
      const pairWithNative = [...pair]
      pairWithNative[index] = native
      pairsWithNative.push(pairWithNative as [Currency, Currency])
    }
  }
  return getInfinityStablePools(pairsWithNative, clientProvider)
}

const getInfinityStablePools = createOnChainPoolFactory<InfinityStablePool, PoolMeta>({
  abi: stableNGHookABI,
  getPossiblePoolMetas: async ([currencyA, currencyB], client) => {
    const { chainId } = currencyA
    if (!isInfinitySupported(chainId))
      throw new Error(`Failed to get stable infinity pools. Stable Infinity not supported on chain ${chainId}`)

    if (!client) {
      throw new Error(`No client provided for getInfinitySSPools on chain ${chainId}`)
    }

    // Get hook addresses from HookFactory contract
    const mockHookFactoryAddress = '0x515Fa220d115f69EDEb5f7544705C3f4437A7a84' as Address
    const hookFactory = new StableNGHookFactory(mockHookFactoryAddress, client)

    const ssHookAddresses: Address[] = await hookFactory.getPools()

    const ssHookAddressesMetas = ssHookAddresses.map((hookAddress) => {
      return {
        currencyA,
        currencyB,
        id: hookAddress,
      }
    })

    return ssHookAddressesMetas
  },
  buildPoolInfoCalls: ({ id: address }) => [
    {
      address,
      functionName: 'totalSupply',
      args: [],
    },
    {
      address,
      functionName: 'fee',
      args: [],
    },
  ],
  buildPool: ({ currencyA, currencyB, id }, [totalSupply, fee]) => {
    if (!totalSupply || !fee) {
      return null
    }

    const [currency0, currency1] = currencyA.wrapped.sortsBefore(currencyB.wrapped)
      ? [currencyA, currencyB]
      : [currencyB, currencyA]

    const DEFAULT_INFINITY_STABLE_POOL = 0

    const DEFAULT_TICK_SPACING = 1

    const poolManager =
      INFI_CL_POOL_MANAGER_ADDRESSES[currencyA.wrapped.chainId as keyof typeof INFI_CL_POOL_MANAGER_ADDRESSES]

    const hooksRegistrationBitmap = '0x0455'

    const hooksRegistration = decodeHooksRegistration(hooksRegistrationBitmap)

    const parameters = {
      tickSpacing: DEFAULT_TICK_SPACING,
      hooksRegistration,
    }

    const poolId = getPoolId({
      currency0: currency0.wrapped.address,
      currency1: currency1.wrapped.address,
      hooks: id,
      fee: DEFAULT_INFINITY_STABLE_POOL,
      poolManager,
      parameters,
    })

    return {
      id: poolId,
      type: PoolType.InfinityStable,
      currency0,
      currency1,
      // TODO: need to compatiable with stable fee and infinity fee
      // it's risky to treat stable fee as infinity fee
      fee: DEFAULT_INFINITY_STABLE_POOL,
      protocolFee: DEFAULT_INFINITY_STABLE_POOL,
      // it's risky to treat stable liquidity as infinity liquidity
      liquidity: BigInt(totalSupply.toString()),
      // TODO: no need?
      sqrtRatioX96: 79228162514264337593543950336n,
      tickSpacing: DEFAULT_TICK_SPACING,
      poolManager,
      hooks: id,
      hooksRegistrationBitmap,
    }
  },
})
