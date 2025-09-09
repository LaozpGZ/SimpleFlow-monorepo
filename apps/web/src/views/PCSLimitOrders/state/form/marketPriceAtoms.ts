import { atom } from 'jotai'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/poolAtoms'

// Final Market Price considering user-entered price OR pool's price
// TODO: Refetch quotes in an interval
export const marketPriceAtom = atom(async (get) => {
  const inputCurrency = await get(inputCurrencyAtom)
  const outputCurrency = await get(outputCurrencyAtom)
  const selectedPool = await get(selectedPoolAtom)

  if (!selectedPool || !inputCurrency || !outputCurrency) return undefined

  const { pool, routingSdkPool } = selectedPool

  // Fetch quote for 1 base token
  const gasPriceWei = await get(gasPriceWeiAtom(pool.chainId))
  const independentAmount = tryParseCurrencyAmount('1', inputCurrency)

  if (!independentAmount) return undefined

  // maybe have a separate atom so quick actions can use as well
  const bestTrade = await findBestTrade({
    amount: independentAmount,
    quoteCurrency: outputCurrency,
    tradeType: TradeType.EXACT_INPUT,
    candidatePools: [routingSdkPool],
    gasPriceWei: gasPriceWei?.toString() || '',
    maxHops: 1,
    maxSplits: 0,
    quoteId: `limit-order-${Date.now()}`,
  })

  const outputAmount = bestTrade?.outputAmountWithGasAdjusted

  return outputAmount
})
