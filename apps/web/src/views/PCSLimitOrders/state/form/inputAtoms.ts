import { atom } from 'jotai'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { getCurrencyAddress, Token, TradeType } from '@pancakeswap/sdk'
import { InfinityClPool, InfinityRouter, PoolType, SmartRouter } from '@pancakeswap/smart-router'
import { toRoutingSDKPool, toSmartRouterPool } from 'utils/convertTrade'
import { getPoolManagerAddress } from 'utils/addressHelpers'
import { encodeHooksRegistration } from '@pancakeswap/infinity-sdk'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import { createQuoteQuery } from 'quoter/utils/createQuoteQuery'
import { selectedPoolAtom } from '../pools/poolAtoms'
import { independentFieldAtom, typedValueAtom } from './fieldAtoms'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

const baseCurrencyAtom = atom((get) =>
  get(independentFieldAtom) === Field.CURRENCY_A ? get(inputCurrencyAtom) : get(outputCurrencyAtom),
)
const quoteCurrencyAtom = atom((get) =>
  get(independentFieldAtom) === Field.CURRENCY_A ? get(outputCurrencyAtom) : get(inputCurrencyAtom),
)

const independentAmountAtom = atom(async (get) => {
  const value = get(typedValueAtom)
  const currency = await get(baseCurrencyAtom)
  return tryParseAmount<Token>(value, currency as Token)
})

const dependentAmountAtom = atom(async (get) => {
  const independentAmount = await get(independentAmountAtom)
  const quoteCurrency = await get(quoteCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)

  const zeroAmount = tryParseAmount('0', quoteCurrency)

  if (!independentAmount || independentAmount.numerator === 0n || !outputCurrency) return zeroAmount

  const selectedPool = await get(selectedPoolAtom)

  if (!selectedPool || !selectedPool.pool) return zeroAmount

  const { pool, routingSdkPool } = selectedPool

  const tradeType = get(independentFieldAtom) === Field.CURRENCY_A ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT

  const gasPriceWei = await get(gasPriceWeiAtom(pool.chainId))

  try {
    const bestTrade = await findBestTrade({
      amount: independentAmount,
      quoteCurrency: outputCurrency,
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
  const independentField = get(independentFieldAtom)

  const typedValue = get(typedValueAtom)

  if (!typedValue) {
    return {
      [Field.CURRENCY_A]: '',
      [Field.CURRENCY_B]: '',
    }
  }

  const dependentAmount = await get(dependentAmountAtom)
  const formattedDependentAmount = formatAmount(dependentAmount)

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
