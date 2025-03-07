import { useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, Button, Flex, Text, TriangleDownIcon, TriangleUpIcon } from '@pancakeswap/uikit'
import { HomePageToken } from 'pages/api/home/types'
import React from 'react'
import styled from 'styled-components'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepageSymbol } from './component/HomepageSymbol'

const PriceText = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.text};
`

const PercentageChange = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const LeverageText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 24px;
  color: ${({ theme }) => theme.colors.positive60};
`

const PlayButton = styled(Button)`
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  height: 32px;
`

interface PerpetualCardProps {
  tokens: HomePageToken[]
}

export const PerpetualCard: React.FC<PerpetualCardProps> = ({ tokens }) => {
  const { t } = useTranslation()

  return (
    <CardSection
      title={t('Perpetuals')}
      button={
        <PlayButton onClick={() => window.open('https://perp.pancakeswap.finance/')}>
          See All
          <ArrowForwardIcon color="card" />
        </PlayButton>
      }
    >
      {tokens.map((token, index) => (
        <CardRowLayout
          key={token.id}
          left={
            <>
              <img src={token.icon} alt={token.symbol} width={40} height={40} />
              <Flex flexDirection="column" ml="12px">
                <HomepageSymbol>{token.symbol}</HomepageSymbol>

                <Flex alignItems="center" justifyContent="center">
                  <PriceText>${token.price.toLocaleString()}</PriceText>
                  <PercentageChange>
                    {token.percent >= 0 ? <TriangleUpIcon /> : <TriangleDownIcon />}{' '}
                    {Math.abs(token.percent).toFixed(2)}%
                  </PercentageChange>
                </Flex>
              </Flex>
            </>
          }
          isLast={index === tokens.length - 1}
        >
          <HomepageCardBadge>
            <LeverageText>
              {t(`Up to`)} {token.symbol === 'BTCUSD' ? '1001x' : '250x'} {t('leverage')}
            </LeverageText>
          </HomepageCardBadge>
        </CardRowLayout>
      ))}
    </CardSection>
  )
}
