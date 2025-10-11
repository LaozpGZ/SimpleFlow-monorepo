import { Token } from '@pancakeswap/swap-sdk-core'
import { Pair } from '@pancakeswap/v2-sdk'

/**
 *
 * In some cases, calling `pair.priceOf(token)` can throw an exception.
 * This may happen if the pair data is incomplete, invalid, or in an inconsistent state.
 *
 */
export function safeGetTokenPairPrice(pair: Pair, token: Token, significantDigits = 6): string {
  try {
    if (!pair || !token) return '-'
    const price = pair.priceOf(token)
    if (!price) return '-'
    return price.toSignificant(significantDigits)
  } catch (error) {
    console.error('safeGetTokenPairPrice error:', error)
    return '-'
  }
}
