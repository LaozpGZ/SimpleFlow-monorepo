import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { AddIcon, Flex, FlexGap, MinusIcon, Tag, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { BigNumber as BN } from 'bignumber.js'
import { getAddInfinityLiquidityURL } from 'config/constants/liquidity'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId } from 'hooks/infinity/useFarmReward'
import { usePoolById } from 'hooks/infinity/usePool'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { $path } from 'next-typesafe-url'
import router from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { InfinityBinPositionDetail, POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { InfinityBinPoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'views/CakeStaking/components/Tooltips'
import {
  AprData,
  calculateBinBasedPriceRange,
  calculateTotalApr,
  convertAprDataToNumbers,
  formatPoolDetailFiatNumber,
  getBinPositionStatus,
} from 'views/PoolDetail/utils'
import { InfinityPositionActions } from 'views/universalFarms/components/PositionActions/InfinityPositionActions'
import { useInfinityPositions } from 'views/universalFarms/hooks/useInfinityPositions'
import { useInfinityBinPositionApr } from 'views/universalFarms/hooks/usePositionAPR'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { ActionButton } from '../styles'
import { InfinityBinEarningsCell } from './PoolEarningsCells'
import { PositionsTable } from './PositionsTable'
import { PriceRangeDisplay } from './PriceRangeDisplay'
import { PositionFilter } from './types'
import { EmptyPositionCard, LoadingCard } from './UtilityCards'

// Interface for transformed Bin position data
interface TransformedBinPosition {
  positionId: string
  tableRow: {
    tokenInfo: React.ReactElement
    liquidity: React.ReactElement
    earnings: React.ReactElement
    apr: React.ReactElement
    priceRange: React.ReactElement
    actions: React.ReactElement
    protocol: Protocol
    poolId: string
  }
  liquidityUSD: number
  totalApr: number
  hasLiquidity?: boolean
}

interface InfinityBinPositionsTableProps {
  poolInfo: InfinityBinPoolInfo
}

// Helper function to transform position data for table - NO HOOKS ALLOWED
const transformInfinityBinPositionToTableRow = (
  position: InfinityBinPositionDetail,
  poolInfo: InfinityBinPoolInfo,
  pool: any,
  aprData: AprData,
  amount0: CurrencyAmount<any> | undefined,
  amount1: CurrencyAmount<any> | undefined,
  totalTVLUsd: number,
  price0Usd: number | undefined,
  price1Usd: number | undefined,
  t: (key: string) => string,
) => {
  // Calculate actual price range from bin IDs for LBAMM using utility function
  const { removed, outOfRange } = getBinPositionStatus(position.status as POSITION_STATUS)

  const hasLiquidity = amount0?.greaterThan('0') || amount1?.greaterThan('0')

  const tokenInfo = (
    <FlexGap flexDirection="column" gap="4px">
      <FlexGap alignItems="center" gap="8px">
        <Text bold fontSize="16px">
          {poolInfo.token0?.symbol} / {poolInfo.token1?.symbol}{' '}
          <Text as="span" color="textSubtle">
            #{poolInfo.pid}
          </Text>
        </Text>
        {position.isStaked && !removed && (
          <Tag variant="primary60" scale="sm">
            {t('Farming')}
          </Tag>
        )}
      </FlexGap>
    </FlexGap>
  )

  const liquidityUSD = new BN(amount0?.toExact() ?? 0)
    .times(price0Usd ?? 0)
    .plus(new BN(amount1?.toExact() ?? 0).times(price1Usd ?? 0))
    .toNumber()

  const liquidity = (
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
        <InfinityBinEarningsCell chainId={poolInfo.chainId} poolId={poolInfo.poolId} />
      </Text>
    </Flex>
  )

  const totalApr = calculateTotalApr(convertAprDataToNumbers(aprData))
  const aprDisplay = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px" color={totalApr > 0 ? 'success' : 'text'}>
        {displayApr(totalApr)}
      </Text>
    </Flex>
  )

  // Use utility function for price range calculation
  const priceRangeData = calculateBinBasedPriceRange(
    position.minBinId,
    position.maxBinId,
    pool?.binStep,
    pool?.activeId,
    poolInfo.token0,
    poolInfo.token1,
  )

  const priceRange = (
    <PriceRangeDisplay
      minPrice={priceRangeData.minPriceFormatted}
      maxPrice={priceRangeData.maxPriceFormatted}
      minPercentage={priceRangeData.minPercentage}
      maxPercentage={priceRangeData.maxPercentage}
      rangePosition={priceRangeData.rangePosition}
      outOfRange={outOfRange}
      removed={removed}
      currentPrice={priceRangeData.currentPrice || pool?.token0Price?.toSignificant(18)}
      showPercentages={priceRangeData.showPercentages}
    />
  )

  const actions = (
    <FlexGap gap="8px" alignItems="center" justifyContent="flex-end">
      <ActionButton
        as="a"
        href={$path({
          route: '/liquidity/position/[[...positionId]]',
          routeParams: {
            positionId: [Protocol.InfinityBIN, position.poolId.toString(), 'decrease'],
          },
        })}
        disabled={(position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED}
        isIcon
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <MinusIcon />
      </ActionButton>
      <ActionButton
        as="a"
        href={getAddInfinityLiquidityURL({ poolId: poolInfo.poolId, chainId: poolInfo.chainId })}
        disabled={(position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED}
        isIcon
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <AddIcon />
      </ActionButton>
    </FlexGap>
  )

  return {
    positionId: `${position.chainId}-${position.poolId}`,
    tableRow: {
      tokenInfo,
      liquidity,
      earnings,
      apr: aprDisplay,
      priceRange,
      actions,
      // Add raw data for onRowClick handler
      protocol: Protocol.InfinityBIN,
      poolId: position.poolId,
    },
    liquidityUSD,
    totalApr,
    hasLiquidity,
  }
}

// Individual position row component that calls the APR hook
const InfinityBinPositionRow: React.FC<{
  position: InfinityBinPositionDetail
  poolInfo: InfinityBinPoolInfo
  pool: any
  onRowDataReady: (data: TransformedBinPosition) => void
}> = ({ position, poolInfo, pool, onRowDataReady }) => {
  const { t } = useTranslation()

  // This is where the magic happens - individual APR hook call for each position
  const aprData = useInfinityBinPositionApr(poolInfo, position)

  // Calculate position amounts
  const amount0 = useMemo(
    () =>
      position?.reserveX && pool?.token0 ? CurrencyAmount.fromRawAmount(pool.token0, position.reserveX) : undefined,
    [position?.reserveX, pool?.token0],
  )
  const amount1 = useMemo(
    () =>
      position?.reserveY && pool?.token1 ? CurrencyAmount.fromRawAmount(pool.token1, position.reserveY) : undefined,
    [position?.reserveY, pool?.token1],
  )

  const { data: price0Usd } = useCurrencyUsdPrice(pool?.token0 ?? undefined, {
    enabled: Boolean(pool?.token0 && amount0?.greaterThan('0')),
  })
  const { data: price1Usd } = useCurrencyUsdPrice(pool?.token1 ?? undefined, {
    enabled: Boolean(pool?.token1 && amount1?.greaterThan('0')),
  })

  // Use utility function to convert APR data
  const convertedAprData = useMemo(() => convertAprDataToNumbers(aprData), [aprData])

  // Transform the data with the fetched APR
  const transformedData = useMemo(() => {
    // For now, use 0 for TVL - we can implement proper calculation later
    const totalTVLUsd = 0

    return transformInfinityBinPositionToTableRow(
      position,
      poolInfo,
      pool,
      convertedAprData,
      amount0,
      amount1,
      totalTVLUsd,
      price0Usd,
      price1Usd,
      t,
    )
  }, [position, poolInfo, pool, convertedAprData, amount0, amount1, t, price0Usd, price1Usd])

  // Pass data back to parent whenever it changes
  useEffect(() => {
    onRowDataReady(transformedData)
  }, [transformedData, onRowDataReady])

  return null // This component doesn't render anything
}

export const InfinityBinPositionsTable: React.FC<InfinityBinPositionsTableProps> = ({ poolInfo }) => {
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [, pool] = usePoolById<'Bin'>(poolInfo.poolId as `0x${string}`, chainId)
  const { data: poolKey } = usePoolKeyByPoolId(poolInfo.poolId, chainId)

  const [filter, setFilter] = useState(PositionFilter.All)
  const [transformedPositions, setTransformedPositions] = useState<TransformedBinPosition[]>([])

  const { data: infinityBinData, isLoading } = useAccountPositionDetailByPool<Protocol.InfinityBIN>(
    chainId,
    account,
    poolInfo,
  )

  // Get all infinity positions for the harvest modal
  const { data: allInfinityPositions } = useInfinityPositions()

  const {
    data: { rewardsAmount, rewardsUSD },
    isLoading: isLoadingRewards,
  } = useUnclaimedFarmRewardsUSDByPoolId({
    poolId: poolInfo.poolId,
    chainId: poolInfo.chainId,
    address: account,
    timestamp: dayjs().startOf('hour').unix(),
  })

  // Create default position if there are unclaimed rewards but no position data
  const defaultPosition = useMemo((): InfinityBinPositionDetail => {
    return {
      status: POSITION_STATUS.CLOSED,
      chainId: poolInfo.chainId,
      protocol: poolInfo.protocol,
      poolKey,
      poolId: poolInfo.poolId,
      activeId: pool?.activeId ?? 0,
      reserveX: 0n,
      reserveY: 0n,
      maxBinId: null,
      minBinId: null,
      reserveOfBins: [],
      liquidity: 0n,
      activeLiquidity: 0n,
      poolActiveLiquidity: 0n,
    }
  }, [pool, poolKey, poolInfo])

  const positions = useMemo((): InfinityBinPositionDetail[] => {
    const positionData = infinityBinData || []

    // If there are rewards but no position, show the default position
    if (!isLoading && !isLoadingRewards && !positionData.length && rewardsAmount?.greaterThan('0')) {
      return [defaultPosition]
    }

    return positionData
  }, [infinityBinData, isLoading, isLoadingRewards, defaultPosition, rewardsAmount])

  // Handle data from individual position rows
  const handleRowDataReady = useCallback((data: TransformedBinPosition) => {
    setTransformedPositions((prev) => {
      const existing = prev.find((p) => p.positionId === data.positionId)
      if (existing) {
        return prev.map((p) => (p.positionId === data.positionId ? data : p))
      }
      return [...prev, data]
    })
  }, [])

  // Smart update of transformed positions - only reset when structure changes, not data updates
  useEffect(() => {
    setTransformedPositions((prev) => {
      // Create position ID set for current positions
      const currentPositionIds = new Set(positions.map((p) => `${p.chainId}-${p.poolId}`))

      // Remove transformed positions that no longer exist
      const filteredPrev = prev.filter((tp) => currentPositionIds.has(tp.positionId))

      // If the filtered array has the same length as current positions, structure hasn't changed
      if (filteredPrev.length === positions.length) {
        return filteredPrev
      }

      // Structure changed, return filtered array and let individual rows populate new entries
      return filteredPrev
    })
  }, [positions])

  // Create individual position row components that fetch APR data
  const positionRowComponents = useMemo(() => {
    if (!positions.length) return []

    return positions.map((position, index) => (
      <InfinityBinPositionRow
        key={`${position.chainId}-${position.poolId}-${index}`}
        position={position}
        poolInfo={poolInfo}
        pool={pool}
        onRowDataReady={handleRowDataReady}
      />
    ))
  }, [positions, poolInfo, pool, handleRowDataReady])

  const filteredPositions = useMemo(() => {
    if (!transformedPositions.length) return []

    return transformedPositions.filter((position) => {
      if (filter === PositionFilter.All) return true

      // Use the position status from the original data for filtering
      const originalPosition = positions.find((p) => `${p.chainId}-${p.poolId}` === position.positionId)
      if (!originalPosition) return false

      if ((originalPosition.status as POSITION_STATUS) === POSITION_STATUS.CLOSED) {
        return filter === PositionFilter.Closed
      }

      if (filter === PositionFilter.Active)
        return (originalPosition.status as POSITION_STATUS) === POSITION_STATUS.ACTIVE
      if (filter === PositionFilter.Inactive)
        return (originalPosition.status as POSITION_STATUS) === POSITION_STATUS.INACTIVE
      if (filter === PositionFilter.Closed)
        return (originalPosition.status as POSITION_STATUS) === POSITION_STATUS.CLOSED

      return false
    })
  }, [transformedPositions, filter, positions])

  // Show loading state
  if (isLoading) {
    return <LoadingCard />
  }

  // Show empty state when no positions exist and no rewards
  if (!infinityBinData?.length && (!rewardsAmount || !rewardsAmount.greaterThan('0'))) {
    return <EmptyPositionCard />
  }

  return (
    <>
      {/* Hidden components that handle APR fetching for each position */}
      {positionRowComponents}

      {/* The actual table component */}
      <PositionsTable
        poolInfo={poolInfo}
        totalLiquidityUSD={filteredPositions.reduce((sum, pos) => sum + (pos.liquidityUSD || 0), 0)}
        totalApr={
          filteredPositions.length > 0
            ? filteredPositions.reduce((sum, pos) => sum + (pos.totalApr || 0), 0) / filteredPositions.length
            : 0
        }
        totalEarnings={formatPoolDetailFiatNumber(rewardsUSD)}
        data={filteredPositions.map((position) => position.tableRow)}
        showInactiveOnly={filter === PositionFilter.Inactive}
        toggleInactiveOnly={() =>
          setFilter(filter === PositionFilter.Inactive ? PositionFilter.All : PositionFilter.Inactive)
        }
        harvestAllButton={
          <InfinityPositionActions
            positionList={allInfinityPositions || []}
            showPositionFees={false}
            chainId={poolInfo.chainId}
          />
        }
        // On row click, navigate to the position detail page
        onRowClick={(position) => {
          router.push(
            $path({
              route: '/liquidity/position/[[...positionId]]',
              routeParams: { positionId: [position.protocol, position.poolId] },
            }),
          )
        }}
      />
    </>
  )
}
