import { useTranslation } from '@pancakeswap/localization'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { BunnyPlaceholderIcon, Button, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useRouter } from 'next/router'
import { HomePageToken } from 'pages/api/home/types'
import { PredictionUser } from 'state/types'
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

const PlayButton = styled(Button)`
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  height: 32px;
`

interface PredictionCardProps {
  token: HomePageToken
  user: PredictionUser
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ token, user }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()

  return (
    <CardSection
      isFrameLess={isMobile}
      title={t('BNB 5-Min Prediction')}
      button={
        <PlayButton
          onClick={() => {
            router.push('/prediction')
          }}
          variant="light"
        >
          {t('Play Now')}
        </PlayButton>
      }
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
            <BunnyPlaceholderIcon height={40} width={40} />
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
        <HomepageCardBadge text={`+${formatAmount(user.totalBNB)} BNB`} />
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
