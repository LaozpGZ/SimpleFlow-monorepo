import { InfinityBinPool, InfinityClPool, InfinityPoolWithTvl, PoolType } from '../../v3-router/types'
import { GetInfinityCandidatePoolsParams } from '../types'
import { fillPoolsWithBins, getInfinityBinCandidatePoolsWithoutBins } from './getInfinityBinPools'
import { fillClPoolsWithTicks, getInfinityClCandidatePoolsWithoutTicks } from './getInfinityClPools'
import { getInfinityPoolTvl, getInfinityTvlReference } from './getPoolTvl'

export const getInfinityCandidatePools = async (params: GetInfinityCandidatePoolsParams) => {
  const pools = await getInfinityCandidatePoolsLite(params)
  const clPools = pools.filter((pool) => pool.type === PoolType.InfinityCL) as InfinityClPool[]
  const binPools = pools.filter((pool) => pool.type === PoolType.InfinityBIN) as InfinityBinPool[]

  const [poolWithTicks, poolWithBins] = await Promise.all([
    fillClPoolsWithTicks({
      pools: clPools,
      clientProvider: params.clientProvider,
      gasLimit: params.gasLimit,
    }),
    fillPoolsWithBins({
      pools: binPools,
      clientProvider: params.clientProvider,
      gasLimit: params.gasLimit,
    }),
  ])
  return [...poolWithTicks, ...poolWithBins]
}

export const getInfinityCandidatePoolsLite = async (
  params: GetInfinityCandidatePoolsParams,
): Promise<(InfinityClPool | InfinityBinPool)[]> => {
  const [clPools, binPools, tvlMap] = await Promise.all([
    getInfinityClCandidatePoolsWithoutTicks(params),
    getInfinityBinCandidatePoolsWithoutBins(params),
    getInfinityTvlReference(params),
  ])
  const pools = [...clPools, ...binPools].filter((p) => {
    // if (p.currency0.symbol === 'BNB' && p.currency1.symbol === 'USDT') {
    return p.id.toLowerCase() === '0x7a72f7622305444b6e0cf94e1f5202197155db4cb9bce1ce562e45140faca7a7'
    // }
    // return true
  })
  const poolsWithTvl: InfinityPoolWithTvl[] = pools.map((pool) => {
    return {
      ...pool,
      tvlUSD: getInfinityPoolTvl(tvlMap, pool.id),
    } as InfinityPoolWithTvl
  })
  // const filtered = infinityPoolTvlSelector(params.currencyA, params.currencyB, poolsWithTvl)
  // return filtered as (InfinityClPool | InfinityBinPool)[]
  return poolsWithTvl as (InfinityClPool | InfinityBinPool)[]
}
