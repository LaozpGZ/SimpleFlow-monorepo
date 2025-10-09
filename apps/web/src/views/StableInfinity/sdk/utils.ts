import { Currency } from '@pancakeswap/sdk'
import { Address } from 'viem'
import invariant from 'tiny-invariant'

/**
 * Validates that a currency is a valid token
 */
export function validateCurrency(currency: Currency): void {
  invariant(currency, 'INVALID_CURRENCY')
  invariant(currency.wrapped, 'CURRENCY_NOT_WRAPPED')
}

/**
 * Validates that two currencies are different and valid
 */
export function validateCurrencyPair(tokenA: Currency, tokenB: Currency): void {
  validateCurrency(tokenA)
  validateCurrency(tokenB)
  invariant(!tokenA.equals(tokenB), 'IDENTICAL_CURRENCIES')
  invariant(tokenA.wrapped.address !== tokenB.wrapped.address, 'IDENTICAL_ADDRESSES')
}

/**
 * Sorts two currencies and returns them in deterministic order
 * This ensures consistent pool creation regardless of input order
 */
export function sortCurrencies(tokenA: Currency, tokenB: Currency): [Currency, Currency] {
  validateCurrencyPair(tokenA, tokenB)
  return tokenA.wrapped.sortsBefore(tokenB.wrapped) ? [tokenA, tokenB] : [tokenB, tokenA]
}

/**
 * Gets the sorted token addresses from two currencies
 */
export function getSortedTokenAddresses(tokenA: Currency, tokenB: Currency): [Address, Address] {
  const [token0, token1] = sortCurrencies(tokenA, tokenB)
  return [token0.wrapped.address as Address, token1.wrapped.address as Address]
}

/**
 * Generates a pool name from two currencies
 */
export function generatePoolName(tokenA: Currency, tokenB: Currency): string {
  const [token0, token1] = sortCurrencies(tokenA, tokenB)
  return `${token0.symbol}-${token1.symbol}`
}

/**
 * Generates a pool symbol from two currencies
 */
export function generatePoolSymbol(tokenA: Currency, tokenB: Currency): string {
  return generatePoolName(tokenA, tokenB) // Same as name for now
}

/**
 * Validates that a fee is within acceptable bounds
 */
export function validateFee(fee: bigint): void {
  invariant(fee >= 0n, 'NEGATIVE_FEE')
  invariant(fee <= 10000000n, 'FEE_TOO_HIGH') // Max 1%
}

/**
 * Validates that an amplification parameter is within acceptable bounds
 */
export function validateAmplification(A: bigint): void {
  invariant(A >= 1n, 'AMPLIFICATION_TOO_LOW')
  invariant(A <= 10000n, 'AMPLIFICATION_TOO_HIGH')
}

/**
 * Converts a percentage to fee format (0.01% = 1000000)
 */
export function percentageToFee(percentage: number): bigint {
  invariant(percentage >= 0 && percentage <= 1, 'INVALID_PERCENTAGE')
  return BigInt(Math.floor(percentage * 100000000))
}

/**
 * Converts fee format to percentage (1000000 = 0.01%)
 */
export function feeToPercentage(fee: bigint): number {
  return Number(fee) / 100000000
}
