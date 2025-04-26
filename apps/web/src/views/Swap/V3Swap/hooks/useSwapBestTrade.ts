import { TradeType } from '@pancakeswap/sdk'
import { createFilterToken } from '@pancakeswap/token-lists'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'

import { useAllTokens, useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useBestAMMTrade, useBestTradeFromApi, useBestTradeFromApiShadow } from 'hooks/useBestAMMTrade'
import { usePCSXEnabledOnChain } from 'hooks/usePCSX'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import {
  useUserSplitRouteEnable,
  useUserStableSwapEnable,
  useUserV2SwapEnable,
  useUserV3SwapEnable,
} from 'state/user/smartRouter'
import { isAddress } from 'viem/utils'

interface Options {
  maxHops?: number
}

export function useSwapBestOrder({ maxHops }: Options = {}) {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId, chainId: inputCurrencyChainId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId, chainId: outputCurrencyChainId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId, inputCurrencyChainId)
  const outputCurrency = useCurrency(outputCurrencyId, outputCurrencyChainId)
  const enabled = usePCSXEnabledOnChain(inputCurrency?.chainId)
  const isExactIn = independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const amount = tryParseAmount(typedValue, independentCurrency ?? undefined)

  const [singleHopOnly] = useUserSingleHopOnly()
  const [split] = useUserSplitRouteEnable()
  const [v2Swap] = useUserV2SwapEnable()
  const [v3Swap] = useUserV3SwapEnable()
  const [stableSwap] = useUserStableSwapEnable()
  // stable swap only support exact in
  const stableSwapEnable = useMemo(() => {
    return stableSwap && isExactIn
  }, [stableSwap, isExactIn])

  const bestTradeOptions = {
    enabled,
    amount,
    currency: dependentCurrency,
    baseCurrency: independentCurrency,
    tradeType,
    maxHops: singleHopOnly ? 1 : maxHops,
    maxSplits: split ? undefined : 0,
    v2Swap,
    v3Swap,
    stableSwap: stableSwapEnable,
    trackPerf: true,
    retry: 1,
  }
  const { fetchStatus, data, isStale, error, refetch } = useBestTradeFromApi(bestTradeOptions)
  useBestTradeFromApiShadow(bestTradeOptions, 'quote-api-ori')
  useBestTradeFromApiShadow(bestTradeOptions, 'quote-api-opt')

  // if bridge, return bridege trade

  const [loading, setLoading] = useState(false)
  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const res = await refetch()
      return res
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const isValidQuote = useMemo(
    () =>
      amount &&
      inputCurrency &&
      outputCurrency &&
      data?.trade &&
      amount.toExact() === (isExactIn ? data.trade.inputAmount.toExact() : data.trade.outputAmount.toExact()) &&
      data.trade.inputAmount.currency.equals(inputCurrency) &&
      data.trade.outputAmount.currency.equals(outputCurrency),
    [amount, data?.trade, isExactIn, inputCurrency, outputCurrency],
  )

  const isAutoRefetch = useMemo(
    () => !loading && fetchStatus === 'fetching' && isValidQuote,
    [loading, fetchStatus, isValidQuote],
  )

  return {
    enabled,
    refresh,
    isStale,
    isValidQuote,
    error,
    isLoading: useDeferredValue(
      Boolean((fetchStatus === 'fetching' && !isAutoRefetch) || (typedValue && !data && !error)),
    ),
    order: typedValue ? data : undefined,
  }
}

export function useSwapBestTrade({ maxHops }: Options = {}) {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId, chainId: inputCurrencyChainId },
    [Field.OUTPUT]: { currencyId: stateOutputCurrencyId, chainId: stateOutputCurrencyChainId },
  } = useSwapState()

  // TODO: polish thi logic to make it more efficient for cross-chain
  let outputCurrencyId = stateOutputCurrencyId
  let outputCurrencyChainId = stateOutputCurrencyChainId
  let outputCurrency = useCurrency(outputCurrencyId, outputCurrencyChainId)

  const { chainId } = useActiveChainId()
  const allTokens = useAllTokens(chainId)

  const filterToken = outputCurrency
    ? createFilterToken(outputCurrency.symbol, (address) => isAddress(address))
    : undefined

  const outputTokenOnInputChainId =
    outputCurrency && filterToken
      ? Object.values(allTokens)
          .filter(filterToken)
          .find((token) => token.symbol === outputCurrency?.symbol)
      : undefined

  if (outputCurrencyId && chainId && chainId !== outputCurrencyChainId && outputTokenOnInputChainId) {
    outputCurrencyId = outputTokenOnInputChainId.address
    outputCurrencyChainId = chainId
  }

  const inputCurrency = useCurrency(inputCurrencyId, inputCurrencyChainId)
  outputCurrency = useCurrency(outputCurrencyId, outputCurrencyChainId)

  // If cross-chain, TradeType.EXACT_OUTPUT
  const isExactIn = chainId === stateOutputCurrencyChainId ? true : independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const amount = tryParseAmount(typedValue, independentCurrency ?? undefined)

  const [singleHopOnly] = useUserSingleHopOnly()
  const [split] = useUserSplitRouteEnable()
  const [v2Swap] = useUserV2SwapEnable()
  const [v3Swap] = useUserV3SwapEnable()
  const [stableSwap] = useUserStableSwapEnable()
  // stable swap only support exact in
  const stableSwapEnable = useMemo(() => {
    return stableSwap && isExactIn
  }, [stableSwap, isExactIn])

  const {
    isLoading,
    trade,
    refresh: refreshQuote,
    syncing,
    isStale,
    error,
  } = useBestAMMTrade({
    amount,
    currency: dependentCurrency,
    baseCurrency: independentCurrency,
    tradeType,
    maxHops: singleHopOnly ? 1 : maxHops,
    maxSplits: split ? undefined : 0,
    v2Swap,
    v3Swap,
    stableSwap: stableSwapEnable,
    type: 'auto',
    trackPerf: true,
  })
  const [loading, setLoading] = useState(false)
  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const res = await refreshQuote()
      return res
    } finally {
      setLoading(false)
    }
  }, [refreshQuote])

  const isAutoRefetch = useMemo(
    () =>
      !loading &&
      (isLoading || syncing) &&
      amount &&
      inputCurrency &&
      outputCurrency &&
      trade &&
      amount.toExact() === (isExactIn ? trade.inputAmount.toExact() : trade.outputAmount.toExact()) &&
      trade.inputAmount.currency.equals(inputCurrency) &&
      trade.outputAmount.currency.equals(outputCurrency),
    [loading, isLoading, syncing, amount, trade, isExactIn, inputCurrency, outputCurrency],
  )

  const isDeferredLoading = useDeferredValue(
    Boolean(((isLoading || syncing) && !isAutoRefetch) || (typedValue && !trade && !error)),
  )

  return useMemo(() => {
    return {
      refresh,
      syncing,
      isStale,
      error,
      isLoading: isDeferredLoading,
      trade: typedValue ? trade : undefined,
    }
  }, [refresh, syncing, isStale, error, isDeferredLoading, typedValue, trade])
}
