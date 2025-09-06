import { UnifiedCurrency, ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'

/**
 *  Currency ID for:
 *  native = ZERO Address,
 *  token = Token Address
 */
export const getCurrencyIdWithZeroAddr = (currency?: UnifiedCurrency | null) => {
  if (!currency) return ''
  if (currency.isNative) return ZERO_ADDRESS
  if (currency.isToken) return currency.address
  throw new Error('Invalid currency in getCurrencyIdWithZeroAddr')
}
