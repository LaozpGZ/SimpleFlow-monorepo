import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

export function TokenAmountSection({
  tokenAmount,
  price,
}: {
  tokenAmount?: CurrencyAmount<Token | NativeCurrency>
  price: number
}) {
  if (!tokenAmount) {
    return null
  }

  const amount = tokenAmount.toExact()

  const usdValue = parseFloat(amount) * price

  return (
    <>
      <Box position="relative" mb="16px">
        <CurrencyLogo currency={tokenAmount.currency} showChainLogo size="80px" />
      </Box>
      <Text fontSize="32px" bold>
        {parseFloat(amount).toLocaleString(undefined, {
          maximumFractionDigits: 6,
          minimumFractionDigits: 0,
        })}{' '}
        {tokenAmount.currency.symbol}
      </Text>
      <Text fontSize="16px" color="textSubtle" mb="24px">
        {formatDollarAmount(usdValue)}
      </Text>
    </>
  )
}
