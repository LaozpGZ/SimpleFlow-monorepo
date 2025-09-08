import { atom } from 'jotai'
import { isPoolId } from 'hooks/infinity/utils/pool'
import { fetchCLPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'
import { getClPoolWithCache } from 'hooks/infinity/getPool'
import { Token } from '@pancakeswap/sdk'
import { getCurrencyIdWithZeroAddr } from '../../utils'
import { supportedPoolsListAtom } from './poolsListAtom'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

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

  return { pool, zeroForOne }
})
