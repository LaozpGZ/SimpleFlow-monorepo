import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Button, Flex, FlexGap, Tag, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { PositionMath, TickMath } from '@pancakeswap/v3-sdk'
import BigNumber from 'bignumber.js'
import { usePoolById } from 'hooks/infinity/usePool'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useMemo } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { InfinityCLPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { InfinityCLPoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { PositionsTable } from '../Tabs/PositionsTable'
import { PriceRangeDisplay } from './PriceRangeDisplay'
import { PositionFilter } from './types'

// Helper function to calculate price from tick using established patterns
const tickToPrice = (tick: number): number => {
  // Use TickMath constants for bounds checking like existing code
  if (tick >= TickMath.MAX_TICK) return Infinity
  if (tick <= TickMath.MIN_TICK) return 0

  return 1.0001 ** tick
}

// Simple number formatting for prices
const formatPriceNumber = (price: number): string => {
  if (price === 0) return '0'
  if (!Number.isFinite(price)) {
    if (price === Infinity) return '∞'
    if (price === -Infinity) return '-∞'
    return 'NaN'
  }

  // Handle extremely small values (treat as 0)
  if (price < 1e-18) return '0'

  // Handle extremely large values (treat as infinity)
  if (price > 1e30) return '∞'

  if (price < 0.000001) return price.toExponential(2)
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  if (price < 1000) return price.toFixed(2)
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const formatPercentage = (percentage: number): string => {
  if (Math.abs(percentage) < 0.01) return '0%'
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(1)}%`
}

interface InfinityCLPositionsTableProps {
  poolInfo: InfinityCLPoolInfo
  filter: PositionFilter
  handleHarvestAll: () => void
}

// Helper function to transform position data for table - NO HOOKS ALLOWED
const transformInfinityCLPositionToTableRow = (
  position: InfinityCLPositionDetail,
  poolInfo: InfinityCLPoolInfo,
  pool: any,
  price0Usd: number | undefined,
  price1Usd: number | undefined,
  aprData: { lpApr: number; cakeApr: { value: number } | null; merklApr: number },
  t: (key: string) => string,
) => {
  // Calculate position amounts
  const { tickLower, tickUpper, liquidity } = position
  const amount0 = pool
    ? CurrencyAmount.fromRawAmount(
        pool.token0,
        PositionMath.getToken0Amount(pool.tickCurrent, tickLower, tickUpper, pool.sqrtRatioX96, liquidity),
      )
    : undefined
  const amount1 = pool
    ? CurrencyAmount.fromRawAmount(
        pool.token1,
        PositionMath.getToken1Amount(pool.tickCurrent, tickLower, tickUpper, pool.sqrtRatioX96, liquidity),
      )
    : undefined

  const liquidityUSD =
    amount0 && amount1 && price0Usd && price1Usd
      ? new BigNumber(amount0.toExact())
          .times(price0Usd)
          .plus(new BigNumber(amount1.toExact()).times(price1Usd))
          .toNumber()
      : 0

  const outOfRange = pool && (pool.tickCurrent < position.tickLower || pool.tickCurrent >= position.tickUpper)
  const removed = position.liquidity === 0n

  // Calculate and format price range using existing patterns
  const minPrice = tickToPrice(position.tickLower)
  const maxPrice = tickToPrice(position.tickUpper)

  const minPriceFormatted = formatPriceNumber(minPrice)
  const maxPriceFormatted = formatPriceNumber(maxPrice)
  let minPercentage = ''
  let maxPercentage = ''
  let rangePosition = 50
  let showPercentages = false

  // Only calculate percentages if prices are not at limits and pool exists
  if (
    pool?.token0Price &&
    !removed &&
    position.tickLower > TickMath.MIN_TICK &&
    position.tickUpper < TickMath.MAX_TICK
  ) {
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

        // Only show percentages if they're reasonable finite values
        if (
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

  const tokenInfo = (
    <FlexGap flexDirection="column" gap="4px">
      <FlexGap alignItems="center" gap="8px">
        <Text bold fontSize="16px">
          {poolInfo.token0?.symbol} / {poolInfo.token1?.symbol}
        </Text>
        {position.isStaked && (
          <Tag variant="primary60" scale="sm">
            {t('Farming')}
          </Tag>
        )}
      </FlexGap>
      <Text color="textSubtle" fontSize="12px">
        #{position.tokenId.toString()}
      </Text>
    </FlexGap>
  )

  const liquidityDisplay = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px">
        {formatDollarAmount(liquidityUSD)}
      </Text>
      <Text color="textSubtle" fontSize="12px">
        {amount0?.toSignificant(6)} {poolInfo.token0?.symbol}
      </Text>
      <Text color="textSubtle" fontSize="12px">
        {amount1?.toSignificant(6)} {poolInfo.token1?.symbol}
      </Text>
    </Flex>
  )

  const earnings = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px">
        $0.00
      </Text>
      <Text color="textSubtle" fontSize="12px">
        {t('Fees & Rewards')}
      </Text>
    </Flex>
  )

  const totalApr = Number(aprData.lpApr || 0) + Number(aprData.cakeApr?.value || 0) + (aprData.merklApr || 0)
  const aprDisplay = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px" color={totalApr > 0 ? 'success' : 'text'}>
        {displayApr(totalApr)}
      </Text>
      <Text color="textSubtle" fontSize="12px">
        {t('Total APR')}
      </Text>
    </Flex>
  )

  const priceRange = (
    <PriceRangeDisplay
      minPrice={minPriceFormatted}
      maxPrice={maxPriceFormatted}
      minPercentage={minPercentage}
      maxPercentage={maxPercentage}
      rangePosition={rangePosition}
      token0Symbol={poolInfo.token0?.symbol || ''}
      token1Symbol={poolInfo.token1?.symbol || ''}
      outOfRange={outOfRange}
      removed={removed}
      showPercentages={showPercentages}
    />
  )

  const actions = (
    <FlexGap gap="8px" alignItems="center">
      <Button variant="tertiary" scale="sm" disabled={removed}>
        -
      </Button>
      <Button variant="tertiary" scale="sm" disabled={removed}>
        +
      </Button>
    </FlexGap>
  )

  return {
    tableRow: {
      tokenInfo,
      liquidity: liquidityDisplay,
      earnings,
      apr: aprDisplay,
      priceRange,
      actions,
    },
    liquidityUSD,
    totalApr,
  }
}

export const InfinityCLPositionsTable: React.FC<InfinityCLPositionsTableProps> = ({
  poolInfo,
  filter,
  handleHarvestAll,
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [, pool] = usePoolById<'CL'>(poolInfo.poolId as `0x${string}`, chainId)
  const { data: price0Usd } = useCurrencyUsdPrice(poolInfo.token0, {
    enabled: !!poolInfo.token0,
  })
  const { data: price1Usd } = useCurrencyUsdPrice(poolInfo.token1, {
    enabled: !!poolInfo.token1,
  })

  // Get position data from hooks
  const { data: positionsInPool } = useAccountPositionDetailByPool<Protocol.InfinityCLAMM>(chainId, account, poolInfo)

  // Calculate APR and earnings for each position
  const transformedPositions = useMemo(() => {
    if (!positionsInPool) return []

    return positionsInPool.map((position) => {
      // For now, use default APR values - implement proper APR calculation later
      const aprData = {
        lpApr: 0,
        cakeApr: { value: 0 },
        merklApr: 0,
      }

      return transformInfinityCLPositionToTableRow(position, poolInfo, pool, price0Usd, price1Usd, aprData, t)
    })
  }, [positionsInPool, poolInfo, pool, price0Usd, price1Usd, t])

  const filteredPositions = useMemo(() => {
    if (!transformedPositions) return []

    return transformedPositions.filter((position) => {
      const { totalApr, liquidityUSD } = position
      const hasLiquidity = liquidityUSD > 0

      switch (filter) {
        case PositionFilter.Active:
          return hasLiquidity && totalApr > 0
        case PositionFilter.Inactive:
          return hasLiquidity && totalApr === 0
        case PositionFilter.Closed:
          return !hasLiquidity
        default:
          return true
      }
    })
  }, [transformedPositions, filter])

  return (
    <PositionsTable
      poolInfo={poolInfo}
      totalLiquidityUSD={filteredPositions.reduce((sum, pos) => sum + pos.liquidityUSD, 0)}
      totalApr={
        filteredPositions.length > 0
          ? filteredPositions.reduce((sum, pos) => sum + pos.totalApr, 0) / filteredPositions.length
          : 0
      }
      handleHarvestAll={handleHarvestAll}
      data={filteredPositions.map((position) => position.tableRow)}
    />
  )
}
