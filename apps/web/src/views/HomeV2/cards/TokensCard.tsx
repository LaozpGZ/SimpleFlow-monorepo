import { useTranslation } from '@pancakeswap/localization'
import { Box, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { HomePageToken } from 'pages/api/home/types'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepagePriceChange } from './component/HomepagePriceChange'
import { HomepageSymbol } from './component/HomepageSymbol'

type SwapPricesCardProps = {
  tokens: HomePageToken[]
}

const TokenRow = ({ token, isLast }: { token: HomePageToken; isLast?: boolean }) => (
  <CardRowLayout
    isLast={isLast}
    left={
      <>
        <CurrencyLogo
          style={{
            width: '40px',
            height: '40px',
            marginRight: '12px',
          }}
          currency={{ address: token.id, chainId: 56, isToken: true }}
          size="24px"
        />
        <HomepageSymbol>{token.symbol}</HomepageSymbol>
      </>
    }
  >
    <HomepageCardBadge>
      <Text bold color="success" mr="4px">
        ${token.price.toLocaleString()}
      </Text>

      <HomepagePriceChange token={token} />
    </HomepageCardBadge>
  </CardRowLayout>
)

export const TokensCard = ({ tokens }: SwapPricesCardProps) => {
  const { t } = useTranslation()
  return (
    <CardSection title={t('Swap with Best Prices')} subtitle={t('with Fees as Low as 0.01%')}>
      <Box mt="8px">
        {tokens.slice(0, 3).map((token, i) => (
          <TokenRow key={token.id} token={token} isLast={i === 2} />
        ))}
      </Box>
    </CardSection>
  )
}
