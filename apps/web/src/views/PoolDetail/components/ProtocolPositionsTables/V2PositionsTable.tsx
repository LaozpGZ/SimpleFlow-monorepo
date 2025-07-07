import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Flex, FlexGap, MinusIcon, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { StableLPDetail, V2LPDetail } from 'state/farmsV4/state/accountPositions/type'
import { StablePoolInfo, V2PoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'views/CakeStaking/components/Tooltips'
import { useV2PositionApr } from 'views/universalFarms/hooks/usePositionAPR'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { ActionButton } from '../styles'
import { PositionsTable } from '../Tabs/PositionsTable'
import { PositionFilter } from './types'

interface V2PositionsTableProps {
  poolInfo: V2PoolInfo | StablePoolInfo
  handleHarvestAll: () => void
}

// Helper function to transform position data for table - NO HOOKS ALLOWED
const transformV2PositionToTableRow = (
  position: V2LPDetail | StableLPDetail,
  poolInfo: V2PoolInfo | StablePoolInfo,
  aprData: { lpApr: number; cakeApr: { value: number } | null; merklApr: number },
  t: (key: string) => string,
) => {
  const liquidityUSD = 0 // TODO: Calculate actual liquidity USD

  const tokenInfo = (
    <FlexGap flexDirection="column" gap="4px">
      <Text bold fontSize="16px">
        {poolInfo.token0?.symbol} / {poolInfo.token1?.symbol}
      </Text>
      <Text color="textSubtle" fontSize="12px">
        {poolInfo.protocol === 'v2' ? 'V2 LP' : 'Stable LP'}
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
                  --
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
                  --
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
          {formatDollarAmount(liquidityUSD)}
        </Text>
      </Tooltips>
      <Text color="textSubtle" fontSize="12px">
        {position.nativeBalance.toSignificant(6)} LP
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

  const totalApr = (aprData.lpApr || 0) + Number(aprData.cakeApr?.value || 0) + (aprData.merklApr || 0)
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
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px">
        {t('Full Range')}
      </Text>
      <Text color="textSubtle" fontSize="12px">
        {poolInfo.token0?.symbol} per {poolInfo.token1?.symbol}
      </Text>
    </Flex>
  )

  const actions = (
    <FlexGap gap="8px" alignItems="center">
      <ActionButton isIcon>
        <AddIcon />
      </ActionButton>
      <ActionButton isIcon>
        <MinusIcon />
      </ActionButton>
      {poolInfo.protocol === 'v2' && <ActionButton>{t('Migrate')}</ActionButton>}
    </FlexGap>
  )

  return {
    positionId: `${poolInfo.chainId}-${poolInfo.lpAddress}`,
    tableRow: {
      tokenInfo,
      liquidity,
      earnings,
      apr: aprDisplay,
      priceRange,
      actions,
    },
    liquidityUSD,
    totalApr,
  }
}

// Individual position row component that calls the APR hook
const V2PositionRow: React.FC<{
  position: V2LPDetail | StableLPDetail
  poolInfo: V2PoolInfo | StablePoolInfo
  onRowDataReady: (data: any) => void
}> = ({ position, poolInfo, onRowDataReady }) => {
  const { t } = useTranslation()

  // This is where the magic happens - individual APR hook call for each position
  const aprData = useV2PositionApr(poolInfo, position)

  // Transform the data with the fetched APR
  const transformedData = useMemo(() => {
    const convertedAprData = {
      lpApr: aprData.lpApr || 0,
      cakeApr: { value: parseFloat(aprData.cakeApr?.value || '0') },
      merklApr: aprData.merklApr || 0,
    }

    return transformV2PositionToTableRow(position, poolInfo, convertedAprData, t)
  }, [position, poolInfo, aprData, t])

  // Pass data back to parent whenever it changes
  useEffect(() => {
    onRowDataReady(transformedData)
  }, [transformedData, onRowDataReady])

  return null // This component doesn't render anything
}

export const V2PositionsTable: React.FC<V2PositionsTableProps> = ({ poolInfo, handleHarvestAll }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [filter, setFilter] = useState(PositionFilter.All)
  const [transformedPositions, setTransformedPositions] = useState<any[]>([])

  // Only fetch V2/Stable data
  const { data: v2OrStableData, isLoading } = useAccountPositionDetailByPool<Protocol.V2 | Protocol.STABLE>(
    chainId,
    account,
    poolInfo,
  )

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
  }, [v2OrStableData])

  // Create individual position row components that fetch APR data
  const positionRowComponents = useMemo(() => {
    if (!v2OrStableData) return []

    return [
      <V2PositionRow
        key={`${poolInfo.chainId}-${poolInfo.lpAddress}`}
        position={v2OrStableData}
        poolInfo={poolInfo}
        onRowDataReady={handleRowDataReady}
      />,
    ]
  }, [v2OrStableData, poolInfo, handleRowDataReady])

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
        totalLiquidityUSD={filteredPositions.reduce((sum, pos) => sum + pos.liquidityUSD, 0)}
        totalApr={
          filteredPositions.length > 0
            ? filteredPositions.reduce((sum, pos) => sum + pos.totalApr, 0) / filteredPositions.length
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
