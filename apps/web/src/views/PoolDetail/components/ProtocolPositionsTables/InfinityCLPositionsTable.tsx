import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { AddIcon, Flex, FlexGap, MinusIcon, Tag, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { nearestUsableTick, PositionMath, TickMath } from '@pancakeswap/v3-sdk'

import { Bound, CurrencyLogo } from '@pancakeswap/widgets-internal'
import { BigNumber as BN } from 'bignumber.js'
import { getAddInfinityLiquidityURL } from 'config/constants/liquidity'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId } from 'hooks/infinity/useFarmReward'
import { usePoolById } from 'hooks/infinity/usePool'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { $path } from 'next-typesafe-url'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { InfinityCLPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { InfinityCLPoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'views/CakeStaking/components/Tooltips'
import { InfinityPositionActions } from 'views/universalFarms/components/PositionActions/InfinityPositionActions'
import { useInfinityCLPositionApr } from 'views/universalFarms/hooks/usePositionAPR'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { ActionButton } from '../styles'
import { PositionsTable } from '../Tabs/PositionsTable'
import { InfinityCLEarningsCell } from './PoolEarningsCells'
import { PriceRangeDisplay } from './PriceRangeDisplay'
import { PositionFilter } from './types'
import { EmptyPositionCard, LoadingCard } from './UtilityCards'

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
      ? new BN(amount0.toExact()).times(price0Usd).plus(new BN(amount1.toExact()).times(price1Usd)).toNumber()
      : 0

  // TickLimits
  const ticksLimit: {
    [bound in Bound]: number | undefined
  } = {
    [Bound.LOWER]: position.tickSpacing ? nearestUsableTick(TickMath.MIN_TICK, position.tickSpacing) : undefined,
    [Bound.UPPER]: position.tickSpacing ? nearestUsableTick(TickMath.MAX_TICK, position.tickSpacing) : undefined,
  }

  const isTickAtLimit = {
    [Bound.LOWER]: tickLower && ticksLimit.LOWER ? tickLower <= ticksLimit.LOWER : false,
    [Bound.UPPER]: tickUpper && ticksLimit.UPPER ? tickUpper >= ticksLimit.UPPER : false,
  }

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

  // If position if full range, set range position to 50
  if (!removed && isTickAtLimit.LOWER && isTickAtLimit.UPPER) {
    rangePosition = 50
    showPercentages = true
    minPercentage = '0%'
    maxPercentage = '100%'
  } else if (
    pool?.token0Price &&
    !removed &&
    position.tickLower > TickMath.MIN_TICK &&
    position.tickUpper < TickMath.MAX_TICK
  ) {
    // Only calculate percentages if prices are not at limits and pool exists
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

  const tokenInfo = (
    <FlexGap flexDirection="column" gap="4px">
      <FlexGap alignItems="center" gap="8px">
        <Text bold fontSize="16px">
          {poolInfo.token0?.symbol} / {poolInfo.token1?.symbol}{' '}
          <Text as="span" color="textSubtle">
            #{position.tokenId.toString()}
          </Text>
        </Text>
        {position.isStaked && (
          <Tag variant="primary60" scale="sm">
            {t('Farming')}
          </Tag>
        )}
      </FlexGap>
    </FlexGap>
  )

  const liquidityDisplay = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Tooltips
        content={
          <FlexGap flexDirection="column" alignItems="flex-start" gap="8px">
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={poolInfo.token0} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {poolInfo.token0?.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {amount0?.toSignificant(6)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {amount0 && price0Usd
                  ? formatDollarAmount(new BN(amount0.toExact()).times(price0Usd).toNumber())
                  : '$0.00'}
              </Text>
            </FlexGap>
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={poolInfo.token1} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {poolInfo.token1?.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {amount1?.toSignificant(6)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {amount1 && price1Usd
                  ? formatDollarAmount(new BN(amount1.toExact()).times(price1Usd).toNumber())
                  : '$0.00'}
              </Text>
            </FlexGap>
          </FlexGap>
        }
      >
        <Text bold fontSize="16px" style={{ cursor: 'default' }}>
          {formatDollarAmount(liquidityUSD)}
        </Text>
      </Tooltips>
    </Flex>
  )

  const earnings = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px">
        <InfinityCLEarningsCell
          tokenId={position.tokenId}
          chainId={poolInfo.chainId}
          poolId={poolInfo.poolId}
          currency0={poolInfo.token0}
          currency1={poolInfo.token1}
          tickLower={position.tickLower}
          tickUpper={position.tickUpper}
        />
      </Text>
    </Flex>
  )

  const totalApr = Number(aprData.lpApr || 0) + Number(aprData.cakeApr?.value || 0) + (aprData.merklApr || 0)
  const aprDisplay = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px" color={totalApr > 0 ? 'success' : 'text'}>
        {displayApr(totalApr)}
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
      outOfRange={outOfRange}
      removed={removed}
      showPercentages={showPercentages}
    />
  )

  const actions = (
    <FlexGap gap="8px" alignItems="center" justifyContent="flex-end">
      <ActionButton
        as="a"
        href={$path({
          route: '/liquidity/position/[[...positionId]]',
          routeParams: {
            positionId: [Protocol.InfinityCLAMM, Number(position.tokenId), 'decrease'],
          },
        })}
        disabled={removed}
        isIcon
      >
        <MinusIcon />
      </ActionButton>
      <ActionButton
        as="a"
        href={getAddInfinityLiquidityURL({ poolId: poolInfo.poolId, chainId: poolInfo.chainId })}
        disabled={removed}
        isIcon
      >
        <AddIcon />
      </ActionButton>
    </FlexGap>
  )

  return {
    tokenId: position.tokenId.toString(),
    tableRow: {
      tokenInfo,
      liquidity: liquidityDisplay,
      earnings,
      apr: aprDisplay,
      priceRange,
      actions,
    },
    totalEarnings: earnings,
    liquidityUSD,
    totalApr,
  }
}

// Individual position row component that calls the APR hook
const InfinityCLPositionRow: React.FC<{
  position: InfinityCLPositionDetail
  poolInfo: InfinityCLPoolInfo
  pool: any
  price0Usd: number | undefined
  price1Usd: number | undefined
  onRowDataReady: (data: any) => void
}> = ({ position, poolInfo, pool, price0Usd, price1Usd, onRowDataReady }) => {
  const { t } = useTranslation()

  // This is where the magic happens - individual APR hook call for each position
  const aprData = useInfinityCLPositionApr(poolInfo, position)

  // Transform the data with the fetched APR
  const transformedData = useMemo(() => {
    const convertedAprData = {
      lpApr: parseFloat(aprData.lpApr || '0'),
      cakeApr: { value: parseFloat(aprData.cakeApr?.value || '0') },
      merklApr: aprData.merklApr || 0,
    }

    return transformInfinityCLPositionToTableRow(position, poolInfo, pool, price0Usd, price1Usd, convertedAprData, t)
  }, [position, poolInfo, pool, price0Usd, price1Usd, aprData, t])

  // Pass data back to parent whenever it changes
  useEffect(() => {
    onRowDataReady(transformedData)
  }, [transformedData, onRowDataReady])

  return null // This component doesn't render anything
}

export const InfinityCLPositionsTable: React.FC<InfinityCLPositionsTableProps> = ({ poolInfo }) => {
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [, pool] = usePoolById<'CL'>(poolInfo.poolId as `0x${string}`, chainId)
  const { data: price0Usd } = useCurrencyUsdPrice(poolInfo.token0, {
    enabled: !!poolInfo.token0,
  })
  const { data: price1Usd } = useCurrencyUsdPrice(poolInfo.token1, {
    enabled: !!poolInfo.token1,
  })

  const [filter, setFilter] = useState(PositionFilter.All)
  const [transformedPositions, setTransformedPositions] = useState<any[]>([])

  // Get position data from hooks
  const { data: positionsInPool, isLoading } = useAccountPositionDetailByPool<Protocol.InfinityCLAMM>(
    chainId,
    account,
    poolInfo,
  )

  // Handle data from individual position rows
  const handleRowDataReady = useCallback((data: any) => {
    setTransformedPositions((prev) => {
      const existing = prev.find((p) => p.tokenId === data.tokenId)
      if (existing) {
        return prev.map((p) => (p.tokenId === data.tokenId ? data : p))
      }
      return [...prev, data]
    })
  }, [])

  // Reset transformed positions when positions change
  useEffect(() => {
    setTransformedPositions([])
  }, [positionsInPool])

  // Create individual position row components that fetch APR data
  const positionDataFetchComponents = useMemo(() => {
    if (!positionsInPool) return []

    return positionsInPool.map((position) => (
      <InfinityCLPositionRow
        key={position.tokenId.toString()}
        position={position}
        poolInfo={poolInfo}
        pool={pool}
        price0Usd={price0Usd}
        price1Usd={price1Usd}
        onRowDataReady={handleRowDataReady}
      />
    ))
  }, [positionsInPool, poolInfo, pool, price0Usd, price1Usd, handleRowDataReady])

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

  const {
    data: { rewardsUSD },
  } = useUnclaimedFarmRewardsUSDByPoolId({
    poolId: poolInfo.poolId,
    chainId: poolInfo.chainId,
    address: account,
    timestamp: dayjs().startOf('hour').unix(),
  })

  // Show loading state
  if (isLoading) {
    return <LoadingCard />
  }

  // Show empty state when no positions exist
  if (!positionsInPool || positionsInPool.length === 0) {
    return <EmptyPositionCard />
  }

  return (
    <>
      <PositionsTable
        poolInfo={poolInfo}
        totalLiquidityUSD={filteredPositions.reduce((sum, pos) => sum + pos.liquidityUSD, 0)}
        totalEarnings={formatDollarAmount(rewardsUSD, 2, false)}
        totalApr={
          filteredPositions.length > 0
            ? filteredPositions.reduce((sum, pos) => sum + pos.totalApr, 0) / filteredPositions.length
            : 0
        }
        data={filteredPositions.map((position) => position.tableRow)}
        showInactiveOnly={filter === PositionFilter.Inactive}
        toggleInactiveOnly={() =>
          setFilter(filter === PositionFilter.Inactive ? PositionFilter.All : PositionFilter.Inactive)
        }
        harvestAllButton={
          <InfinityPositionActions
            positionList={positionsInPool || []}
            showPositionFees={false}
            chainId={poolInfo.chainId}
          />
        }
      />

      {/* handles APR fetching for each position */}
      {positionDataFetchComponents}
    </>
  )
}
