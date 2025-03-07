import { useTranslation } from '@pancakeswap/localization'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { ArrowForwardIcon, BunnyPlaceholderIcon, Button, Flex, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useRouter } from 'next/router'
import { HomePageToken } from 'pages/api/home/types'
import { PredictionUser } from 'state/types'
import styled from 'styled-components'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepagePriceChange } from './component/HomepagePriceChange'
import { HomepageSymbol } from './component/HomepageSymbol'

const TokenPrice = styled(Text)`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`

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

  return (
    <CardSection
      title={t('BNB 5-Min Prediction')}
      button={
        <PlayButton
          onClick={() => {
            router.push('/prediction')
          }}
        >
          {t('Play Now')}
          <ArrowForwardIcon color="card" />
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
            {/* <Image src={token.icon} width={32} height={32} alt={token.symbol} /> */}
            <HomepageSymbol ml="8px">{token.symbol}USD</HomepageSymbol>
          </Flex>
        }
      >
        <Flex alignItems="flex-end" flexDirection="column">
          <TokenPrice>${token.price.toFixed(2)}</TokenPrice>
          <HomepagePriceChange token={token} />
        </Flex>
      </CardRowLayout>

      <CardRowLayout
        left={
          <Flex alignItems="center">
            <BunnyPlaceholderIcon height={40} width={40} />
            <Text ml="8px" color="textSubtle">
              {t('Last Top Winner')}
            </Text>
          </Flex>
        }
        isLast
      >
        <WinnerText>
          {user.id.slice(0, 6)}...{user.id.slice(-4)}
        </WinnerText>
      </CardRowLayout>
    </CardSection>
  )
}
