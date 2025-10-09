import { Currency, CurrencyAmount, Native } from '@pancakeswap/sdk'
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
import { infinityStableHookABI } from './abi'

// find_pool_for_coins(_from: address, _to: address, i: uint256 = 0) -> address:
const infinityStableHookFactoryABI = [
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

// Module-level cache for pools data
const poolsCache = new Map<string, { data: any[]; timestamp: number; poolCount: number }>()

/**
 * Mock Hook Factory for Stable Swap
 * This should eventually call the actual hook factory contract
 */
class InfinityStableHookFactory {
  private static instance: InfinityStableHookFactory | null = null

  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  /**
   * Get the singleton instance
   */
  static getInstance(): InfinityStableHookFactory {
    if (!InfinityStableHookFactory.instance) {
      InfinityStableHookFactory.instance = new InfinityStableHookFactory()
    }
    return InfinityStableHookFactory.instance
  }

  // implement getPools
  async getPools(contractAddress: Address, publicClient: PublicClient): Promise<any[]> {
    const cacheKey = `${contractAddress}}`
    const now = Date.now()

    // Check if cache is valid
    const cachedData = poolsCache.get(cacheKey)
    if (cachedData && now - cachedData.timestamp < this.CACHE_DURATION) {
      // eslint-disable-next-line no-console
      console.log(
        'InfinityStableHookFactory: returning cached pools (cache age:',
        Math.round((now - cachedData.timestamp) / 1000),
        'seconds)',
      )
      return cachedData.data
    }

    // eslint-disable-next-line no-console
    console.log('InfinityStableHookFactory: cache miss, calling getPools from contract')
    // First, get the current pool count
    const poolCountResult = await publicClient.readContract({
      address: contractAddress,
      abi: infinityStableHookFactoryABI,
      functionName: 'pool_count',
    })

    const poolCount = Number(poolCountResult?.toString())

    // If we have cached data and pool count hasn't changed, return cached data
    if (cachedData && cachedData.poolCount === poolCount) {
      console.log('InfinityStableHookFactory: pool count unchanged, extending cache validity')
      // Update timestamp to extend cache validity
      const updatedCache = { ...cachedData, timestamp: now }
      poolsCache.set(cacheKey, updatedCache)
      return updatedCache.data
    }

    if (poolCount === 0) {
      // Cache empty result
      const emptyCache = { data: [], timestamp: now, poolCount }
      poolsCache.set(cacheKey, emptyCache)
      return []
    }

    // TODO: optimize this to use a single call
    const pools = []
    for (let i = 0; i < poolCount; i++) {
      // eslint-disable-next-line no-await-in-loop
      const pool = await publicClient.readContract({
        address: contractAddress,
        abi: infinityStableHookFactoryABI,
        functionName: 'pool_list',
        args: [i],
      })
      pools.push(pool)
    }

    // Cache the result with pool count
    const newCache = { data: pools, timestamp: now, poolCount }
    poolsCache.set(cacheKey, newCache)
    console.log('InfinityStableHookFactory: cached', pools.length, 'pools for 5 minutes')
    return pools
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
  abi: infinityStableHookABI,
  getPossiblePoolMetas: async ([currencyA, currencyB], client) => {
    const { chainId } = currencyA
    if (!isInfinitySupported(chainId))
      throw new Error(`Failed to get stable infinity pools. Stable Infinity not supported on chain ${chainId}`)

    if (!client) {
      throw new Error(`No client provided for getInfinitySSPools on chain ${chainId}`)
    }

    // Get hook addresses from HookFactory contract
    const mockHookFactoryAddress = '0x515Fa220d115f69EDEb5f7544705C3f4437A7a84' as Address
    const hookFactory = InfinityStableHookFactory.getInstance()

    const ssHookAddresses: Address[] = await hookFactory.getPools(mockHookFactoryAddress, client)

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
      functionName: 'balances',
      args: [0],
    },
    {
      address,
      functionName: 'balances',
      args: [1],
    },
    {
      address,
      functionName: 'fee',
      args: [],
    },
  ],
  buildPool: ({ currencyA, currencyB, id }, [balance0, balance1, fee]) => {
    if (!balance0 || !balance1 || !fee) {
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
      // using hook balances (Stable ABI) as reserve0 (V4 ABI)
      reserve0: CurrencyAmount.fromRawAmount(currency0, balance0.toString()),
      reserve1: CurrencyAmount.fromRawAmount(currency1, balance1.toString()),
      tickSpacing: DEFAULT_TICK_SPACING,
      poolManager,
      hooks: id,
      hooksRegistrationBitmap,
    }
  },
})
