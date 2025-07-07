import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { AddIcon, Flex, FlexGap, MinusIcon, Tag, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId } from 'hooks/infinity/useFarmReward'
import { usePoolById } from 'hooks/infinity/usePool'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { InfinityBinPositionDetail, POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { InfinityBinPoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'views/CakeStaking/components/Tooltips'
import { useInfinityBinPositionApr } from 'views/universalFarms/hooks/usePositionAPR'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { ActionButton } from '../styles'
import { PositionsTable } from '../Tabs/PositionsTable'
import { PositionFilter } from './types'

interface InfinityBinPositionsTableProps {
  poolInfo: InfinityBinPoolInfo
  handleHarvestAll: () => void
}

// Helper function to transform position data for table - NO HOOKS ALLOWED
const transformInfinityBinPositionToTableRow = (
  position: InfinityBinPositionDetail,
  poolInfo: InfinityBinPoolInfo,
  pool: any,
  aprData: { lpApr: number; cakeApr: { value: number } | null; merklApr: number },
  amount0: CurrencyAmount<any> | undefined,
  amount1: CurrencyAmount<any> | undefined,
  totalTVLUsd: number,
  t: (key: string) => string,
) => {
  const hasLiquidity = amount0?.greaterThan('0') || amount1?.greaterThan('0')

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
        Bin Position
      </Text>
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
                $0.00
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
                $0.00
              </Text>
            </FlexGap>
          </FlexGap>
        }
      >
        <Text bold fontSize="16px" style={{ cursor: 'default' }}>
          {formatDollarAmount(totalTVLUsd)}
        </Text>
      </Tooltips>
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

  // Bin positions show bin range instead of price range
  const priceRange = (
    <Flex flexDirection="column" alignItems="flex-start">
      <FlexGap alignItems="center" gap="8px">
        <Text fontSize="14px">
          {position.minBinId && position.maxBinId ? `${position.minBinId} - ${position.maxBinId}` : '--'}
        </Text>
        {(position.status as POSITION_STATUS) === POSITION_STATUS.INACTIVE && (
          <Text fontSize="12px" color="failure">
            {t('Out of range')}
          </Text>
        )}
        {(position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED && (
          <Text fontSize="12px" color="textSubtle">
            {t('Closed')}
          </Text>
        )}
      </FlexGap>
      <Text color="textSubtle" fontSize="12px">
        {t('Bin Range')}
      </Text>
    </Flex>
  )

  const actions = (
    <FlexGap gap="8px" alignItems="center">
      <ActionButton disabled={(position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED} isIcon>
        <MinusIcon />
      </ActionButton>
      <ActionButton disabled={(position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED} isIcon>
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
    },
    liquidityUSD: totalTVLUsd,
    totalApr,
    hasLiquidity,
  }
}

// Individual position row component that calls the APR hook
const InfinityBinPositionRow: React.FC<{
  position: InfinityBinPositionDetail
  poolInfo: InfinityBinPoolInfo
  pool: any
  onRowDataReady: (data: any) => void
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

  // Transform the data with the fetched APR
  const transformedData = useMemo(() => {
    const convertedAprData = {
      lpApr: parseFloat(aprData.lpApr || '0'),
      cakeApr: { value: parseFloat(aprData.cakeApr?.value || '0') },
      merklApr: aprData.merklApr || 0,
    }

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
      t,
    )
  }, [position, poolInfo, pool, aprData, amount0, amount1, t])

  // Pass data back to parent whenever it changes
  useEffect(() => {
    onRowDataReady(transformedData)
  }, [transformedData, onRowDataReady])

  return null // This component doesn't render anything
}

export const InfinityBinPositionsTable: React.FC<InfinityBinPositionsTableProps> = ({ poolInfo, handleHarvestAll }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [, pool] = usePoolById<'Bin'>(poolInfo.poolId as `0x${string}`, chainId)
  const { data: poolKey } = usePoolKeyByPoolId(poolInfo.poolId, chainId)

  const [filter, setFilter] = useState(PositionFilter.All)
  const [transformedPositions, setTransformedPositions] = useState<any[]>([])

  const { data: infinityBinData, isLoading } = useAccountPositionDetailByPool<Protocol.InfinityBIN>(
    chainId,
    account,
    poolInfo,
  )

  const {
    data: { rewardsAmount },
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
  const handleRowDataReady = useCallback((data: any) => {
    setTransformedPositions((prev) => {
      const existing = prev.find((p) => p.positionId === data.positionId)
      if (existing) {
        return prev.map((p) => (p.positionId === data.positionId ? data : p))
      }
      return [...prev, data]
    })
  }, [])

  // Reset transformed positions when positions change
  useEffect(() => {
    setTransformedPositions([])
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

  if (isLoading) {
    return <div>{t('Loading...')}</div>
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
        handleHarvestAll={handleHarvestAll}
        data={filteredPositions.map((position) => position.tableRow)}
        showInactiveOnly={filter === PositionFilter.Inactive}
        toggleInactiveOnly={() =>
          setFilter(filter === PositionFilter.Inactive ? PositionFilter.All : PositionFilter.Inactive)
        }
      />
    </>
  )
}
