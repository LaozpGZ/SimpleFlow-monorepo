import { atom } from 'jotai'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { CurrencyAmount, Price, Token, TradeType } from '@pancakeswap/sdk'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { independentFieldAtom, fieldBeforeCustomPriceAtom, typedValueAtom } from './fieldAtoms'
import { baseCurrencyAtom, quoteCurrencyAtom, inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { customMarketPriceAtom, marketPriceAtom, clearCustomMarketPriceAtom } from './marketPriceAtoms'

const independentAmountAtom = atom(async (get) => {
  const value = get(typedValueAtom)
  const independentField = get(independentFieldAtom)
  const customMarketPrice = get(customMarketPriceAtom)
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  // When custom market price is set, use the field that was independent before custom price
  if (customMarketPrice) {
    const fieldBeforeCustomPrice = get(fieldBeforeCustomPriceAtom)
    const currency = fieldBeforeCustomPrice === Field.CURRENCY_A ? inputCurrency : outputCurrency
    return tryParseAmount<Token>(value, currency as Token)
  }

  // Normal case: use current independent field
  const currency = independentField === Field.CURRENCY_A ? inputCurrency : outputCurrency
  return tryParseAmount<Token>(value, currency as Token)
})

const dependentAmountAtom = atom(async (get) => {
  const independentAmount = await get(independentAmountAtom)
  const customMarketPrice = get(customMarketPriceAtom)
  const independentField = get(independentFieldAtom)
  const baseCurrency = await get(baseCurrencyAtom)
  const quoteCurrency = await get(quoteCurrencyAtom)
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!independentAmount || !baseCurrency || !quoteCurrency || !inputCurrency || !outputCurrency) return undefined

  // Handle custom market price scenario
  if (customMarketPrice !== undefined) {
    // customMarketPrice always represents: 1 inputCurrency = X outputCurrency
    // Use current independentField to determine calculation direction

    if (independentField === Field.CURRENCY_A) {
      // User is typing in CURRENCY_A (input field), calculate CURRENCY_B (output)
      // independentAmount is in inputCurrency, calculate output in outputCurrency
      // Formula: inputAmount * customMarketPrice = outputAmount
      const outputAmount = CurrencyAmount.fromRawAmount(
        outputCurrency,
        (independentAmount.numerator * customMarketPrice.numerator) / independentAmount.decimalScale,
      )
      return outputAmount
    }
    // User is typing in CURRENCY_B (output field), calculate CURRENCY_A (input)
    // independentAmount is in outputCurrency, calculate input in inputCurrency
    // Formula: outputAmount / customMarketPrice = inputAmount
    const inputAmount = CurrencyAmount.fromRawAmount(
      inputCurrency,
      (independentAmount.numerator * independentAmount.decimalScale) / customMarketPrice.numerator,
    )
    return inputAmount
  }

  // Handle normal market price scenario using routing SDK
  const selectedPool = await get(selectedPoolAtom)
  if (!selectedPool || !selectedPool.pool) return undefined

  const { pool, routingSdkPool } = selectedPool
  const tradeType = independentField === Field.CURRENCY_A ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const gasPriceWei = await get(gasPriceWeiAtom(pool.chainId))

  try {
    const bestTrade = await findBestTrade({
      amount: independentAmount,
      // For EXACT_INPUT (Field.CURRENCY_A): we have inputAmount, want outputAmount
      // For EXACT_OUTPUT (Field.CURRENCY_B): we have outputAmount, want inputAmount
      quoteCurrency: independentField === Field.CURRENCY_A ? outputCurrency : inputCurrency,
      tradeType,
      candidatePools: [routingSdkPool],
      gasPriceWei: gasPriceWei?.toString() || '',
      maxHops: 1,
      maxSplits: 0,
      quoteId: `limit-order-${Date.now()}`,
    })

    const result =
      tradeType === TradeType.EXACT_INPUT
        ? bestTrade?.outputAmountWithGasAdjusted
        : bestTrade?.inputAmountWithGasAdjusted

    return result
  } catch (e) {
    console.error('Quoting Error in findBestTrade', e)
    return undefined
  }
})

export const formattedAmountsAtom = atom(async (get) => {
  const typedValue = get(typedValueAtom)

  if (!typedValue) {
    return {
      [Field.CURRENCY_A]: '',
      [Field.CURRENCY_B]: '',
    }
  }

  const independentField = get(independentFieldAtom)
  const dependentAmount = await get(dependentAmountAtom)
  const formattedDependentAmount = formatAmount(dependentAmount) || ''

  // Use current independent field for both normal and custom market price scenarios
  return {
    [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? typedValue : formattedDependentAmount,
    [Field.CURRENCY_B]: independentField === Field.CURRENCY_B ? typedValue : formattedDependentAmount,
  }
})

/// Setters
export const setInputAtom = atom(null, (get, set, { field, value }: { field: Field; value: string | undefined }) => {
  // When custom market price is set, allow input in either field without clearing the custom price
  // The custom price should only be cleared explicitly via clearCustomMarketPriceAtom or when currencies change

  set(typedValueAtom, value ?? '')
  set(independentFieldAtom, field)
})
