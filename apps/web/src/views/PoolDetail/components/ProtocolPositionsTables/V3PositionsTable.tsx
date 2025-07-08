import { useTranslation } from '@pancakeswap/localization'
import { NATIVE } from '@pancakeswap/sdk'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { AddIcon, Flex, FlexGap, MinusIcon, Tag, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { nearestUsableTick, PositionMath, TickMath } from '@pancakeswap/v3-sdk'
import { Bound, CurrencyLogo } from '@pancakeswap/widgets-internal'
import { BigNumber } from 'bignumber.js'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { usePoolByChainId } from 'hooks/v3/usePools'
import router from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { PoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'views/CakeStaking/components/Tooltips'
import { useFarmsV3BatchHarvest } from 'views/Farms/hooks/v3/useFarmV3Actions'
import { useV3Positions } from 'views/PoolDetail/hooks/useV3Positions'
import { V3PositionActions } from 'views/universalFarms/components/PositionActions/V3PositionActions'
import { V3UnstakeModalContent } from 'views/universalFarms/components/PositionActions/V3UnstakeModalContent'
import { useCheckShouldSwitchNetwork } from 'views/universalFarms/hooks'
import { useV3CakeEarningsByPool } from 'views/universalFarms/hooks/useCakeEarning'
import { useV3PositionApr } from 'views/universalFarms/hooks/usePositionAPR'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { ActionButton, PrimaryOutlineButton } from '../styles'
import { PositionsTable } from '../Tabs/PositionsTable'
import { V3EarningsCell } from './PoolEarningsCells'
import { PriceRangeDisplay } from './PriceRangeDisplay'
import { PositionFilter } from './types'
import { EmptyPositionCard, LoadingCard } from './UtilityCards'

interface V3PositionsTableProps {
  poolInfo: PoolInfo
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

// Helper function for percentage formatting with bounds checking
const formatPercentage = (percentage: number): string => {
  if (!Number.isFinite(percentage)) return '-%'
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

// Helper function to calculate price from tick using established patterns
const tickToPrice = (tick: number): number => {
  // Use TickMath constants for bounds checking like existing code
  if (tick >= TickMath.MAX_TICK) return Infinity
  if (tick <= TickMath.MIN_TICK) return 0

  return 1.0001 ** tick
}

// Get tick spacing for fee tier
const getTickSpacing = (feeTier: number): number => {
  // Standard V3 tick spacings
  switch (feeTier) {
    case 100:
      return 1
    case 500:
      return 10
    case 3000:
      return 60
    case 10000:
      return 200
    default:
      return 60
  }
}

// Helper function to transform position data for table - NO HOOKS ALLOWED
const transformV3PositionToTableRow = (
  position: PositionDetail,
  poolInfo: PoolInfo,
  positionsData: any[],
  price0Usd: number | undefined,
  price1Usd: number | undefined,
  pool: any,
  aprData: { lpApr: number; cakeApr: { value: number } | null; merklApr: number },
  t: (key: string) => string,
) => {
  const positionData = positionsData?.find((p) => Number(p.tokenId) === Number(position.tokenId))

  let liquidityUSD = 0

  if (positionData) {
    // Method 1: Use Position object amounts (preferred)
    liquidityUSD = new BigNumber(positionData.amount0.toExact())
      .times(price0Usd?.toString() ?? 0)
      .plus(new BigNumber(positionData.amount1.toExact()).times(price1Usd?.toString() ?? 0))
      .toNumber()
  } else if (position.liquidity > 0n && pool && price0Usd && price1Usd) {
    // Method 2: Manual calculation fallback for when Position objects aren't available
    try {
      const tickCurrent = pool.tickCurrent
      const amount0Raw = PositionMath.getToken0Amount(
        tickCurrent,
        position.tickLower,
        position.tickUpper,
        pool.sqrtRatioX96,
        position.liquidity,
      )
      const amount1Raw = PositionMath.getToken1Amount(
        tickCurrent,
        position.tickLower,
        position.tickUpper,
        pool.sqrtRatioX96,
        position.liquidity,
      )

      // Convert from raw amounts to readable amounts
      const amount0 = new BigNumber(amount0Raw.toString()).div(10 ** (poolInfo.token0.wrapped?.decimals || 18))
      const amount1 = new BigNumber(amount1Raw.toString()).div(10 ** (poolInfo.token1.wrapped?.decimals || 18))

      liquidityUSD = amount0.times(price0Usd).plus(amount1.times(price1Usd)).toNumber()
    } catch (error) {
      console.error('Manual liquidity calculation failed:', error)
    }
  }

  const outOfRange = pool && (pool.tickCurrent < position.tickLower || pool.tickCurrent >= position.tickUpper)
  const removed = position.liquidity === 0n

  // Calculate tick limits for full range detection
  const ticksLimit: {
    [bound in Bound]: number | undefined
  } = {
    [Bound.LOWER]: poolInfo.feeTier
      ? nearestUsableTick(TickMath.MIN_TICK, getTickSpacing(poolInfo.feeTier))
      : undefined,
    [Bound.UPPER]: poolInfo.feeTier
      ? nearestUsableTick(TickMath.MAX_TICK, getTickSpacing(poolInfo.feeTier))
      : undefined,
  }

  const isTickAtLimit = {
    [Bound.LOWER]: position.tickLower && ticksLimit.LOWER ? position.tickLower <= ticksLimit.LOWER : false,
    [Bound.UPPER]: position.tickUpper && ticksLimit.UPPER ? position.tickUpper >= ticksLimit.UPPER : false,
  }

  // Format price range data using improved calculation
  let minPriceFormatted = '-'
  let maxPriceFormatted = '-'
  let minPercentage = ''
  let maxPercentage = ''
  let rangePosition = 50
  let showPercentages = false

  if (!removed) {
    // Primary method: Use tick-based price calculation
    const minPrice = tickToPrice(position.tickLower)
    const maxPrice = tickToPrice(position.tickUpper)

    minPriceFormatted = formatPriceNumber(minPrice)
    maxPriceFormatted = formatPriceNumber(maxPrice)

    // If position is full range, set special handling
    if (isTickAtLimit.LOWER && isTickAtLimit.UPPER) {
      rangePosition = 50
      showPercentages = true
      minPercentage = '0%'
      maxPercentage = '100%'
    } else if (pool?.token0Price && position.tickLower > TickMath.MIN_TICK && position.tickUpper < TickMath.MAX_TICK) {
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

    // Fallback: Use positionData prices if available and tick-based calculation seems unreliable
    if (positionData && !showPercentages) {
      try {
        const positionMinPrice = parseFloat(positionData.token0PriceLower.toSignificant(6))
        const positionMaxPrice = parseFloat(positionData.token0PriceUpper.toSignificant(6))

        if (Number.isFinite(positionMinPrice) && Number.isFinite(positionMaxPrice)) {
          minPriceFormatted = formatPriceNumber(positionMinPrice)
          maxPriceFormatted = formatPriceNumber(positionMaxPrice)

          // Try percentage calculation with positionData prices
          if (pool?.token0Price && positionMaxPrice > positionMinPrice) {
            const currentPrice = parseFloat(pool.token0Price.toSignificant(6))

            if (currentPrice > 0 && Number.isFinite(currentPrice)) {
              const minPercent = ((positionMinPrice - currentPrice) / currentPrice) * 100
              const maxPercent = ((positionMaxPrice - currentPrice) / currentPrice) * 100

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
                  Math.min(100, ((currentPrice - positionMinPrice) / (positionMaxPrice - positionMinPrice)) * 100),
                )
                showPercentages = true
              }
            }
          }
        }
      } catch (error) {
        console.warn('Position data price calculation error:', error)
      }
    }
  }

  const tokenInfo = (
    <FlexGap flexDirection="column" gap="4px">
      <FlexGap alignItems="center" gap="8px">
        <Text bold fontSize="16px">
          {poolInfo.token0.wrapped?.symbol} / {poolInfo.token1.wrapped?.symbol}{' '}
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

  const liquidity = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Tooltips
        content={
          <FlexGap flexDirection="column" alignItems="flex-start" gap="8px">
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={poolInfo.token0.wrapped} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {poolInfo.token0.wrapped?.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {positionData?.amount0.toSignificant(6)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {positionData?.amount0 && price0Usd
                  ? formatDollarAmount(new BigNumber(positionData.amount0.toExact()).times(price0Usd).toNumber())
                  : '$0.00'}
              </Text>
            </FlexGap>
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={poolInfo.token1.wrapped} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {poolInfo.token1.wrapped?.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {positionData?.amount1.toSignificant(6)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {positionData?.amount1 && price1Usd
                  ? formatDollarAmount(new BigNumber(positionData.amount1.toExact()).times(price1Usd).toNumber())
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
        <V3EarningsCell
          tokenId={position.tokenId}
          chainId={poolInfo.chainId}
          pool={pool}
          currency0={poolInfo.token0}
          currency1={poolInfo.token1}
        />
      </Text>
    </Flex>
  )

  const totalApr = (aprData.lpApr || 0) + Number(aprData.cakeApr?.value || 0) + (aprData.merklApr || 0)
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

  const currencyKey = (currency: Currency) => {
    if (currency.isNative) return NATIVE[poolInfo.chainId].symbol
    return currency.address
  }

  const actions = (
    <FlexGap gap="8px" alignItems="center" justifyContent="flex-end">
      <ActionButton
        as="a"
        href={`/remove/${position.tokenId.toString()}`}
        disabled={removed}
        isIcon
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <MinusIcon />
      </ActionButton>
      <ActionButton
        as="a"
        href={`/add/${currencyKey(poolInfo.token0)}/${currencyKey(poolInfo.token1)}/${poolInfo.feeTier.toString()}`}
        disabled={removed}
        isIcon
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <AddIcon />
      </ActionButton>
      <V3PositionActions
        chainId={poolInfo.chainId}
        isStaked={position.isStaked}
        removed={removed}
        outOfRange={outOfRange}
        tokenId={position.tokenId}
        modalContent={
          <V3UnstakeModalContent
            chainId={poolInfo.chainId}
            userPosition={position}
            link={`/liquidity/${position.tokenId}`}
            pool={pool}
            totalPriceUSD={liquidityUSD}
            amount0={positionData?.amount0}
            amount1={positionData?.amount1}
            desc={t('Unstake')}
            currency0={poolInfo.token0.wrapped}
            currency1={poolInfo.token1.wrapped}
            removed={removed}
            outOfRange={outOfRange}
            fee={position.fee}
            protocol={position.protocol}
            isStaked={position.isStaked}
            tokenId={position.tokenId}
            detailMode={false}
          />
        }
      />
      {position.isStaked && (
        <ActionButton onClick={(e: React.MouseEvent) => e.stopPropagation()}>{t('Harvest')}</ActionButton>
      )}
      {!position.isStaked && !removed && !outOfRange && (
        <ActionButton onClick={(e: React.MouseEvent) => e.stopPropagation()}>{t('Stake')}</ActionButton>
      )}
    </FlexGap>
  )

  return {
    tokenId: position.tokenId.toString(),
    tableRow: {
      tokenInfo,
      liquidity,
      earnings,
      apr: aprDisplay,
      priceRange,
      actions,
      // Add raw data for onRowClick handler
      protocol: position.protocol,
      tokenId: position.tokenId,
      liquidityUSD,
    },
    totalEarnings: earnings,
    liquidityUSD,
    totalApr,
  }
}

// Individual position row component that calls the APR hook
const V3PositionRow: React.FC<{
  position: PositionDetail
  poolInfo: PoolInfo
  positionsData: any[]
  price0Usd: number | undefined
  price1Usd: number | undefined
  pool: any
  onRowDataReady: (data: any) => void
}> = ({ position, poolInfo, positionsData, price0Usd, price1Usd, pool, onRowDataReady }) => {
  const { t } = useTranslation()

  const aprData = useV3PositionApr(poolInfo, position)

  // Memoize the converted APR data separately to avoid recreating the object
  const convertedAprData = useMemo(
    () => ({
      lpApr: aprData.lpApr || 0,
      cakeApr: { value: parseFloat(aprData.cakeApr?.value || '0') },
      merklApr: aprData.merklApr || 0,
    }),
    [aprData.lpApr, aprData.cakeApr?.value, aprData.merklApr],
  )

  const transformedData = useMemo(() => {
    return transformV3PositionToTableRow(
      position,
      poolInfo,
      positionsData,
      price0Usd,
      price1Usd,
      pool,
      convertedAprData,
      t,
    )
  }, [position, poolInfo, positionsData, price0Usd, price1Usd, pool, convertedAprData, t])

  // Pass data back to parent whenever it changes
  useEffect(() => {
    onRowDataReady(transformedData)
  }, [transformedData, onRowDataReady])

  return null // This component doesn't render anything
}

export const V3PositionsTable: React.FC<V3PositionsTableProps> = ({ poolInfo }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [, pool] = usePoolByChainId(poolInfo.token0.wrapped, poolInfo.token1.wrapped, poolInfo.feeTier)
  const { data: price0Usd } = useCurrencyUsdPrice(poolInfo.token0.wrapped, {
    enabled: !!poolInfo.token0.wrapped,
  })
  const { data: price1Usd } = useCurrencyUsdPrice(poolInfo.token1.wrapped, {
    enabled: !!poolInfo.token1.wrapped,
  })

  const [filter, setFilter] = useState(PositionFilter.All)
  const [transformedPositions, setTransformedPositions] = useState<any[]>([])

  // Get position data from hooks
  const { data: v3Data, isLoading } = useAccountPositionDetailByPool(chainId, account, poolInfo)

  // Memoize the filtered v3Data to avoid recreating the array on every render
  const filteredV3Data = useMemo(() => {
    return (v3Data as PositionDetail[])?.filter((position) => position.liquidity !== 0n)
  }, [v3Data])

  const positionsData = useV3Positions(
    chainId,
    poolInfo.token0.wrapped.address,
    poolInfo.token1.wrapped.address,
    poolInfo.feeTier,
    filteredV3Data,
  )

  const [loading, setLoading] = useState(false)

  const { earningsBusd, isLoading: isLoadingEarnings } = useV3CakeEarningsByPool(poolInfo)
  const { switchNetworkIfNecessary, isLoading: isSwitchingNetwork } = useCheckShouldSwitchNetwork()

  const { onHarvestAll } = useFarmsV3BatchHarvest()

  const handleHarvestAll = useCallback(async () => {
    if (loading || !onHarvestAll || !v3Data) return

    const shouldSwitch = await switchNetworkIfNecessary(chainId)
    if (shouldSwitch) {
      return
    }
    try {
      setLoading(true)

      const tokenIds = (v3Data as PositionDetail[])?.filter((p) => p.isStaked).map((p) => p.tokenId.toString())

      await onHarvestAll(tokenIds)

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }, [loading, setLoading, chainId, switchNetworkIfNecessary, onHarvestAll, v3Data])

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

  // Smart update of transformed positions - only reset when structure changes, not data updates
  useEffect(() => {
    setTransformedPositions((prev) => {
      if (!v3Data) return prev

      // Create position ID set for current positions
      const currentPositionIds = new Set((v3Data as PositionDetail[]).map((p) => p.tokenId.toString()))

      // Remove transformed positions that no longer exist
      const filteredPrev = prev.filter((tp) => currentPositionIds.has(tp.tokenId))

      // If the filtered array has the same length as current positions, structure hasn't changed
      if (filteredPrev.length === (v3Data as PositionDetail[]).length) {
        return filteredPrev
      }

      // Structure changed, return filtered array and let individual rows populate new entries
      return filteredPrev
    })
  }, [v3Data])

  // Create individual position row components that fetch APR data
  const positionRowComponents = useMemo(() => {
    if (!v3Data || !positionsData) return []

    return (v3Data as PositionDetail[]).map((position) => (
      <V3PositionRow
        key={position.tokenId.toString()}
        position={position}
        poolInfo={poolInfo}
        positionsData={positionsData}
        price0Usd={price0Usd}
        price1Usd={price1Usd}
        pool={pool}
        onRowDataReady={handleRowDataReady}
      />
    ))
  }, [v3Data, poolInfo, positionsData, price0Usd, price1Usd, pool, handleRowDataReady])

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

  // Show loading state
  if (isLoading) {
    return <LoadingCard />
  }

  // Show empty state when no positions exist
  if (!v3Data || (v3Data as PositionDetail[]).length === 0) {
    return <EmptyPositionCard />
  }

  return (
    <>
      {/* Hidden components that handle APR fetching for each position */}
      {positionRowComponents}

      {/* The actual table component */}
      <PositionsTable
        poolInfo={poolInfo}
        totalLiquidityUSD={filteredPositions.reduce((sum, pos) => sum + pos.liquidityUSD, 0)}
        totalApr={
          filteredPositions.length > 0
            ? filteredPositions.reduce((sum, pos) => sum + pos.totalApr, 0) / filteredPositions.length
            : 0
        }
        totalEarnings={formatDollarAmount(earningsBusd, 2, false)}
        data={filteredPositions.map((position) => position.tableRow)}
        showInactiveOnly={filter === PositionFilter.Inactive}
        toggleInactiveOnly={() =>
          setFilter(filter === PositionFilter.Inactive ? PositionFilter.All : PositionFilter.Inactive)
        }
        harvestAllButton={
          <PrimaryOutlineButton onClick={handleHarvestAll} disabled={loading || isSwitchingNetwork}>
            {loading ? t('Harvesting...') : t('Harvest All')}
          </PrimaryOutlineButton>
        }
        // On row click, navigate to the position detail page
        onRowClick={(position) => {
          router.push(`/liquidity/${position.tokenId}`)
        }}
      />
    </>
  )
}
