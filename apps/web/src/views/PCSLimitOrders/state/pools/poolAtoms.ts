import { atom } from 'jotai'
import { isPoolId } from 'hooks/infinity/utils/pool'
import { fetchCLPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'
import { getClPoolWithCache } from 'hooks/infinity/getPool'
import { Token } from '@pancakeswap/sdk'
import { loadable } from 'jotai/utils'
import { getPoolTicks } from 'hooks/useAllTicksQuery'
import { Protocol } from '@pancakeswap/farms'
import { InfinityClPool, InfinityRouter, PoolType } from '@pancakeswap/smart-router'
import { encodeHooksRegistration } from '@pancakeswap/infinity-sdk'
import { publicClient } from 'utils/viem'
import { fetchInfinityCLPoolTicksWithFallback } from 'views/PCSLimitOrders/utils/pools'
import { toRoutingSDKPool } from 'utils/convertTrade'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { supportedPoolsListAtom } from './poolsListAtom'
import { getCurrencyIdWithZeroAddr } from '../../utils'

// TODO: Refetch mechanism to update pool info and price
export const selectedPoolAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return undefined

  const idA = getCurrencyIdWithZeroAddr(inputCurrency)
  const idB = getCurrencyIdWithZeroAddr(outputCurrency)

  const pools = await get(supportedPoolsListAtom)
  const basicPool = pools.find(
    (pool) =>
      pool.chainId === inputCurrency.chainId &&
      ((pool.currency0 === idA && pool.currency1 === idB) || (pool.currency0 === idB && pool.currency1 === idA)),
  )

  console.log('SelectedPoolAtom', {
    idA,
    idB,
    basicPool,
    pools,
  })

  if (!basicPool || !isPoolId(basicPool.poolId)) return undefined

  const { poolId, chainId } = basicPool

  // Fetch CL pool info
  const poolInfo = await fetchCLPoolInfo(poolId, chainId)

  if (!poolInfo || (!poolInfo.dynamic && poolInfo.fee >= 1e6)) return undefined

  const { currency0, fee, liquidity, lpFee, protocolFee, sqrtPriceX96, tick, parameters } = poolInfo

  // Sort currencies
  const zeroForOne = idA.toLowerCase() === currency0.toLowerCase()
  const [currencyA, currencyB] = zeroForOne ? [inputCurrency, outputCurrency] : [outputCurrency, inputCurrency]

  // Construct Pool
  const pool = getClPoolWithCache({
    chainId,
    tokenA: currencyA as Token,
    tokenB: currencyB as Token,
    fee,
    liquidity,
    lpFee,
    poolId,
    poolType: 'CL',
    protocolFee,
    sqrtRatioX96: sqrtPriceX96,
    tick,
    tickSpacing: parameters.tickSpacing,
  })

  const infinityPool: InfinityClPool = {
    id: poolId,
    currency0: currencyA,
    currency1: currencyB,
    fee: pool.fee,
    liquidity: pool.liquidity,
    poolManager: poolInfo.poolManager,
    sqrtRatioX96: pool.sqrtRatioX96,
    tick: poolInfo.tick,
    tickSpacing: poolInfo.parameters.tickSpacing,
    type: PoolType.InfinityCL,
    protocolFee: pool.protocolFee,
    hooks: poolInfo.hooks,
    hooksRegistrationBitmap: encodeHooksRegistration(poolInfo.parameters.hooksRegistration),
  }

  const poolWithTicks = await fetchInfinityCLPoolTicksWithFallback(chainId, infinityPool)

  const routingSdkPool = toRoutingSDKPool(poolWithTicks)

  return { poolId, pool, routingSdkPool, poolInfo, zeroForOne, currencyA, currencyB }
})

export const loadablePoolAtom = loadable(selectedPoolAtom)
