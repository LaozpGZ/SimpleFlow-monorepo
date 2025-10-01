import { Currency, CurrencyAmount, getCurrencyAddress, Native, Percent, sortCurrencies } from '@pancakeswap/sdk'
import { getPoolId, INFI_CL_POOL_MANAGER_ADDRESSES, isInfinitySupported, PoolKey } from '@pancakeswap/infinity-sdk'
import { Address } from 'viem'
import { GetInfinityCandidatePoolsParams } from '../types'
import { getPairCombinations } from '../../v3-router/functions'
import { createOnChainPoolFactory } from '../../v3-router/providers'
import { InfinityClPool, PoolType, StablePool } from '../../v3-router/types'
import { InfinityClPoolMeta } from './getInfinityClPools'
import { PoolMeta } from '../../v3-router/providers/poolProviders/internalTypes'
import { stableSwapPairABI } from '../../abis/StableSwapPair'

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

/**
 * Default param from hook factory contract
 *         // fee and tickSpacing will not be used
        bytes32 parameters = bytes32(uint256(IHooks(address(hook)).getHooksRegistrationBitmap()));
        parameters = parameters.setTickSpacing(1);
        Currency currency0 = Currency.wrap(_coins[0]);
        Currency currency1 = Currency.wrap(_coins[1]);
        PoolKey memory key = PoolKey({
            currency0: currency0,
            currency1: currency1,
            hooks: IHooks(address(hook)),
            poolManager: poolManager,
            fee: uint24(0),
            parameters: parameters
        });

 */

export const getInfinitySSPools = createOnChainPoolFactory<StablePool, PoolMeta>({
  abi: stableSwapPairABI,
  getPossiblePoolMetas: async ([currencyA, currencyB]) => {
    const { chainId } = currencyA
    if (!isInfinitySupported(chainId))
      throw new Error(`Failed to get cl pools. Infinity not supported on chain ${chainId}`)
    const [currency0, currency1] = sortCurrencies([currencyA, currencyB])
    const poolIdList = new Set<string>()

    // await find_pool_for_coins from HookFactory contract
    const ssHookAddresses: Address[] = []

    return ssHookAddresses
      .map((hookAddress) => {
        const tickSpacing = 1
        const fee = 0
        const hooks = hookAddress
        // TODO: should get hook.getHooksRegistrationBitmap?
        const hooksRegistration = undefined

        const hooksRegistrationBitmap = undefined

        const poolKey: PoolKey<'CL'> = {
          currency0: getCurrencyAddress(currency0),
          currency1: getCurrencyAddress(currency1),
          fee,
          parameters: {
            tickSpacing,
            hooksRegistration,
          },
          poolManager: INFI_CL_POOL_MANAGER_ADDRESSES[chainId],
          hooks: hookAddress,
        }

        const id = getPoolId(poolKey)
        if (poolIdList.has(id)) {
          return undefined
        }

        poolIdList.add(id)

        return {
          currencyA,
          currencyB,
          fee,
          tickSpacing,
          hooks,
          poolManager: poolKey.poolManager,
          id,
          hooksRegistrationBitmap,
        }
      })
      .filter((meta) => meta !== undefined)
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
    {
      address,
      functionName: 'FEE_DENOMINATOR',
      args: [],
    },
  ],
  buildPool: ({ currencyA, currencyB, id: address }, [balance0, balance1, a, fee, feeDenominator]) => {
    if (!balance0 || !balance1 || !a || !fee || !feeDenominator) {
      return null
    }
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
      fee: new Percent(BigInt(fee.toString()), BigInt(feeDenominator.toString())),
    }
  },
})
