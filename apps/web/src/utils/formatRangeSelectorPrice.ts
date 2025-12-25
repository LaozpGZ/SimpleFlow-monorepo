import { Currency, Price } from '@simpleflow/swap-sdk-core'

export const formatRangeSelectorPrice = (price: Price<Currency, Currency> | undefined) => {
  if (!price) return ''

  return price.greaterThan(1) ? price.toSignificant(6) : price.toSignificant(9)
}
