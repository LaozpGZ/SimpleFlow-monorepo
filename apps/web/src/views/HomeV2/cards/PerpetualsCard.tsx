import { useTranslation } from '@pancakeswap/localization'
import { Flex, Text, TriangleDownIcon, TriangleUpIcon, useMatchBreakpoints } from '@pancakeswap/uikit'
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
  position: relative;

  svg {
    width: 11px;
    margin-left: 4px;
    transform: translateY(2px);
  }
`

const LeverageText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 24px;
  color: ${({ theme }) => theme.colors.positive60};
`

interface PerpetualCardProps {
  tokens: HomePageToken[]
}

export const PerpetualCard: React.FC<PerpetualCardProps> = ({ tokens }) => {
  const { t } = useTranslation()

  const { isMobile } = useMatchBreakpoints()

  return (
    <CardSection
      isFrameLess={isMobile}
      title={t('Perpetuals')}
      button={{
        text: t('See All'),
        link: 'https://perp.pancakeswap.finance/',
      }}
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
                  <PercentageChange
                    style={{
                      position: 'relative',
                    }}
                  >
                    {token.percent >= 0 ? <TriangleUpIcon /> : <TriangleDownIcon />}{' '}
                    {Math.abs(token.percent).toFixed(2)}%
                  </PercentageChange>
                </Flex>
              </Flex>
            </>
          }
          isLast={index === tokens.length - 1}
        >
          <HomepageCardBadge
            text={
              !isMobile ? (
                <LeverageText>
                  {t(`Up to`)} {token.symbol === 'BTC' ? '1001x' : '250x'} {t('leverage')}
                </LeverageText>
              ) : (
                <>
                  <Text bold color="positive60" fontSize="12px">
                    {t(`Up to`)}{' '}
                  </Text>
                  <Text bold color="positive60" fontSize="14px">
                    {token.symbol === 'BTC' ? '1001x' : '250x'} {t('leverage')}
                  </Text>
                </>
              )
            }
          />
        </CardRowLayout>
      ))}
    </CardSection>
  )
}
