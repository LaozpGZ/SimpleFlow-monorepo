import { atom } from 'jotai'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { Token, TradeType } from '@pancakeswap/sdk'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { independentFieldAtom, typedValueAtom } from './fieldAtoms'
import { baseCurrencyAtom, quoteCurrencyAtom, inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { customMarketPriceAtom } from './marketPriceAtoms'

const independentAmountAtom = atom(async (get) => {
  const value = get(typedValueAtom)
  const independentField = get(independentFieldAtom)

  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  const currency = independentField === Field.CURRENCY_A ? inputCurrency : outputCurrency
  return tryParseAmount<Token>(value, currency as Token)
})

const dependentAmountAtom = atom(async (get) => {
  const customMarketPrice = get(customMarketPriceAtom)
  const independentField = get(independentFieldAtom)
  const independentAmount = await get(independentAmountAtom)
  const baseCurrency = await get(baseCurrencyAtom)
  const quoteCurrency = await get(quoteCurrencyAtom)
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  if (!independentAmount || !baseCurrency || !quoteCurrency || !inputCurrency || !outputCurrency) return undefined

  // Handle custom market price scenario
  if (customMarketPrice !== undefined) {
    const customMarketPriceBN = BN(customMarketPrice)
    if (customMarketPriceBN.lte(0) || customMarketPriceBN.isNaN() || !customMarketPriceBN.isFinite()) {
      console.error('Invalid custom market price')
      return undefined
    }

    const price = independentField === Field.CURRENCY_A ? customMarketPrice : BN(1).dividedBy(customMarketPriceBN)
    const amount = BN(independentAmount.toExact()).multipliedBy(price)
    return tryParseAmount<Token>(amount.toString(), quoteCurrency as Token)
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

    console.debug('bestTrade', bestTrade)

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
