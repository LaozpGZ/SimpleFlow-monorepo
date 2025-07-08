import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Flex, FlexGap, MinusIcon, Text } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { CurrencyLogo, NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useMemo } from 'react'
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
import { V2EarningsCell } from './PoolEarningsCells'
import { EmptyPositionCard, LoadingCard } from './UtilityCards'

interface V2PositionsTableProps {
  poolInfo: V2PoolInfo | StablePoolInfo
}

// Component that only renders when position data exists
const V2PositionWithApr: React.FC<{
  poolInfo: V2PoolInfo | StablePoolInfo
  v2OrStableData: V2LPDetail | StableLPDetail
}> = ({ poolInfo, v2OrStableData }) => {
  const { t } = useTranslation()

  // Get USD prices for both tokens
  const { data: token0Price } = useCurrencyUsdPrice(poolInfo.token0?.wrapped, {
    enabled: Boolean(poolInfo.token0),
  })
  const { data: token1Price } = useCurrencyUsdPrice(poolInfo.token1?.wrapped, {
    enabled: Boolean(poolInfo.token1),
  })

  // Get APR data for the single position - safe to call since v2OrStableData is guaranteed to exist
  const aprData = useV2PositionApr(poolInfo, v2OrStableData)

  const transformedPosition = useMemo(() => {
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

  return (
    <PositionsTable
      poolInfo={poolInfo}
      totalLiquidityUSD={transformedPosition.liquidityUSD}
      totalApr={transformedPosition.totalApr}
      data={[transformedPosition.tableRow]}
    />
  )
}

export const V2PositionsTable: React.FC<V2PositionsTableProps> = ({ poolInfo }) => {
  const { address: account } = useAccount()
  const chainId = useChainIdByQuery()

  const { data: v2OrStableData, isLoading } = useAccountPositionDetailByPool<Protocol.V2 | Protocol.STABLE>(
    chainId,
    account,
    poolInfo,
  )

  if (isLoading) {
    return <LoadingCard />
  }

  if (!v2OrStableData) {
    return <EmptyPositionCard />
  }

  // Render the position component only when data exists
  return <V2PositionWithApr poolInfo={poolInfo} v2OrStableData={v2OrStableData} />
}
