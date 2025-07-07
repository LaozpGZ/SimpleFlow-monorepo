import { useTranslation } from '@pancakeswap/localization'
import { Percent, Token } from '@pancakeswap/swap-sdk-core'
import {
  AutoColumn,
  Box,
  Card,
  CardBody,
  Flex,
  FlexGap,
  Grid,
  IconButton,
  SearchIcon,
  Spinner,
  SwapHorizIcon,
  Tab,
  TabMenu,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { DoubleCurrencyLogo, FeeTierTooltip, LightGreyCard, Liquidity } from '@pancakeswap/widgets-internal'
import { InfinityFeeTierBreakdown } from 'components/FeeTierBreakdown'
import { useHookByPoolId } from 'hooks/infinity/useHooksList'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { NextSeo } from 'next-seo'
import { useMemo, useState } from 'react'
import { InfinityPoolInfo } from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import styled from 'styled-components'
import { formatAmount } from 'utils/formatInfoNumbers'
import { getTokenSymbolAlias } from 'utils/getTokenAlias'
import { isInfinityProtocol } from 'utils/protocols'
import { zeroAddress } from 'viem'
import { PoolGlobalAprButtonV3 } from 'views/universalFarms/components/PoolAprButtonV3'
import { usePoolInfoByQuery } from '../hooks/usePoolInfo'
import { usePoolSymbol } from '../hooks/usePoolSymbol'
import { MyPositions } from './MyPositions'
import { PoolCharts } from './PoolCharts'
import { PoolStatus } from './PoolStatus'
import { PoolTvlWarning } from './PoolTvlWarning'
import { Transactions } from './Transactions'

enum PoolDetailTab {
  MyPositions = 0,
  Transactions = 1,
}

const SearchButton = styled(IconButton).attrs({ variant: 'primary60' })`
  background-color: ${({ theme }) => theme.colors.input};
`

export const PoolInfo = () => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const { poolSymbol } = usePoolSymbol()

  const poolInfo = usePoolInfoByQuery()
  const chainId = useChainIdByQuery()

  const isSmallScreen = isMobile || isTablet

  const [flipCurrentPrice, setFlipCurrentPrice] = useState(false)
  const [tab, setTab] = useState(PoolDetailTab.MyPositions)

  const currency0 =
    useCurrencyByChainId(poolInfo?.token0.isNative ? zeroAddress : (poolInfo?.token0 as Token)?.address, chainId) ??
    undefined
  const currency1 = useCurrencyByChainId(poolInfo?.token1.address, chainId) ?? undefined

  const fee = useMemo(() => {
    return new Percent(poolInfo?.feeTier ?? 0n, poolInfo?.feeTierBase)
  }, [poolInfo?.feeTier, poolInfo?.feeTierBase])

  const poolId = (poolInfo as InfinityPoolInfo)?.poolId
  const hookData = useHookByPoolId(chainId, poolId)

  if (!poolInfo)
    return (
      <Flex mt="80px" justifyContent="center">
        <Spinner />
      </Flex>
    )

  return (
    <AutoColumn gap={['16px', null, null, '48px']}>
      <NextSeo title={poolSymbol} />
      <Card>
        <CardBody>
          <FlexGap
            justifyContent="space-between"
            alignItems={isSmallScreen ? 'flex-start' : 'center'}
            flexDirection={isSmallScreen ? 'column' : 'row'}
            gap="16px"
          >
            <FlexGap
              gap="16px"
              justifyContent={isSmallScreen ? 'space-between' : 'flex-start'}
              flexDirection={isSmallScreen ? 'row-reverse' : 'row'}
              width="100%"
            >
              <Box>
                <SearchButton>
                  <SearchIcon color="textSubtle" width={24} />
                </SearchButton>
              </Box>
              <FlexGap flexDirection="column" gap="16px">
                <FlexGap
                  gap="12px"
                  alignItems={isSmallScreen ? 'flex-start' : 'center'}
                  flexDirection={isSmallScreen ? 'column' : 'row'}
                >
                  <Box>
                    <Flex alignItems="center">
                      <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={48} innerMargin="-8px" />
                    </Flex>
                  </Box>
                  <FlexGap gap="4px" alignItems="center">
                    <Text bold fontSize={32} style={{ lineHeight: '1' }}>
                      {currency0?.isNative
                        ? currency0?.symbol
                        : getTokenSymbolAlias(currency0?.wrapped?.address, currency0?.chainId, currency0?.symbol)}
                    </Text>
                    <Text color="textSubtle" bold fontSize={32} style={{ lineHeight: '1' }}>
                      /
                    </Text>
                    <Text bold fontSize={32} style={{ lineHeight: '1' }}>
                      {getTokenSymbolAlias(currency1?.wrapped?.address, currency1?.chainId, currency1?.symbol)}
                    </Text>
                  </FlexGap>
                </FlexGap>
                <FlexGap gap="16px" flexWrap="wrap" alignItems="center" alignContent="center">
                  {poolInfo?.protocol ? (
                    <AutoColumn rowGap="4px">
                      <Box>
                        {isInfinityProtocol(poolInfo.protocol) ? (
                          <InfinityFeeTierBreakdown
                            poolId={poolId}
                            chainId={chainId}
                            hookData={hookData}
                            infoIconVisible={false}
                          />
                        ) : (
                          <FeeTierTooltip type={poolInfo.protocol} percent={fee} dynamic={poolInfo?.isDynamicFee} />
                        )}
                      </Box>
                    </AutoColumn>
                  ) : null}

                  <Liquidity.PoolFeaturesBadge
                    showPoolType
                    poolType={poolInfo.protocol}
                    hookData={hookData}
                    showLabel={false}
                  />
                </FlexGap>
              </FlexGap>
            </FlexGap>

            <FlexGap gap="32px">
              <Box p="8px 16px" width="100%">
                <FlexGap gap="8px" alignItems="center">
                  <Text fontSize={12} bold color="textSubtle" textTransform="uppercase" style={{ userSelect: 'none' }}>
                    {t('Current Price')}
                  </Text>
                  <SwapHorizIcon
                    color="primary60"
                    onClick={() => setFlipCurrentPrice(!flipCurrentPrice)}
                    style={{ cursor: 'pointer' }}
                  />
                </FlexGap>
                <FlexGap mt="2px" gap="8px" alignItems="center" width="100%">
                  <Text fontSize={28} bold width="max-content">
                    {formatAmount(Number(flipCurrentPrice ? poolInfo.token1Price : poolInfo.token0Price), {
                      notation: 'standard',
                      displayThreshold: 0.001,
                      tokenPrecision: poolInfo
                        ? Math.abs(Number(poolInfo.token1Price) - Number(poolInfo.token0Price)) < 1
                          ? 'enhanced'
                          : 'normal'
                        : 'normal',
                    })}
                  </Text>

                  <Text fontSize={12} color="textSubtle" textTransform="uppercase" width="max-content">
                    {t(
                      '%symbol0% per %symbol1%',
                      flipCurrentPrice
                        ? {
                            symbol0: currency1?.symbol,
                            symbol1: currency0?.symbol,
                          }
                        : {
                            symbol0: currency0?.symbol,
                            symbol1: currency1?.symbol,
                          },
                    )}
                  </Text>
                </FlexGap>
              </Box>
              <LightGreyCard padding="8px 16px">
                <AutoColumn rowGap="2px">
                  <Text fontSize={12} bold color="textSubtle" textTransform="uppercase">
                    {t('Est. APR')}
                  </Text>
                  {poolInfo ? <PoolGlobalAprButtonV3 pool={poolInfo} /> : null}
                </AutoColumn>
              </LightGreyCard>
            </FlexGap>
          </FlexGap>
        </CardBody>
      </Card>

      <AutoColumn gap="lg">
        <PoolTvlWarning poolInfo={poolInfo} />
        <Grid gridGap="24px" gridTemplateColumns={['1fr', '1fr', '1fr', '2fr 1fr']}>
          <PoolCharts poolInfo={poolInfo} />
          <PoolStatus poolInfo={poolInfo} />
        </Grid>
      </AutoColumn>

      <Box>
        <Box style={{ margin: '0 24px -3px' }}>
          <TabMenu activeIndex={tab} onItemClick={setTab}>
            <Tab
              isActive={tab === PoolDetailTab.MyPositions}
              onClick={() => setTab(PoolDetailTab.MyPositions)}
              key="my-positions"
            >
              {t('My Positions')}
            </Tab>
            <Tab
              isActive={tab === PoolDetailTab.Transactions}
              onClick={() => setTab(PoolDetailTab.Transactions)}
              key="transactions"
            >
              {t('Transactions')}
            </Tab>
          </TabMenu>
        </Box>

        {tab === PoolDetailTab.MyPositions ? <MyPositions poolInfo={poolInfo} /> : null}
        {tab === PoolDetailTab.Transactions ? <Transactions protocol={poolInfo.protocol} /> : null}
      </Box>

      {/* {hookData && (
        <AutoColumn gap="lg">
          <Text as="h3" fontWeight={600} fontSize={24}>
            {t('Pool Features (Hooks)')}
          </Text>
          <PoolFeatures hookData={hookData} />
        </AutoColumn>
      )} */}
    </AutoColumn>
  )
}
