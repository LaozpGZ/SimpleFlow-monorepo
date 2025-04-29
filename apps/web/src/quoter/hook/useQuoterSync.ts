import { useDebounce } from '@orbs-network/twap-ui/dist/hooks'
import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { createFilterToken } from '@pancakeswap/token-lists'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useAllTokens, useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useInputBasedAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { activeQuoteHashAtom } from 'quoter/atom/abortControlAtoms'
import { baseAllTypeBestTradeAtom, pauseAtom, userTypingAtom } from 'quoter/atom/bestTradeUISyncAtom'
import { updatePlaceholderAtom } from 'quoter/atom/placeholderAtom'
import { fetchCommonPoolsOnChain } from 'quoter/atom/poolsAtom'
import { PoolQuery, QuoteQuery } from 'quoter/quoter.types'
import { useEffect } from 'react'
import { useCurrentBlock } from 'state/block/hooks'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { isAddress } from 'viem/utils'
import { useBridgeMetadata } from 'views/Swap/Bridge/hooks/useBridgeMetadata'
import { BridgeOrderWithCommands } from 'views/Swap/utils'
import { useAccount } from 'wagmi'
import { bestQuoteAtom } from '../atom/bestQuoteAtom'
import { quoteNonceAtom } from '../atom/revalidateAtom'
import { createQuoteQuery } from '../utils/createQuoteQuery'
import { useQuoteContext } from './QuoteContext'

const REVALIDATE_TIME = 7

export const useQuoterSync = () => {
  const swapState = useSwapState()
  const debouncedSwapState = useDebounce(swapState, 300)
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId, chainId: inputChainId },
    [Field.OUTPUT]: { currencyId: stateOutputCurrencyId, chainId: stateOutputCurrencyChainId },
  } = debouncedSwapState
  const { address } = useAccount()

  // TODO: polish this logic to make it more efficient for cross-chain
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

  const inputCurrency = useCurrency(inputCurrencyId, inputChainId)

  outputCurrency = useCurrency(outputCurrencyId, outputCurrencyChainId)

  const isExactIn = independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const amount = tryParseAmount(typedValue, independentCurrency ?? undefined)
  const { singleHopOnly, split, v2Swap, v3Swap, infinitySwap, stableSwap, maxHops, speedQuoteEnabled, xEnabled } =
    useQuoteContext()
  const setTrade = useSetAtom(baseAllTypeBestTradeAtom)
  const setTyping = useSetAtom(userTypingAtom)
  const [paused, pauseQuote] = useAtom(pauseAtom)

  const { slippageTolerance: slippage } = useInputBasedAutoSlippageWithFallback(amount)
  const blockNumber = useCurrentBlock()
  const setActiveQuoteHash = useSetAtom(activeQuoteHashAtom)
  const [nonce, setNonce] = useAtom(quoteNonceAtom)

  const quoteQueryInit: QuoteQuery = {
    amount,
    currency: dependentCurrency,
    baseCurrency: independentCurrency,
    tradeType,
    maxHops: singleHopOnly ? 1 : maxHops,
    maxSplits: split ? undefined : 0,
    v2Swap,
    v3Swap,
    infinitySwap,
    stableSwap,
    speedQuoteEnabled,
    xEnabled,
    slippage,
    address,
    blockNumber,
    nonce,
    hash: '',
    for: 'main',
    createTime: Date.now(),
  }

  const quoteQuery = createQuoteQuery(quoteQueryInit)
  const setPlaceholder = useSetAtom(updatePlaceholderAtom)
  const quoteHistory: QuoteQuery[] = []

  useEffect(() => {
    if (!inputCurrency || !outputCurrency) {
      return
    }
    const poolQuery: PoolQuery = {
      quoteHash: quoteQuery.hash,
      currencyA: inputCurrency,
      currencyB: outputCurrency,
      options: {},
      chainId,
      infinity: quoteQuery.infinitySwap,
      v2Pools: !!quoteQuery.v2Swap,
      v3Pools: !!quoteQuery.v3Swap,
      signal: quoteQuery.signal,
      stableSwap: !!quoteQuery.stableSwap,
      provider: quoteQuery.provider,
    }
    fetchCommonPoolsOnChain(poolQuery)
  }, [quoteQuery.hash, inputCurrency, outputCurrency])

  useEffect(() => {
    while (quoteHistory.length > 0) {
      const historyQuote = quoteHistory.pop()
      historyQuote?.controller?.abort()
    }

    quoteHistory.push(quoteQuery)
    setActiveQuoteHash(quoteQuery.hash)
  }, [quoteQuery.hash])

  useEffect(() => {
    setTyping(true)
  }, [typedValue, setTyping])

  const quoteResult = useAtomValue(bestQuoteAtom(quoteQuery))
  useEffect(() => {
    let t = 0
    const interval = setInterval(() => {
      const outdated = Date.now() - quoteQuery.createTime! > REVALIDATE_TIME
      if (paused || (!outdated && quoteResult.loading)) {
        return
      }
      if (t > 0) {
        if (t % REVALIDATE_TIME === 0) {
          setNonce((v) => v + 1)
        }
      }
      t++
    }, 1000)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteQuery.hash, paused, quoteResult.loading])

  const swapOrder = quoteResult?.data

  const stateOutputCurrency = useCurrency(stateOutputCurrencyId, stateOutputCurrencyChainId)

  const {
    data: bridgeOrder,
    error: bridgeError,
    isLoading: bridgeLoading,
  } = useBridgeMetadata({
    inputAmount: swapOrder?.trade ? swapOrder?.trade?.outputAmount : amount,
    outputCurrency: stateOutputCurrency,
  })

  useEffect(() => {
    if (paused) {
      return
    }

    // TODO: refactor this logic
    if (bridgeOrder || bridgeError || bridgeLoading) {
      let finalOrder: BridgeOrderWithCommands | undefined

      if (swapOrder) {
        finalOrder = {
          bridgeFee: bridgeOrder?.bridgeFee,
          type: OrderType.PCS_BRIDGE,
          trade: {
            inputAmount: swapOrder?.trade?.inputAmount,
            outputAmount: bridgeOrder?.trade?.outputAmount,
            routes: [
              ...('routes' in swapOrder?.trade ? swapOrder.trade.routes : []),
              {
                path: [swapOrder?.trade?.outputAmount?.currency, bridgeOrder?.trade?.outputAmount?.currency],
                inputAmount: swapOrder?.trade?.outputAmount,
                outputAmount: bridgeOrder?.trade?.outputAmount,
                type: RouteType.BRIDGE,
              },
            ],
            tradeType: bridgeOrder?.trade?.tradeType,
          },
          commands: [swapOrder, bridgeOrder],
          isLoading: false,
          error: undefined,
        } as BridgeOrderWithCommands
      } else if (amount) {
        finalOrder = {
          ...bridgeOrder,
          commands: [bridgeOrder],
          isLoading: false,
          error: undefined,
        } as BridgeOrderWithCommands
      }

      setTrade({
        bestOrder: finalOrder,
        tradeLoaded: !bridgeLoading,
        tradeError: bridgeError ?? undefined,
        refreshDisabled: false,
        refreshOrder: () => {
          setNonce((v) => v + 1)
        },
        refreshTrade: () => {
          setNonce((v) => v + 1)
        },
        pauseQuoting: () => {
          pauseQuote(true)
        },
        resumeQuoting: () => {
          pauseQuote(false)
        },
      })
    } else {
      if (quoteResult.data?.trade && quoteResult.placeholderHash && !quoteResult.loading) {
        setPlaceholder(quoteResult.placeholderHash, quoteResult.data)
      }

      if (paused) {
        return
      }

      setTrade({
        bestOrder: quoteResult.data,
        tradeLoaded: !quoteResult?.loading,
        tradeError: quoteResult?.error,
        refreshDisabled: false,
        refreshOrder: () => {
          setNonce((v) => v + 1)
        },
        refreshTrade: () => {
          setNonce((v) => v + 1)
        },
        pauseQuoting: () => {
          pauseQuote(true)
        },
        resumeQuoting: () => {
          pauseQuote(false)
        },
      })
    }

    setTyping(false)
  }, [
    bridgeLoading,
    bridgeOrder,
    bridgeError,
    quoteResult.data,
    quoteResult.loading,
    quoteResult.error,
    pauseQuote,
    setTrade,
    setTyping,
    setNonce,
    paused,
  ])
}
