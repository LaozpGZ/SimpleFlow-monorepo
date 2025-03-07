import { useTranslation } from '@pancakeswap/localization'
import { Box, Text, TriangleDownIcon, TriangleUpIcon } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { HomePageToken } from 'pages/api/home/types'
import styled from 'styled-components'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
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
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
  align-items: center;
  justify-content: center;
`

const TokenRow = ({
  id,
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

      <Percent ml="2px">
        {percent > 0 && <TriangleUpIcon />}
        {percent < 0 && <TriangleDownIcon />}
        {percent.toFixed(2)}%
      </Percent>
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
