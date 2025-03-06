import { useTranslation } from '@pancakeswap/localization'
import { Box, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { HomePageToken } from 'pages/api/home/types'
import styled from 'styled-components'
import { CardRowLayout } from './CardRowLayout'
import { CardSection } from './CardSection'
import { HomepageCardBadge } from './component/HomepageCardBadge'
import { HomepageSymbol } from './component/HomepageSymbol'

type SwapPricesCardProps = {
  tokens: HomePageToken[]
}

const Percent = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
  color: var(--V1-Fill-Secondary, #7a6eaa);
`

const TokenRow = ({
  id,
  icon,
  symbol,
  price,
  percent,
  isLast,
}: HomePageToken & {
  isLast?: boolean
}) => (
  <CardRowLayout
    isLast={isLast}
    icon={
      <>
        <CurrencyLogo
          style={{
            width: '40px',
            height: '40px',
            marginRight: '12px',
          }}
          currency={{ address: id, chainId: 56, isToken: true }}
          size="24px"
        />
        <HomepageSymbol>{symbol}</HomepageSymbol>
      </>
    }
  >
    <HomepageCardBadge>
      <Text bold color="success" mr="4px">
        ${price.toLocaleString()}
      </Text>
      <Text fontSize="12px" color="success">
        ▲
      </Text>
      <Percent>{percent.toFixed(2)}%</Percent>
    </HomepageCardBadge>
  </CardRowLayout>
)

export const TokensCard = ({ tokens }: SwapPricesCardProps) => {
  const { t } = useTranslation()
  return (
    <CardSection title={t('Swap with Best Prices')} subtitle={t('with Fees as Low as 0.01%')}>
      <Box mt="8px">
        {tokens.slice(0, 3).map((token, i) => (
          <TokenRow key={token.id} {...token} isLast={i === 2} />
        ))}
      </Box>
    </CardSection>
  )
}
