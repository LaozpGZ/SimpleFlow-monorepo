import { Currency, Price, UnifiedCurrencyAmount, ZERO } from '@pancakeswap/sdk'

interface GetExecutionPriceParams {
  inputAmount?: UnifiedCurrencyAmount<Currency>
  outputAmount?: UnifiedCurrencyAmount<Currency>
}

export function getExecutionPrice(params?: GetExecutionPriceParams): Price<Currency, Currency> | undefined {
  if (!params) {
    return undefined
  }

  const { inputAmount, outputAmount } = params

  if (!inputAmount || !outputAmount) {
    return undefined
  }

  if (inputAmount.quotient === ZERO || outputAmount.quotient === ZERO) {
    return undefined
  }

  return new Price(inputAmount.currency, outputAmount.currency, inputAmount.quotient, outputAmount.quotient)
}
