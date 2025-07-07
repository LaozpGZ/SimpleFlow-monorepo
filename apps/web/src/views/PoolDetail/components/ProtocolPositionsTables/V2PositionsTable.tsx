import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { DoubleCurrencyLogo } from '@pancakeswap/widgets-internal'
import { useMemo } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { StableLPDetail, V2LPDetail } from 'state/farmsV4/state/accountPositions/type'
import { StablePoolInfo, V2PoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { PositionsTable } from '../Tabs/PositionsTable'
import { PositionFilter } from './types'

interface V2PositionsTableProps {
  poolInfo: V2PoolInfo | StablePoolInfo
  filter: PositionFilter
  handleHarvestAll: () => void
}

// Helper function to transform position data for table - NO HOOKS ALLOWED
const transformV2PositionToTableRow = (
  position: V2LPDetail | StableLPDetail,
  poolInfo: V2PoolInfo | StablePoolInfo,
  t: (key: string) => string,
) => {
  const liquidityUSD = 0 // TODO: Calculate actual liquidity USD

  const tokenInfo = (
    <FlexGap alignItems="center" gap="12px">
      <DoubleCurrencyLogo currency0={poolInfo.token0} currency1={poolInfo.token1} size={40} innerMargin="-4px" />
      <FlexGap flexDirection="column" gap="4px">
        <Text bold fontSize="16px">
          {poolInfo.token0?.symbol} / {poolInfo.token1?.symbol}
        </Text>
        <Text color="textSubtle" fontSize="12px">
          {poolInfo.protocol === 'v2' ? 'V2 LP' : 'Stable LP'}
        </Text>
      </FlexGap>
    </FlexGap>
  )

  const liquidity = (
    <Flex flexDirection="column" alignItems="flex-start">
      <Text bold fontSize="16px">
        {formatDollarAmount(liquidityUSD)}
      </Text>
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

  const totalApr = 0 // TODO: Calculate actual APR
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
      <Button variant="tertiary" scale="sm">
        {t('Add')}
      </Button>
      <Button variant="tertiary" scale="sm">
        {t('Remove')}
      </Button>
      {poolInfo.protocol === 'v2' && (
        <Button variant="tertiary" scale="sm">
          {t('Migrate')}
        </Button>
      )}
    </FlexGap>
  )

  return {
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

export const V2PositionsTable: React.FC<V2PositionsTableProps> = ({ poolInfo, filter, handleHarvestAll }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()

  // Only fetch V2/Stable data
  const { data: v2OrStableData, isLoading } = useAccountPositionDetailByPool<Protocol.V2 | Protocol.STABLE>(
    chainId,
    account,
    poolInfo,
  )

  const transformedPositions = useMemo(() => {
    if (!v2OrStableData) return []

    const position = transformV2PositionToTableRow(v2OrStableData, poolInfo, t)

    return [position]
  }, [v2OrStableData, poolInfo, t])

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
