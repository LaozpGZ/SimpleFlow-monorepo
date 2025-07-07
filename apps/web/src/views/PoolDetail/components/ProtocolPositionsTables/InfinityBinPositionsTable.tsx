import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Button, Flex, FlexGap, Tag, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { DoubleCurrencyLogo } from '@pancakeswap/widgets-internal'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId } from 'hooks/infinity/useFarmReward'
import { usePoolById } from 'hooks/infinity/usePool'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useMemo } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { InfinityBinPositionDetail, POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { InfinityBinPoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { PositionsTable } from '../Tabs/PositionsTable'
import { PositionFilter } from './types'

interface InfinityBinPositionsTableProps {
  poolInfo: InfinityBinPoolInfo
  filter: PositionFilter
  handleHarvestAll: () => void
}

// Individual position component that calculates its own APR
const InfinityBinPositionTableRow = (
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
    <FlexGap alignItems="center" gap="12px">
      <DoubleCurrencyLogo currency0={poolInfo.token0} currency1={poolInfo.token1} size={40} />
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
    </FlexGap>
  )

  const liquidity = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px">
        {formatDollarAmount(totalTVLUsd)}
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
      <Button variant="tertiary" scale="sm" disabled={(position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED}>
        -
      </Button>
      <Button variant="tertiary" scale="sm" disabled={(position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED}>
        +
      </Button>
    </FlexGap>
  )

  return {
    tokenInfo,
    liquidity,
    earnings,
    apr: aprDisplay,
    priceRange,
    actions,
    // Return calculated values for aggregation
    liquidityUSD: totalTVLUsd,
    totalApr,
    hasLiquidity,
  }
}

export const InfinityBinPositionsTable: React.FC<InfinityBinPositionsTableProps> = ({
  poolInfo,
  filter,
  handleHarvestAll,
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [, pool] = usePoolById<'Bin'>(poolInfo.poolId as `0x${string}`, chainId)
  const { data: poolKey } = usePoolKeyByPoolId(poolInfo.poolId, chainId)

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

  const filteredPositions = useMemo(() => {
    if (!positions.length) return []

    return positions.filter((position: InfinityBinPositionDetail) => {
      if (filter === PositionFilter.All) return true

      if ((position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED) {
        return filter === PositionFilter.Closed
      }

      if (filter === PositionFilter.Active) return (position.status as POSITION_STATUS) === POSITION_STATUS.ACTIVE
      if (filter === PositionFilter.Inactive) return (position.status as POSITION_STATUS) === POSITION_STATUS.INACTIVE
      if (filter === PositionFilter.Closed) return (position.status as POSITION_STATUS) === POSITION_STATUS.CLOSED

      return false
    })
  }, [positions, filter])

  // Call hooks at the top level for all positions
  const positionAprs = useMemo(() => {
    if (!filteredPositions.length) return {}

    const aprs: Record<string, { lpApr: number; cakeApr: { value: number } | null; merklApr: number }> = {}

    filteredPositions.forEach((position, index) => {
      // For now, return default values - we can implement proper APR calculation later
      aprs[index.toString()] = {
        lpApr: 0,
        cakeApr: { value: 0 },
        merklApr: 0,
      }
    })

    return aprs
  }, [filteredPositions])

  // Calculate position amounts at top level
  const positionAmounts = useMemo(() => {
    if (!filteredPositions.length) return {}

    const amounts: Record<
      string,
      { amount0: CurrencyAmount<any> | undefined; amount1: CurrencyAmount<any> | undefined; totalTVLUsd: number }
    > = {}

    filteredPositions.forEach((position, index) => {
      const amount0 =
        position?.reserveX && pool?.token0 ? CurrencyAmount.fromRawAmount(pool.token0, position.reserveX) : undefined
      const amount1 =
        position?.reserveY && pool?.token1 ? CurrencyAmount.fromRawAmount(pool.token1, position.reserveY) : undefined

      // For now, return 0 for TVL - we can implement proper calculation later
      amounts[index.toString()] = {
        amount0,
        amount1,
        totalTVLUsd: 0,
      }
    })

    return amounts
  }, [filteredPositions, pool])

  const { tableData, totalLiquidityUSD, totalApr } = useMemo(() => {
    if (!filteredPositions.length) {
      return { tableData: [], totalLiquidityUSD: 0, totalApr: 0 }
    }

    let totalLiquidity = 0
    let totalAprWeighted = 0
    let validPositions = 0

    const data = filteredPositions.map((position, index) => {
      const key = index.toString()
      const aprData = positionAprs[key] || { lpApr: 0, cakeApr: { value: 0 }, merklApr: 0 }
      const { amount0, amount1, totalTVLUsd } = positionAmounts[key] || {
        amount0: undefined,
        amount1: undefined,
        totalTVLUsd: 0,
      }

      const row = InfinityBinPositionTableRow(position, poolInfo, pool, aprData, amount0, amount1, totalTVLUsd, t)

      if (row.hasLiquidity) {
        totalLiquidity += row.liquidityUSD || 0
        totalAprWeighted += row.totalApr || 0
        validPositions++
      }

      return row
    })

    return {
      tableData: data,
      totalLiquidityUSD: totalLiquidity,
      totalApr: validPositions > 0 ? totalAprWeighted / validPositions : 0,
    }
  }, [filteredPositions, poolInfo, pool, positionAprs, positionAmounts, t])

  if (isLoading) {
    return <div>{t('Loading...')}</div>
  }

  return (
    <PositionsTable
      poolInfo={poolInfo}
      totalLiquidityUSD={totalLiquidityUSD}
      totalApr={totalApr}
      handleHarvestAll={handleHarvestAll}
      data={tableData}
    />
  )
}
