import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { ArrowForwardIcon, AutoColumn, Row, RowFixed, Text } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { getFullChainNameById } from 'utils/getFullChainNameById'

const displayPrecision = 6

interface DualCurrencyDisplayProps {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  inputTextColor?: string
  outputTextColor?: string
}
export const DualCurrencyDisplay = ({
  inputAmount,
  outputAmount,
  inputTextColor,
  outputTextColor,
}: DualCurrencyDisplayProps) => {
  return (
    <Row justifyContent="space-around">
      <AutoColumn justify="center">
        <CurrencyLogo currency={inputAmount.currency} size="40px" showChainLogo />

        <Text color={inputTextColor} bold ellipsis>
          {formatAmount(inputAmount, displayPrecision)}&nbsp;
          {inputAmount.currency.symbol}
        </Text>

        <Text color="textSubtle" fontSize="12px" bold>
          {getFullChainNameById(inputAmount.currency.chainId)}
        </Text>
      </AutoColumn>
      <RowFixed my="auto">
        <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />
      </RowFixed>
      <AutoColumn justify="center">
        <CurrencyLogo currency={outputAmount.currency} size="40px" showChainLogo />

        <Text bold ellipsis color={outputTextColor}>
          {formatAmount(outputAmount, displayPrecision)}&nbsp;{outputAmount.currency.symbol}
        </Text>

        <Text color="textSubtle" fontSize="12px" bold>
          {getFullChainNameById(outputAmount.currency.chainId)}
        </Text>
      </AutoColumn>
    </Row>
  )
}
