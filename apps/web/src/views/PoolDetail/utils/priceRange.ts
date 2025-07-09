import { getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { FeeAmount, nearestUsableTick, TICK_SPACINGS, TickMath, tickToPrice } from '@pancakeswap/v3-sdk'
import { Bound } from '@pancakeswap/widgets-internal'
import { formatPercentage } from './formatting'

/**
 * Safely converts tick to price using V3 SDK
 * Used in InfinityCL and V3 position tables
 */
export const getTickPrice = (tick: number, token0: any, token1: any): number => {
  try {
    // Use TickMath constants for bounds checking
    if (tick >= TickMath.MAX_TICK) return Infinity
    if (tick <= TickMath.MIN_TICK) return 0

    // Use the V3 SDK's tickToPrice function for accurate calculation
    if (token0 && token1) {
      const price = tickToPrice(token0, token1, tick)
      return parseFloat(price.toSignificant(10))
    }

    // Fallback
    return 1.0001 ** tick
  } catch (error) {
    console.error('Error calculating tick price:', error)
    return 1.0001 ** tick
  }
}

/**
 * Calculates tick limits for full range detection
 * Used in InfinityCL and V3 position tables
 */
export const calculateTickLimits = (
  tickSpacing: number | undefined,
): {
  [bound in Bound]: number | undefined
} => {
  return {
    [Bound.LOWER]: tickSpacing ? nearestUsableTick(TickMath.MIN_TICK, tickSpacing) : undefined,
    [Bound.UPPER]: tickSpacing ? nearestUsableTick(TickMath.MAX_TICK, tickSpacing) : undefined,
  }
}

/**
 * Determines if ticks are at their limits (for full range detection)
 * Used in InfinityCL and V3 position tables
 */
export const getTickAtLimitStatus = (
  tickLower: number,
  tickUpper: number,
  ticksLimit: { [bound in Bound]: number | undefined },
): { [bound in Bound]: boolean } => {
  return {
    [Bound.LOWER]: tickLower && ticksLimit.LOWER ? tickLower <= ticksLimit.LOWER : false,
    [Bound.UPPER]: tickUpper && ticksLimit.UPPER ? tickUpper >= ticksLimit.UPPER : false,
  }
}

/**
 * Gets tick spacing from pool or fee tier
 * Used in V3 position table
 */
export const getTickSpacing = (pool: any, feeTier?: FeeAmount): number | undefined => {
  return pool?.tickSpacing ?? (feeTier ? TICK_SPACINGS[feeTier] : undefined)
}

/**
 * Common interface for price range calculation result
 */
export interface PriceRangeData {
  minPriceFormatted: string
  maxPriceFormatted: string
  minPercentage: string
  maxPercentage: string
  rangePosition: number
  showPercentages: boolean
}

/**
 * Calculates price range data for tick-based positions (InfinityCL, V3)
 * Common logic extracted from InfinityCL and V3 position tables
 */
export const calculateTickBasedPriceRange = (
  tickLower: number,
  tickUpper: number,
  token0: any,
  token1: any,
  pool: any,
  isTickAtLimit: { [bound in Bound]: boolean },
): PriceRangeData => {
  let minPriceFormatted = '-'
  let maxPriceFormatted = '-'
  let minPercentage = ''
  let maxPercentage = ''
  let rangePosition = 50
  let showPercentages = false

  // Calculate prices using tick-to-price conversion
  const minPrice = getTickPrice(tickLower, token0, token1)
  const maxPrice = getTickPrice(tickUpper, token0, token1)

  // Format prices with special handling for tick limits
  minPriceFormatted = isTickAtLimit.LOWER ? '0' : formatAmount(minPrice, { notation: 'standard' }) || '-'
  maxPriceFormatted = isTickAtLimit.UPPER ? '∞' : formatAmount(maxPrice, { notation: 'standard' }) || '-'

  // Handle full range positions
  if (isTickAtLimit.LOWER && isTickAtLimit.UPPER) {
    rangePosition = 50
    showPercentages = true
    minPercentage = '0%'
    maxPercentage = '100%'
    minPriceFormatted = '0'
    maxPriceFormatted = '∞'
  } else if (pool?.token0Price && tickLower > TickMath.MIN_TICK && tickUpper < TickMath.MAX_TICK) {
    // Calculate percentages only if prices are not at limits and pool exists
    try {
      const currentPrice = parseFloat(pool.token0Price.toSignificant(6))

      if (
        currentPrice > 0 &&
        maxPrice > minPrice &&
        Number.isFinite(minPrice) &&
        Number.isFinite(maxPrice) &&
        Number.isFinite(currentPrice)
      ) {
        const minPercent = ((minPrice - currentPrice) / currentPrice) * 100
        const maxPercent = ((maxPrice - currentPrice) / currentPrice) * 100

        if (
          // Only show percentages if they're reasonable finite values
          Number.isFinite(minPercent) &&
          Number.isFinite(maxPercent) &&
          Math.abs(minPercent) < 10000 &&
          Math.abs(maxPercent) < 10000
        ) {
          minPercentage = formatPercentage(minPercent)
          maxPercentage = formatPercentage(maxPercent)
          rangePosition = Math.max(0, Math.min(100, ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100))
          showPercentages = true
        }
      }
    } catch (error) {
      // If any calculation fails, just show the price range without percentages
      console.warn('Price calculation error:', error)
    }
  }

  return {
    minPriceFormatted,
    maxPriceFormatted,
    minPercentage,
    maxPercentage,
    rangePosition,
    showPercentages,
  }
}

/**
 * Calculates price range data for bin-based positions (InfinityBin)
 * Extracted from InfinityBin position table
 */
export const calculateBinBasedPriceRange = (
  minBinId: number | null,
  maxBinId: number | null,
  binStep: number,
  activeId: number | undefined,
  token0: any,
  token1: any,
): PriceRangeData => {
  let minPriceFormatted = '-'
  let maxPriceFormatted = '-'
  let minPercentage = ''
  let maxPercentage = ''
  let rangePosition = 50
  let showPercentages = false

  if (minBinId && maxBinId && binStep && token0 && token1) {
    const minPrice = getCurrencyPriceFromId(minBinId, binStep, token0, token1)
    const maxPrice = getCurrencyPriceFromId(maxBinId, binStep, token0, token1)
    const currentPrice = activeId ? getCurrencyPriceFromId(activeId, binStep, token0, token1) : undefined

    if (minPrice && maxPrice) {
      // Check for extreme values and format accordingly
      const minPriceFloat = parseFloat(minPrice.toSignificant(6))
      const maxPriceFloat = parseFloat(maxPrice.toSignificant(6))

      // Show '0' for extremely low prices and '∞' for extremely high prices
      if (minPriceFloat === 0 || !Number.isFinite(minPriceFloat)) {
        minPriceFormatted = '0'
      } else {
        minPriceFormatted = formatAmount(minPriceFloat, { notation: 'standard' }) || '-'
      }

      if (maxPriceFloat === Infinity || !Number.isFinite(maxPriceFloat)) {
        maxPriceFormatted = '∞'
      } else {
        maxPriceFormatted = formatAmount(maxPriceFloat, { notation: 'standard' }) || '-'
      }

      // Calculate percentages if we have current price and position is not removed
      if (currentPrice) {
        try {
          const currentPriceFloat = parseFloat(currentPrice.toSignificant(6))
          const minPriceFloat = parseFloat(minPrice.toSignificant(6))
          const maxPriceFloat = parseFloat(maxPrice.toSignificant(6))

          if (
            currentPriceFloat > 0 &&
            maxPriceFloat > minPriceFloat &&
            Number.isFinite(minPriceFloat) &&
            Number.isFinite(maxPriceFloat) &&
            Number.isFinite(currentPriceFloat)
          ) {
            const minPercent = ((minPriceFloat - currentPriceFloat) / currentPriceFloat) * 100
            const maxPercent = ((maxPriceFloat - currentPriceFloat) / currentPriceFloat) * 100

            if (
              Number.isFinite(minPercent) &&
              Number.isFinite(maxPercent) &&
              Math.abs(minPercent) < 10000 &&
              Math.abs(maxPercent) < 10000
            ) {
              minPercentage = formatPercentage(minPercent)
              maxPercentage = formatPercentage(maxPercent)
              rangePosition = Math.max(
                0,
                Math.min(100, ((currentPriceFloat - minPriceFloat) / (maxPriceFloat - minPriceFloat)) * 100),
              )
              showPercentages = true
            }
          }
        } catch (error) {
          console.warn('Price calculation error:', error)
        }
      }
    }
  }

  return {
    minPriceFormatted,
    maxPriceFormatted,
    minPercentage,
    maxPercentage,
    rangePosition,
    showPercentages,
  }
}
