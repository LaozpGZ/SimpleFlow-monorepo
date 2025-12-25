import { Currency, Price } from '@simpleflow/sdk'

export const formatPreviewPrice = (price?: Price<Currency, Currency>) => {
  if (!price) return ''
  return price.greaterThan(1) ? price.toSignificant(6) : price.toFixed(6)
}
