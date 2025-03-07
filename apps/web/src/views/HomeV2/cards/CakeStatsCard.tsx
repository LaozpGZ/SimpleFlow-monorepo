import { useTranslation } from '@pancakeswap/localization'
import { Flex, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { ASSET_CDN } from 'config/constants/endpoints'
import { CakeRelatedFigures, HomePageToken } from 'pages/api/home/types'
import React from 'react'
import styled from 'styled-components'
import { formatNumber } from '../util/formatNumber'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepageSymbol } from './component/HomepageSymbol'

interface CakeStatsCardProps {
  figures: CakeRelatedFigures
  cakeToken: HomePageToken
}

const GAUGE_ICON = `${ASSET_CDN}/web/landing/gauge-icon.png`

const StyledTitle = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`

const StyledSubtitle = styled.p`
  font-family: Kanit;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 2%;
  color: ${({ theme }) => theme.colors.textSubtle};
`

export const CakeStatsCard: React.FC<CakeStatsCardProps> = ({ figures, cakeToken }) => {
  const { t } = useTranslation()

  return (
    <CardSection title={t('Vote for CAKE Emissions')} subtitle={t('on over 600+ Pools')}>
      <CardRowLayout
        left={
          <>
            <CurrencyLogo
              style={{ width: '40px', height: '40px', marginRight: '12px' }}
              currency={{ address: cakeToken.id, chainId: cakeToken.chainId, isToken: true }}
              size="24px"
            />
            <Flex flexDirection="column">
              <HomepageSymbol>{t('CAKE Staking')}</HomepageSymbol>
              <StyledSubtitle>
                {t('%burned%M+ BURN • $%marketCap% MKT. CAP', {
                  burned: formatNumber(figures.burned),
                  marketCap: formatNumber(figures.cakeStats.circulatingSupply * cakeToken.price),
                })}
              </StyledSubtitle>
            </Flex>
          </>
        }
      >
        <HomepageCardBadge>
          <Text bold color="positive60">
            {t('Up to %apr%% APR', { apr: figures.totalApr.toFixed(2) })}
          </Text>
        </HomepageCardBadge>
      </CardRowLayout>

      <CardRowLayout
        left={
          <>
            <img style={{ width: '40px', height: '40px', marginRight: '12px' }} src={GAUGE_ICON} alt="icon" />
            <Flex flexDirection="column">
              <StyledTitle>{t('Gauges Voting')}</StyledTitle>
              <StyledSubtitle>
                {t('TOTAL VOTES: %totalVotes%', { totalVotes: formatNumber(Number(figures.gaugeTotalWeight)) })}
              </StyledSubtitle>
            </Flex>
          </>
        }
        isLast
      >
        <HomepageCardBadge>
          <Text bold color="positive60">
            {t('%rewards%K+ CAKE Rewards/Epoch', { rewards: (figures.weeklyReward / 1e3).toFixed(0) })}
          </Text>
        </HomepageCardBadge>
      </CardRowLayout>
    </CardSection>
  )
}
