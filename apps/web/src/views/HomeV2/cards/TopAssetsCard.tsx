import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { HomePagePoolInfo, HomePageToken } from 'edge/home/types'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import styled from 'styled-components'
import { getNetworkFullName } from 'views/BuyCrypto/constants'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepageSymbol } from './component/HomepageSymbol'
import { MultipleCurrencyLogos } from './component/MultipleCurrencyLogos'

const TabContainer = styled(Flex)`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 12px;
`

const Tab = styled(Box)<{ isActive: boolean; isMobile: boolean }>`
  flex: 1;
  padding: ${({ isMobile }) => (isMobile ? '8px 12px' : '10px 16px')};
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ theme, isActive }) => (isActive ? theme.colors.backgroundAlt : 'transparent')};
  box-shadow: ${({ isActive }) => (isActive ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none')};

  &:hover {
    background: ${({ theme, isActive }) => (isActive ? theme.colors.backgroundAlt : theme.colors.tertiary)};
  }
`

const TabText = styled(Text)<{ isActive: boolean; isMobile: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile }) => (isMobile ? '14px' : '16px')};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.text : theme.colors.textSubtle)};
`

const getDimension = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '32px'
  if (isTablet) return '36px'
  return '40px'
}

const getLogoSize = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '20px'
  if (isTablet) return '22px'
  return '24px'
}

const getMarginLeft = (isMobile?: boolean, isTablet?: boolean) => {
  if (isMobile) return '12px'
  if (isTablet) return '20px'
  return '12px'
}

const VerticalLayout = styled(Flex)<{ isMobile?: boolean; isTablet?: boolean }>`
  flex-direction: column;
  align-items: flex-start;
  margin-left: ${({ isMobile, isTablet }) => getMarginLeft(isMobile, isTablet)};
`

const getChainTextFontSize = (isMobile?: boolean, isTablet?: boolean) => {
  if (isMobile) return '12px'
  if (isTablet) return '14px'
  return '12px'
}

const ChainText = styled(Text)<{ isMobile?: boolean; isTablet?: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isTablet }) => getChainTextFontSize(isMobile, isTablet)};
  line-height: 18px;
  letter-spacing: 2%;
  color: ${({ theme }) => theme.colors.textSubtle};
  white-space: nowrap;
`

type TopAssetsCardProps = {
  tokens: HomePageToken[]
  pairs: HomePagePoolInfo[]
}

const TokenRow = ({ token, isLast }: { token: HomePageToken; isLast?: boolean }) => {
  const { isMobile, isTablet } = useMatchBreakpoints()
  const dimension = getDimension(isMobile, isTablet)
  const logoSize = getLogoSize(isMobile, isTablet)

  return (
    <CardRowLayout
      isLast={isLast}
      left={
        <>
          <CurrencyLogo
            style={{
              width: dimension,
              height: dimension,
              marginRight: '12px',
            }}
            currency={{ address: token.id, chainId: 56, isToken: true }}
            size={logoSize}
          />
          <HomepageSymbol isMobile={isMobile} isTablet={isTablet}>
            {token.symbol}
          </HomepageSymbol>
        </>
      }
    >
      <HomepageCardBadge text={`$${formatNumber(token.price)}`} priceChange={token.percent} />
    </CardRowLayout>
  )
}

const PairRow = ({ pair, isLast }: { pair: HomePagePoolInfo; isLast?: boolean }) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const router = useRouter()

  return (
    <CardRowLayout
      onClick={() => {
        router.push(pair.link)
      }}
      left={
        <Flex alignItems="center">
          <MultipleCurrencyLogos
            isFirstSmall
            tokens={[{ logo: pair.token0.icon }, { logo: pair.token1.icon }]}
            chainId={pair.chainId}
          />
          <VerticalLayout isMobile={isMobile} isTablet={isTablet}>
            <HomepageSymbol isMobile={isMobile} isTablet={isTablet}>
              {pair.token0.symbol.toUpperCase()}/{pair.token1.symbol.toUpperCase()}
            </HomepageSymbol>
            <ChainText isMobile={isMobile} isTablet={isTablet}>
              {getNetworkFullName(pair.chainId)}
            </ChainText>
          </VerticalLayout>
        </Flex>
      }
      isLast={isLast}
    >
      <HomepageCardBadge
        text={
          isMobile ? (
            <Box>
              <Text color="positive60" bold fontSize="12px">
                {t('Up to')}{' '}
              </Text>
              <Text color="positive60" bold fontSize="14px">
                {(pair.apr24h * 100).toFixed(2)}% APR
              </Text>
            </Box>
          ) : (
            `${t('Up to')} ${(pair.apr24h * 100).toFixed(2)}% APR`
          )
        }
      />
    </CardRowLayout>
  )
}

type TabType = 'tokens' | 'pairs'

export const TopAssetsCard: React.FC<TopAssetsCardProps> = ({ tokens, pairs }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const [activeTab, setActiveTab] = useState<TabType>('tokens')

  const getButtonConfig = () => {
    if (activeTab === 'tokens') {
      return { link: '/swap', text: t('Swap') }
    }
    return { link: '/liquidity/pools', text: t('Liquidity') }
  }

  const getSubtitle = () => {
    if (activeTab === 'tokens') {
      return t('with Fees as Low as 0.01%')
    }
    return t('by Providing Liquidity')
  }

  return (
    <CardSection
      title={activeTab === 'tokens' ? t('Top Tokens') : t('Top Pairs')}
      subtitle={getSubtitle()}
      button={getButtonConfig()}
    >
      <TabContainer>
        <Tab isActive={activeTab === 'tokens'} isMobile={isMobile} onClick={() => setActiveTab('tokens')}>
          <TabText isActive={activeTab === 'tokens'} isMobile={isMobile}>
            {t('Tokens')}
          </TabText>
        </Tab>
        <Tab isActive={activeTab === 'pairs'} isMobile={isMobile} onClick={() => setActiveTab('pairs')}>
          <TabText isActive={activeTab === 'pairs'} isMobile={isMobile}>
            {t('Pairs')}
          </TabText>
        </Tab>
      </TabContainer>

      <Box>
        {activeTab === 'tokens'
          ? tokens.slice(0, 3).map((token, i) => <TokenRow key={token.id} token={token} isLast={i === 2} />)
          : pairs
              .slice(0, 3)
              .map((pair, index) => (
                <PairRow key={`${pair.token0.id}-${pair.token1.id}`} pair={pair} isLast={index === 2} />
              ))}
      </Box>
    </CardSection>
  )
}
