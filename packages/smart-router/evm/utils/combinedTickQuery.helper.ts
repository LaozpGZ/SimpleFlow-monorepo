import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import { Tick, FeeAmount, TICK_SPACINGS } from '@pancakeswap/v3-sdk'

import { OnChainProvider, V3Pool, InfinityClPool, PoolType } from '../v3-router/types'
import { fetchCompactPoolsTick } from './compactTickQuery.helper'
import { fetchTickLenPoolsTick } from './tickLenQuery.helper'

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

export type CombinedTickQueryParams = {
  pools: (V3Pool | InfinityClPool)[]
  disableFilterNoTicks?: boolean
} & WithClientProvider &
  WithMulticallGasLimit

/**
 * Combined tick query that tries compact ticks first, then falls back to tickLenQuery by tickmath.
 * This provides the most efficient tick fetching strategy by using compact ticks when possible
 * and falling back to the more comprehensive tickLens approach when needed.
 */
export async function fetchCombinedPoolsTick({
  pools,
  clientProvider,
  gasLimit,
  disableFilterNoTicks,
}: CombinedTickQueryParams): Promise<Record<string, Tick[]>> {
  if (!pools.length) {
    return {}
  }

  console.log(`[combinedTickQuery] Starting with ${pools.length} pools`)

  // First try to fetch compact ticks
  const compactTicksByPool = await fetchCompactPoolsTick({ pools, clientProvider, gasLimit })
  console.log(`[combinedTickQuery] Compact ticks fetched for ${Object.keys(compactTicksByPool).length} pools`)

  // Merge ticks based on range comparison and combine results when beneficial
  const finalTicksByPool: Record<string, Tick[]> = {}
  const poolsNeedingTickLens: (V3Pool | InfinityClPool)[] = []
  const poolsForCombination: (V3Pool | InfinityClPool)[] = []

  // First pass: categorize pools based on compact tick coverage
  for (const pool of pools) {
    const poolKey = getPoolKey(pool)
    const compactTicks = compactTicksByPool[poolKey] || []

    if (compactTicks.length === 0) {
      // No compact ticks, need tickLens only
      poolsNeedingTickLens.push(pool)
    } else {
      // Calculate the expected tickLens range without calling the contract
      const tickSpacing = getTickSpacing(pool)
      const tickRange = getTickRange(pool.type)
      const minIndex = Math.floor((pool.tick - tickRange) / tickSpacing / 256)
      const maxIndex = Math.floor((pool.tick + tickRange) / tickSpacing / 256)

      // Calculate the actual tick range that tickLens would cover
      const tickLenMin = minIndex * 256 * tickSpacing
      const tickLenMax = (maxIndex + 1) * 256 * tickSpacing - 1

      // Get compact ticks range
      const compactMin = Math.min(...compactTicks.map((t) => t.index))
      const compactMax = Math.max(...compactTicks.map((t) => t.index))

      if (compactMin >= tickLenMin && compactMax <= tickLenMax) {
        // Compact ticks range is within tickLens range, use compact ticks only (most efficient)
        finalTicksByPool[poolKey] = compactTicks
      } else {
        // Compact ticks range extends beyond tickLens range, combine both for maximum coverage
        poolsForCombination.push(pool)
      }
    }
  }

  // Second pass: fetch tickLens for pools that need it or for combination
  const allPoolsForTickLens = [...poolsNeedingTickLens, ...poolsForCombination]
  if (allPoolsForTickLens.length > 0) {
    console.log(
      `[combinedTickQuery] Fetching tickLens for ${allPoolsForTickLens.length} pools (${poolsNeedingTickLens.length} tickLens-only, ${poolsForCombination.length} for combination)`,
    )
    const tickLenTicksByPool = await fetchTickLenPoolsTick({
      pools: allPoolsForTickLens,
      clientProvider,
      gasLimit,
      disableFilterNoTicks,
    })

    // Process tickLens-only pools
    for (const pool of poolsNeedingTickLens) {
      const poolKey = getPoolKey(pool)
      finalTicksByPool[poolKey] = tickLenTicksByPool[poolKey] || []
    }

    // Process combination pools
    for (const pool of poolsForCombination) {
      const poolKey = getPoolKey(pool)
      const compactTicks = compactTicksByPool[poolKey] || []
      const tickLenTicks = tickLenTicksByPool[poolKey] || []

      // Combine and deduplicate ticks
      const combinedTicks = combineTicks(compactTicks, tickLenTicks)
      finalTicksByPool[poolKey] = combinedTicks
    }
  }

  const compactOnlyCount = pools.length - allPoolsForTickLens.length
  const tickLensOnlyCount = poolsNeedingTickLens.length
  const combinedCount = poolsForCombination.length
  console.log(
    `[combinedTickQuery] Tick source - compact only: ${compactOnlyCount}, tickLens only: ${tickLensOnlyCount}, combined: ${combinedCount}`,
  )
  console.log(`[combinedTickQuery] Final ticks for ${Object.keys(finalTicksByPool).length} pools`)

  return finalTicksByPool
}

/**
 * Combine ticks from compact and tickLens sources, deduplicating by tick index
 * and preferring tickLens data when there are conflicts (as it's more comprehensive)
 */
function combineTicks(compactTicks: Tick[], tickLenTicks: Tick[]): Tick[] {
  const tickMap = new Map<number, Tick>()

  // Add compact ticks first
  for (const tick of compactTicks) {
    tickMap.set(tick.index, tick)
  }

  // Add tickLens ticks, overwriting compact ticks with same index (tickLens is more comprehensive)
  for (const tick of tickLenTicks) {
    tickMap.set(tick.index, tick)
  }

  // Convert back to array and sort by tick index
  return Array.from(tickMap.values()).sort((a, b) => a.index - b.index)
}

/**
 * Get the appropriate tick spacing for a pool
 */
function getTickSpacing(pool: V3Pool | InfinityClPool): number {
  if (pool.type === PoolType.V3) {
    return TICK_SPACINGS[Number(pool.fee) as FeeAmount]
  }
  return pool.tickSpacing
}

/**
 * Get the tick range for a pool type
 */
function getTickRange(poolType: PoolType): number {
  switch (poolType) {
    case PoolType.V3:
      return 1000
    case PoolType.InfinityCL:
      return 10
    default:
      return 1000
  }
}

/**
 * Get the pool key for indexing
 */
function getPoolKey(pool: V3Pool | InfinityClPool): string {
  if (pool.type === PoolType.V3) {
    return pool.address.toLowerCase()
  }
  return pool.id.toLowerCase()
}
