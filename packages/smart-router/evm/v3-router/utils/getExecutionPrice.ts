import { Currency, Price, UnifiedCurrencyAmount, ZERO } from '@pancakeswap/sdk'

export function getExecutionPrice({
  inputAmount,
  outputAmount,
}: {
  inputAmount?: UnifiedCurrencyAmount<Currency>
  outputAmount?: UnifiedCurrencyAmount<Currency>
}): Price<Currency, Currency> | undefined {
  if (!inputAmount || !outputAmount) {
    return undefined
  }

  if (inputAmount.quotient === ZERO || outputAmount.quotient === ZERO) {
    return undefined
  }

  return new Price(inputAmount.currency, outputAmount.currency, inputAmount.quotient, outputAmount.quotient)
}
