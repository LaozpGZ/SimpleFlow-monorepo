import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Flex, FlexGap, MinusIcon, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { CurrencyLogo, NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useMemo, useState } from 'react'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { StablePoolInfo, V2PoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'views/CakeStaking/components/Tooltips'
import { useV2PositionApr } from 'views/universalFarms/hooks/usePositionAPR'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAccount } from 'wagmi'
import { ActionButton } from '../styles'
import { PositionsTable } from '../Tabs/PositionsTable'
import { V2EarningsCell } from './PoolEarningsCells'
import { PositionFilter } from './types'

interface V2PositionsTableProps {
  poolInfo: V2PoolInfo | StablePoolInfo
}

export const V2PositionsTable: React.FC<V2PositionsTableProps> = ({ poolInfo }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()
  const [filter, setFilter] = useState(PositionFilter.All)

  const { data: v2OrStableData, isLoading } = useAccountPositionDetailByPool<Protocol.V2 | Protocol.STABLE>(
    chainId,
    account,
    poolInfo,
  )

  // Get USD prices for both tokens
  const { data: token0Price } = useCurrencyUsdPrice(poolInfo.token0?.wrapped, {
    enabled: Boolean(poolInfo.token0),
  })
  const { data: token1Price } = useCurrencyUsdPrice(poolInfo.token1?.wrapped, {
    enabled: Boolean(poolInfo.token1),
  })

  // Get APR data for the single position
  const aprData = useV2PositionApr(poolInfo, v2OrStableData!)

  const transformedPosition = useMemo(() => {
    if (!v2OrStableData) return null

    const amount0 = v2OrStableData.nativeDeposited0.add(v2OrStableData.farmingDeposited0)
    const amount1 = v2OrStableData.nativeDeposited1.add(v2OrStableData.farmingDeposited1)

    // Calculate USD values for individual tokens
    const amount0Usd = Number(amount0.toExact()) * (token0Price ?? 0)
    const amount1Usd = Number(amount1.toExact()) * (token1Price ?? 0)
    const liquidityUSD = amount0Usd + amount1Usd

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
                    {amount0.toSignificant(6)}
                  </Text>
                </FlexGap>
                <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                  {formatDollarAmount(amount0Usd)}
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
                    {amount1.toSignificant(6)}
                  </Text>
                </FlexGap>
                <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                  {formatDollarAmount(amount1Usd)}
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
          <V2EarningsCell pool={poolInfo} />
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

    // Construct URLs for V2/Stable actions
    const token0Address = poolInfo.token0?.wrapped.address
    const token1Address = poolInfo.token1?.wrapped.address
    const baseUrl = poolInfo.protocol === 'v2' ? '/v2' : '/stable'

    const addLiquidityUrl = `${baseUrl}/add/${token0Address}/${token1Address}?increase=1`
    const removeLiquidityUrl = `${baseUrl}/remove/${token0Address}/${token1Address}`
    const migrateUrl = `/v2/migrate/${poolInfo.lpAddress}`

    const actions = (
      <FlexGap gap="8px" alignItems="center">
        <NextLinkFromReactRouter to={addLiquidityUrl}>
          <ActionButton isIcon>
            <AddIcon />
          </ActionButton>
        </NextLinkFromReactRouter>
        <NextLinkFromReactRouter to={removeLiquidityUrl}>
          <ActionButton isIcon>
            <MinusIcon />
          </ActionButton>
        </NextLinkFromReactRouter>
        {poolInfo.protocol === 'v2' && (
          <NextLinkFromReactRouter to={migrateUrl}>
            <ActionButton>{t('Migrate')}</ActionButton>
          </NextLinkFromReactRouter>
        )}
      </FlexGap>
    )

    return {
      tableRow: {
        tokenInfo,
        liquidity,
        earnings,
        apr: aprDisplay,
        actions,
      },
      liquidityUSD,
      totalApr,
    }
  }, [v2OrStableData, poolInfo, aprData, t, token0Price, token1Price])

  const filteredPositions = useMemo(() => {
    if (!transformedPosition) return []

    const { totalApr, liquidityUSD } = transformedPosition
    const hasLiquidity = liquidityUSD > 0

    switch (filter) {
      case PositionFilter.Active:
        return hasLiquidity && totalApr > 0 ? [transformedPosition] : []
      case PositionFilter.Inactive:
        return hasLiquidity && totalApr === 0 ? [transformedPosition] : []
      case PositionFilter.Closed:
        return !hasLiquidity ? [transformedPosition] : []
      default:
        return [transformedPosition]
    }
  }, [transformedPosition, filter])

  if (isLoading) {
    return <div>{t('Loading...')}</div>
  }

  if (!v2OrStableData) {
    return <div>{t('No positions found')}</div>
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
      data={filteredPositions.map((position) => position.tableRow)}
      showInactiveOnly={filter === PositionFilter.Inactive}
      toggleInactiveOnly={() =>
        setFilter(filter === PositionFilter.Inactive ? PositionFilter.All : PositionFilter.Inactive)
      }
    />
  )
}
