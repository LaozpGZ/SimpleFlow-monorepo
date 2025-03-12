import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { HomePagePoolInfo } from 'pages/api/home/types'
import styled from 'styled-components'
import { getNetworkFullName } from 'views/BuyCrypto/constants'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepageSymbol } from './component/HomepageSymbol'
import { MultipleCurrencyLogos } from './component/MultipleCurrencyLogos'

const VerticalLayout = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  margin-left: 12px;
`

const ChainText = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 2%;
  color: ${({ theme }) => theme.colors.textSubtle};
  white-space: nowrap;
`

export const EarnTradingFeesCard = ({ pairs }: { pairs: HomePagePoolInfo[] }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  return (
    <CardSection
      title={t('Earn Trading Fees')}
      subtitle={t('by Providing Liquidity')}
      button={{ link: '/liquidity/pools', text: t('Liquidity') }}
    >
      <Box>
        {pairs.map((pair, index) => {
          return (
            <CardRowLayout
              key={`${pair.token0}-${pair.token1}`}
              left={
                <Flex alignItems="center">
                  <MultipleCurrencyLogos
                    isFirstSmall
                    tokens={[
                      {
                        logo: pair.token0.icon,
                      },
                      {
                        logo: pair.token1.icon,
                      },
                    ]}
                    chainId={pair.chainId}
                  />

                  <VerticalLayout>
                    <HomepageSymbol>
                      {pair.token0.symbol.toUpperCase()}/{pair.token1.symbol.toUpperCase()}
                    </HomepageSymbol>
                    <ChainText>{getNetworkFullName(pair.chainId)}</ChainText>
                  </VerticalLayout>
                </Flex>
              }
              isLast={index === pairs.length - 1}
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
                    `${t('Up to')} ${(pair.apr24h * 100).toFixed(2)} APR`
                  )
                }
              />
            </CardRowLayout>
          )
        })}
      </Box>
    </CardSection>
  )
}
