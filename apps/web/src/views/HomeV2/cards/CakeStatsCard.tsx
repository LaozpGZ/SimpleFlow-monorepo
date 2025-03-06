import { Box, CheckmarkIcon, Tag, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { CakeRelatedFigures, HomePageToken } from 'pages/api/home/types'
import React from 'react'
import { CardRowLayout } from './CardRowLayout'
import { CardSection } from './CardSection'

interface CakeStatsCardProps {
  figures: CakeRelatedFigures
  cakeToken: HomePageToken
}

const GaugeVotingIconUrl = 'https://yourdomain.com/static/gauge_voting_icon.svg'

export const CakeStatsCard: React.FC<CakeStatsCardProps> = ({ figures, cakeToken }) => (
  <CardSection title="Vote for CAKE Emissions" subtitle="on over 600+ Pools">
    {/* CAKE Staking */}
    <CardRowLayout
      icon={
        <CurrencyLogo
          style={{ width: '40px', height: '40px', marginRight: '12px' }}
          currency={{ address: cakeToken.id, chainId: cakeToken.chainId, isToken: true }}
          size="24px"
        />
      }
    >
      <Box>
        <Text fontSize="16px" bold>
          CAKE Staking
        </Text>
        <Text color="textSubtle" fontSize="14px">
          {`${(figures.burned / 1e6).toFixed(1)}M+ BURN • $${(
            (figures.cakeStats.circulatingSupply * cakeToken.price) /
            1e6
          ).toFixed(0)}M+ MKT. CAP`}
        </Text>
      </Box>
      <Tag variant="success">{`Up to ${figures.totalApr.toFixed(2)}% APR`}</Tag>
    </CardRowLayout>

    {/* Gauges Voting */}
    <CardRowLayout
      icon={
        <CheckmarkIcon />
        // <img
        //   src={GaugeVotingIconUrl}
        //   alt="Gauges Voting"
        //   style={{ width: '40px', height: '40px', marginRight: '12px' }}
        // />
      }
      isLast
    >
      <Box>
        <Text fontSize="16px" bold>
          Gauges Voting
        </Text>
        <Text color="textSubtle" fontSize="14px">
          {`TOTAL VOTES: ${figures.gaugeTotalWeight}`}
        </Text>
      </Box>
      <Tag variant="success">{`${(figures.weeklyReward / 1e3).toFixed(0)}K+ CAKE Rewards/Epoch`}</Tag>
    </CardRowLayout>
  </CardSection>
)
