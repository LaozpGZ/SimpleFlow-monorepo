import { useTranslation } from '@pancakeswap/localization'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { BunnyPlaceholderIcon, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { HomePageToken, HomePageUser } from 'pages/api/home/types'
import styled from 'styled-components'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepageSymbol } from './component/HomepageSymbol'
// import { HomepageSymbol } from './component/HomepageSymbol'

const WinnerText = styled(Text)`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`

interface PredictionCardProps {
  token: HomePageToken
  winner: HomePageUser
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ token, winner }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { user, profile } = winner
  const avatar = profile?.nft?.image.thumbnail

  return (
    <CardSection
      isFrameLess={isMobile}
      title={t('BNB 5-Min Prediction')}
      button={{
        text: t('Play Now'),
        link: '/prediction',
      }}
    >
      <CardRowLayout
        left={
          <Flex alignItems="center">
            <CurrencyLogo
              style={{
                width: '40px',
                height: '40px',
              }}
              currency={{
                chainId: 56,
                address: ZERO_ADDRESS,
                isNative: true,
              }}
            />
            <HomepageSymbol ml="8px">{token.symbol}USD</HomepageSymbol>
          </Flex>
        }
      >
        <HomepageCardBadge text={`$${token.price.toFixed(2)}`} priceChange={token.percent} />
      </CardRowLayout>

      <CardRowLayout
        left={
          <Flex alignItems="center">
            {avatar ? (
              <img src={avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            ) : (
              <BunnyPlaceholderIcon height={40} width={40} />
            )}
            <Flex flexDirection="column" ml="8px">
              <TopWinnerTitle color="textSubtle">{t('Last Top Winner')}</TopWinnerTitle>
              <WinnerText>
                {user.id.slice(0, 6)}...{user.id.slice(-4)}
              </WinnerText>
            </Flex>
          </Flex>
        }
        isLast
      >
        <HomepageCardBadge
          text={`+${formatAmount(user.totalBNB, {
            precision: 1,
          })} BNB`}
        />
      </CardRowLayout>
    </CardSection>
  )
}

const TopWinnerTitle = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
`
