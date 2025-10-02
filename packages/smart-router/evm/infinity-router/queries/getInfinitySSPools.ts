import { Currency, CurrencyAmount, Native, Percent } from '@pancakeswap/sdk'
import { isInfinitySupported } from '@pancakeswap/infinity-sdk'
import { Address, PublicClient } from 'viem'
import { GetInfinityCandidatePoolsParams } from '../types'
import { getPairCombinations } from '../../v3-router/functions'
import { createOnChainPoolFactory } from '../../v3-router/providers'
import { PoolType, StablePool } from '../../v3-router/types'
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
  constructor(private readonly contractAddress: Address, private readonly publicClient: PublicClient) {
    this.contractAddress = contractAddress
    this.publicClient = publicClient
  }

  // implement getPools
  async getPools(): Promise<any[]> {
    console.log('calling getPools')
    // call pool_count
    // call pool_list for each index
    // return the results
    const poolCountResult = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: stableNGHookFactoryABI,
      functionName: 'pool_count',
    })

    const poolCount = Number(poolCountResult?.toString())

    if (poolCount === 0) {
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

    return pools
  }

  get address(): Address {
    return this.contractAddress
  }
}

export async function getInfinitySSCandidatePools({
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
  return getInfinitySSPools(pairsWithNative, clientProvider)
}

export const getInfinitySSPools = createOnChainPoolFactory<StablePool, PoolMeta>({
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

    console.log('calling ssHookAddressesMetas')

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
      functionName: 'A',
      args: [],
    },
    {
      address,
      functionName: 'fee',
      args: [],
    },
  ],
  buildPool: ({ currencyA, currencyB, id: address }, [balance0, balance1, a, fee]) => {
    console.log('building pool', { currencyA, currencyB, address, balance0, balance1, a, fee })

    if (!balance0 || !balance1 || !a || !fee) {
      return null
    }

    // From Hook Smart Contract
    const FEE_DENOMINATOR = 10 ** 10

    const [token0, token1] = currencyA.wrapped.sortsBefore(currencyB.wrapped)
      ? [currencyA, currencyB]
      : [currencyB, currencyA]
    return {
      address,
      type: PoolType.STABLE,
      balances: [
        CurrencyAmount.fromRawAmount(token0, balance0.toString()),
        CurrencyAmount.fromRawAmount(token1, balance1.toString()),
      ],
      amplifier: BigInt(a.toString()),
      fee: new Percent(BigInt(fee.toString()), BigInt(FEE_DENOMINATOR.toString())),
    }
  },
})
