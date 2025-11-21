import { Currency, CurrencyAmount, Fraction, Price, UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/sdk'
import formatLocaleNumber from './formatLocaleNumber'

export function formatCurrencyAmount(
  amount: UnifiedCurrencyAmount<UnifiedCurrency> | undefined,
  sigFigs: number,
  locale: string | undefined,
  fixedDecimals?: number,
): string {
  if (!amount) {
    return '-'
  }

  if (amount.quotient === 0n) {
    return '0'
  }

  if (amount.divide(amount.decimalScale).lessThan(new Fraction(1, 100000))) {
    return `<0.0001`
  }

  // Convert to number for formatLocaleNumber to handle both CurrencyAmount and UnifiedCurrencyAmount
  // Both types have toExact() method, so we can use toSignificant for sigFigs
  const amountNumber = parseFloat(amount.toSignificant(sigFigs))
  return formatLocaleNumber({
    number: amountNumber,
    locale,
    sigFigs,
    fixedDecimals,
  })
}

export function formatPrice(
  price: Price<UnifiedCurrency, UnifiedCurrency> | undefined,
  sigFigs: number,
  locale: string,
): string {
  if (!price) {
    return '-'
  }

  if (parseFloat(price.toFixed(sigFigs)) < 0.0001) {
    return `<0.0001`
  }

  return formatLocaleNumber({ number: price, locale, sigFigs })
}

export function formatRawAmount(amountRaw: string, decimals: number, sigFigs: number): string {
  return new Fraction(amountRaw, 10n ** BigInt(decimals)).toSignificant(sigFigs)
}
