import { atom } from 'jotai'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { Token, TradeType } from '@pancakeswap/sdk'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import { BigNumber as BN } from 'bignumber.js'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { getTickAdjustedPrice } from 'views/PCSLimitOrders/utils/ticks'
import { parseUnits } from '@pancakeswap/utils/viem/parseUnits'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { independentFieldAtom, typedValueAtom } from './fieldAtoms'
import { baseCurrencyAtom, quoteCurrencyAtom, inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { currentMarketPriceAtom, customMarketPriceAtom } from './marketPriceAtoms'

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
  const currentMarketPrice = await get(currentMarketPriceAtom)

  const independentField = get(independentFieldAtom)
  const independentAmount = await get(independentAmountAtom)
  const quoteCurrency = await get(quoteCurrencyAtom)

  if (!independentAmount || !quoteCurrency || (!currentMarketPrice && !customMarketPrice)) return undefined

  // Get output by multiplying input amount with market price (either custom or current)
  const marketPrice = customMarketPrice || currentMarketPrice
  if (marketPrice !== undefined) {
    const marketPriceBN = BN(marketPrice)
    if (marketPriceBN.lte(0) || marketPriceBN.isNaN() || !marketPriceBN.isFinite()) {
      console.error('inputAtoms: Invalid market price')
      return undefined
    }

    const price = independentField === Field.CURRENCY_A ? marketPriceBN : BN(1).dividedBy(marketPriceBN)
    const amount = BN(independentAmount.toExact()).multipliedBy(price)
    return tryParseAmount<Token>(amount.toString(), quoteCurrency as Token)
  }

  return undefined
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

export const parsedAmountsAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)
  const formattedAmounts = await get(formattedAmountsAtom)

  if (!inputCurrency || !outputCurrency)
    return {
      [Field.CURRENCY_A]: undefined,
      [Field.CURRENCY_B]: undefined,
    }

  return {
    [Field.CURRENCY_A]: parseUnits(formattedAmounts[Field.CURRENCY_A], inputCurrency.decimals),
    [Field.CURRENCY_B]: parseUnits(formattedAmounts[Field.CURRENCY_B], outputCurrency.decimals),
  }
})

/// Setters
export const setInputAtom = atom(null, (_get, set, { field, value }: { field: Field; value: string | undefined }) => {
  set(typedValueAtom, value ?? '')
  set(independentFieldAtom, field)
})
