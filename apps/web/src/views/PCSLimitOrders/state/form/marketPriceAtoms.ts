import { atom } from 'jotai'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { findBestTrade } from '@pancakeswap/routing-sdk'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { atomWithQuery } from 'jotai-tanstack-query'
import { FAST_INTERVAL } from 'config/constants'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/poolAtoms'

export const customMarketPriceAtom = atom<string | undefined>(undefined)

// Current market price, with refetch
export const currentMarketPriceAtom = atomWithQuery((get) => ({
  queryKey: [get(inputCurrencyAtom), get(outputCurrencyAtom), get(selectedPoolAtom)],
  queryFn: async () => {
    const inputCurrency = await get(inputCurrencyAtom)
    const outputCurrency = await get(outputCurrencyAtom)
    const selectedPool = await get(selectedPoolAtom)

    if (!selectedPool || !inputCurrency || !outputCurrency) return undefined

    const { pool, routingSdkPool } = selectedPool

    const independentAmount = tryParseCurrencyAmount('1', inputCurrency)
    if (!independentAmount) return undefined

    const gasPriceWei = await get(gasPriceWeiAtom(pool.chainId))

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
    return formatAmount(outputAmount, 6)
  },
  refetchInterval: FAST_INTERVAL,
  retry: 3,
  retryDelay: 2_000,
}))
