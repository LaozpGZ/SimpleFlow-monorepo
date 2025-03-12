import { useTranslation } from '@pancakeswap/localization'
import { Box, useMatchBreakpoints } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { HomePageToken } from 'pages/api/home/types'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepageSymbol } from './component/HomepageSymbol'

type SwapPricesCardProps = {
  tokens: HomePageToken[]
}

const TokenRow = ({ token, isLast }: { token: HomePageToken; isLast?: boolean }) => {
  const { isMobile } = useMatchBreakpoints()

  return (
    <CardRowLayout
      isLast={isLast}
      left={
        <>
          <CurrencyLogo
            style={{
              width: isMobile ? '32px' : '40px',
              height: isMobile ? '32px' : '40px',
              marginRight: '12px',
            }}
            currency={{ address: token.id, chainId: 56, isToken: true }}
            size={isMobile ? '20px' : '24px'}
          />
          <HomepageSymbol>{token.symbol}</HomepageSymbol>
        </>
      }
    >
      <HomepageCardBadge text={`$${formatNumber(token.price)}`} priceChange={token.percent} />
    </CardRowLayout>
  )
}

export const SwapWithBestPriceCard = ({ tokens }: SwapPricesCardProps) => {
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
