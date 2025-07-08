import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Flex, FlexProps, Text } from '@pancakeswap/uikit'

export const CurrencyAmountGiftDisplay = ({
  currencyAmount,
  usdValue,
  ...props
}: {
  currencyAmount: CurrencyAmount<Token | NativeCurrency>
  usdValue: number
} & FlexProps) => {
  return (
    <Flex {...props}>
      <CurrencyLogo showChainLogo currency={currencyAmount.currency.wrapped} size="40px" />
      <Flex flexDirection="column" ml="8px">
        <Text fontWeight="600" fontSize="14px" color="text">
          {currencyAmount.toSignificant(6)} {currencyAmount.currency.symbol}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {formatDollarAmount(usdValue)}
        </Text>
      </Flex>
    </Flex>
  )
}
