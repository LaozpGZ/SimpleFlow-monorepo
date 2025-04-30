import { useDebounce } from '@orbs-network/twap-ui/dist/hooks'
import { OrderType } from '@pancakeswap/price-api-sdk'
import { Native } from '@pancakeswap/sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { createFilterToken } from '@pancakeswap/token-lists'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { UnsafeCurrency } from 'config/constants/types'
import { useAllTokens, useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useInputBasedAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  abortableViemProviderAtom,
  abortControllerAtom,
  abortSignalAtom,
  activeQuoteHashAtom,
} from 'quoter/atom/abortControlAtoms'
import { baseAllTypeBestTradeAtom, pauseAtom, userTypingAtom } from 'quoter/atom/bestTradeUISyncAtom'
import { updatePlaceholderAtom } from 'quoter/atom/placeholderAtom'
import { QuoteQuery } from 'quoter/quoter.types'
import { useEffect, useRef } from 'react'
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

const REVALIDATE_TIME = 10

const isNeedDestinationSwap = (inputChainId?: number, outputCurrency?: UnsafeCurrency) => {
  return inputChainId !== outputCurrency?.chainId && !outputCurrency?.isNative
}

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

  const needsDestinationSwap = isNeedDestinationSwap(inputChainId, outputCurrency)

  const { chainId } = useActiveChainId()
  const allTokens = useAllTokens(chainId)

  const filterToken = outputCurrency
    ? createFilterToken(outputCurrency.symbol, (address) => isAddress(address))
    : undefined

  const outputTokenOnInputChainId =
    outputCurrency?.isNative || needsDestinationSwap
      ? Native.onChain(chainId).wrapped
      : filterToken
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
  const historyHashes = useRef<string[]>([])
  const abortQuote = useSetAtom(abortSignalAtom)
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
  }

  const quoteQuery = createQuoteQuery(quoteQueryInit)
  const setPlaceholder = useSetAtom(updatePlaceholderAtom)
  const abortController = useAtomValue(abortControllerAtom(quoteQuery.hash))
  const viemProvider = useAtomValue(abortableViemProviderAtom(quoteQuery.hash))
  quoteQuery.signal = abortController.signal
  quoteQuery.provider = viemProvider

  useEffect(() => {
    for (let i = 0; i < historyHashes.current.length; i++) {
      const hash = historyHashes.current[i]
      abortQuote(hash)
    }
    historyHashes.current = [quoteQuery.hash]
    setActiveQuoteHash(quoteQuery.hash)
  }, [quoteQuery.hash])

  useEffect(() => {
    setTyping(true)
  }, [typedValue, setTyping])

  const quoteResult = useAtomValue(bestQuoteAtom(quoteQuery))
  useEffect(() => {
    let t = 0
    const pauseTimer = paused || quoteResult.loading
    const interval = setInterval(() => {
      if (pauseTimer) {
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
    inputAmount: needsDestinationSwap
      ? CurrencyAmount.fromRawAmount(
          Native.onChain(chainId).wrapped,
          swapOrder?.trade?.outputAmount?.quotient.toString() || 0,
        )
      : swapOrder?.trade
      ? swapOrder?.trade?.outputAmount
      : amount,
    outputCurrency:
      needsDestinationSwap && stateOutputCurrencyChainId
        ? Native.onChain(stateOutputCurrencyChainId).wrapped
        : stateOutputCurrency,
  })

  const destinationQuoteQueryInit: QuoteQuery = {
    amount: bridgeOrder?.trade?.outputAmount,
    currency: stateOutputCurrency,
    baseCurrency: bridgeOrder?.trade?.outputAmount?.currency,
    tradeType: TradeType.EXACT_INPUT,
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
    // TODO: remove this nonce hack
    nonce: nonce + 100,
    hash: '',
  }

  const destinationQuoteQuery = createQuoteQuery(destinationQuoteQueryInit)

  const destinationSwapOrder = useAtomValue(bestQuoteAtom(destinationQuoteQuery))?.data

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
            outputAmount: needsDestinationSwap
              ? destinationSwapOrder?.trade?.outputAmount
              : bridgeOrder?.trade?.outputAmount,
            routes: [
              ...('routes' in swapOrder?.trade ? swapOrder.trade.routes : []),
              {
                path: [swapOrder?.trade?.outputAmount?.currency, bridgeOrder?.trade?.outputAmount?.currency],
                inputAmount: swapOrder?.trade?.outputAmount,
                outputAmount: bridgeOrder?.trade?.outputAmount,
                type: RouteType.BRIDGE,
              },
              ...(needsDestinationSwap && destinationSwapOrder
                ? 'routes' in destinationSwapOrder.trade
                  ? destinationSwapOrder.trade.routes
                  : []
                : []),
            ],
            tradeType: bridgeOrder?.trade?.tradeType,
          },
          commands: [swapOrder, bridgeOrder, ...(needsDestinationSwap ? [destinationSwapOrder] : [])],
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

      console.log('finalOrder', finalOrder)

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
    destinationSwapOrder,
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
