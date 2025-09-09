import { atom } from 'jotai'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { CurrencyAmount, Price, Token, TradeType } from '@pancakeswap/sdk'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { independentFieldAtom, previousIndependentFieldAtom, typedValueAtom } from './fieldAtoms'
import { baseCurrencyAtom, quoteCurrencyAtom } from '../currency/currencyAtoms'
import { customMarketPriceAtom, marketPriceAtom } from './marketPriceAtoms'

const independentAmountAtom = atom(async (get) => {
  const value = get(typedValueAtom)
  const currency = await get(baseCurrencyAtom)
  return tryParseAmount<Token>(value, currency as Token)
})

const dependentAmountAtom = atom(async (get) => {
  const independentAmount = await get(independentAmountAtom)
  const quoteCurrency = await get(quoteCurrencyAtom)
  const independentField = get(independentFieldAtom)
  const customMarketPrice = get(customMarketPriceAtom)

  if (customMarketPrice !== undefined) {
    const marketPrice = await get(marketPriceAtom)
    if (!marketPrice || !independentAmount || !quoteCurrency) return undefined

    const outputAmount = CurrencyAmount.fromRawAmount(
      marketPrice.currency,
      (independentAmount.numerator * marketPrice.numerator) / independentAmount.decimalScale,
    )

    return outputAmount
  }

  const zeroAmount = tryParseAmount('0', quoteCurrency)

  if (!independentAmount || independentAmount.numerator === 0n || !quoteCurrency) return zeroAmount

  const selectedPool = await get(selectedPoolAtom)

  if (!selectedPool || !selectedPool.pool) return zeroAmount

  const { pool, routingSdkPool } = selectedPool

  const tradeType = independentField === Field.CURRENCY_A ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT

  const gasPriceWei = await get(gasPriceWeiAtom(pool.chainId))

  try {
    const bestTrade = await findBestTrade({
      amount: independentAmount,
      quoteCurrency,
      tradeType,
      candidatePools: [routingSdkPool],
      gasPriceWei: gasPriceWei?.toString() || '',
      maxHops: 1,
      maxSplits: 0,
      quoteId: `limit-order-${Date.now()}`,
    })
    console.log('bestTrade', bestTrade)

    return tradeType === TradeType.EXACT_INPUT
      ? bestTrade?.outputAmountWithGasAdjusted
      : bestTrade?.inputAmountWithGasAdjusted
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
  const previousIndependentField = get(previousIndependentFieldAtom)
  const customMarketPrice = get(customMarketPriceAtom)

  const dependentAmount = await get(dependentAmountAtom)
  const formattedDependentAmount = formatAmount(dependentAmount)

  if (customMarketPrice !== undefined) {
    return {
      [Field.CURRENCY_A]: previousIndependentField === Field.CURRENCY_A ? typedValue : formattedDependentAmount,
      [Field.CURRENCY_B]: previousIndependentField === Field.CURRENCY_B ? typedValue : formattedDependentAmount,
    }
  }

  return {
    [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? typedValue : formattedDependentAmount,
    [Field.CURRENCY_B]: independentField === Field.CURRENCY_B ? typedValue : formattedDependentAmount,
  }
})

/// Setters
export const setInputAtom = atom(null, (_get, set, { field, value }: { field: Field; value: string | undefined }) => {
  set(typedValueAtom, value ?? '')
  set(independentFieldAtom, field)
})
