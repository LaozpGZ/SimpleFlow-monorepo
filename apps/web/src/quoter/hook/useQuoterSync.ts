import { useDebounce } from '@orbs-network/twap-ui/dist/hooks'
import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { UnsafeCurrency } from 'config/constants/types'
import { convertTokenToCurrency, useAllTokens, useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useInputBasedAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import first from 'lodash/first'
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
import { useBridgeAvailableRoutes } from 'views/Swap/Bridge/hooks'
import { BridgeMetadataParams, useBridgeMetadata } from 'views/Swap/Bridge/hooks/useBridgeMetadata'
import { BridgeOrderWithCommands, InterfaceOrder } from 'views/Swap/utils'
import { useAccount } from 'wagmi'
import { bestQuoteAtom, EnhancedQuoteQuery } from '../atom/bestQuoteAtom'
import { quoteNonceAtom } from '../atom/revalidateAtom'
import { createQuoteQuery } from '../utils/createQuoteQuery'
import { useQuoteContext } from './QuoteContext'

const REVALIDATE_TIME = 10

const isNeedDestinationSwap = (inputChainId?: number, outputCurrency?: UnsafeCurrency) => {
  return inputChainId !== outputCurrency?.chainId && !outputCurrency?.isNative
}

export const useSwapQuoteSync = ({
  amount,
  outputCurrency,
  tradeType,
  paused,
  setNonce,
  nonce,
  addNonce = false,
}: {
  amount?: CurrencyAmount<Currency>
  outputCurrency: UnsafeCurrency | Currency[]
  tradeType: TradeType
  paused: boolean
  setNonce: (nonce: number | ((v: number) => number)) => void
  nonce: number
  addNonce?: boolean
}) => {
  const { singleHopOnly, split, v2Swap, v3Swap, infinitySwap, stableSwap, maxHops, speedQuoteEnabled, xEnabled } =
    useQuoteContext()
  const { slippageTolerance: slippage } = useInputBasedAutoSlippageWithFallback(amount)
  const blockNumber = useCurrentBlock()
  const setActiveQuoteHash = useSetAtom(activeQuoteHashAtom)
  const historyHashes = useRef<string[]>([])
  const abortQuote = useSetAtom(abortSignalAtom)
  const { address } = useAccount()

  const quoteQueryInit: EnhancedQuoteQuery = {
    amount,
    currency: outputCurrency,
    baseCurrency: amount?.currency,
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
    // TODO: remove this nonce hack
    nonce: addNonce ? nonce + 1000000 : nonce,
    hash: '',
  }
  // TODO: force cast to QuoteQuery, fix later
  const quoteQuery = createQuoteQuery(quoteQueryInit as QuoteQuery)
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

  return quoteResult
}

export const useQuoterSync = () => {
  const swapState = useSwapState()
  const debouncedSwapState = useDebounce(swapState, 300)
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId, chainId: inputChainId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId, chainId: outputCurrencyChainId },
  } = debouncedSwapState

  const inputCurrency = useCurrency(inputCurrencyId, inputChainId)

  const outputCurrency = useCurrency(outputCurrencyId, outputCurrencyChainId)

  const { chainId } = useActiveChainId()

  const isBridge = chainId && outputCurrencyChainId && chainId !== outputCurrencyChainId

  const needsDestinationSwap = isBridge && isNeedDestinationSwap(inputChainId, outputCurrency)

  const allTokens = useAllTokens(chainId)
  const allTokensOnDestinationChain = useAllTokens(outputCurrencyChainId)

  const isExactIn = isBridge ? true : independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const amount = tryParseAmount(typedValue, independentCurrency ?? undefined)

  const setTrade = useSetAtom(baseAllTypeBestTradeAtom)
  const setTyping = useSetAtom(userTypingAtom)
  const [paused, pauseQuote] = useAtom(pauseAtom)

  const setPlaceholder = useSetAtom(updatePlaceholderAtom)
  const [nonce, setNonce] = useAtom(quoteNonceAtom)

  const stateOutputCurrency = useCurrency(outputCurrencyId, outputCurrencyChainId)

  const { data: routes } = useBridgeAvailableRoutes({
    originChainId: chainId,
    destinationChainId: outputCurrencyChainId,
  })

  // TODO: remove duplication ETH pairs
  // Instead of using [], use Object to store the pairs
  const bridgePairs = routes
    ?.filter((route) => allTokens[route.originToken] && allTokensOnDestinationChain[route.destinationToken])
    .map((route) => [
      convertTokenToCurrency(allTokens[route.originToken]),
      convertTokenToCurrency(allTokensOnDestinationChain[route.destinationToken]),
    ])

  const hasBridgePair = bridgePairs && bridgePairs?.length > 0

  const swapOriginOutputCurrency = isBridge && hasBridgePair ? bridgePairs.map((x) => x[0]) : undefined

  useEffect(() => {
    setTyping(true)
  }, [typedValue, setTyping])

  // TODO: support swap -> Bridge: ETH case
  const [swapBridgeCurrencyOnOriginChain, swapBridgeCurrencyOnDestinationChain] = (isBridge &&
    hasBridgePair &&
    outputCurrency &&
    // swap -> bridge, return swapBridgeCurrencyOnOriginChain
    bridgePairs?.find(([_, dest]) => dest.equals(outputCurrency))) || [swapOriginOutputCurrency, undefined] || [
      // swap -> bridge -> swap, return array of swapOriginOutputCurrency[]
      undefined,
      undefined,
    ]

  const quoteResult = useSwapQuoteSync({
    amount,
    outputCurrency: swapBridgeCurrencyOnOriginChain || dependentCurrency,
    tradeType,
    paused,
    setNonce,
    nonce,
  })

  const swapOrders = quoteResult?.data

  function getBridgeInputAmount(swapOrders: (InterfaceOrder | undefined)[]) {
    const filteredSwapOrders = swapOrders.filter((x) => x)

    if (filteredSwapOrders.length === 0) {
      return amount
    }

    return filteredSwapOrders.map((x) =>
      CurrencyAmount.fromRawAmount(x!.trade.outputAmount.currency, x!.trade.outputAmount.quotient.toString()),
    )
  }

  // if bridge only, swapOrder will be undefined
  // if swap -> bridge, swapOrders it not an array
  // if swap -> bridge -> swap, swapOrders is an array
  const bridgeInputAmount =
    isBridge && swapOrders
      ? Array.isArray(swapOrders)
        ? getBridgeInputAmount(swapOrders)
        : swapOrders?.trade.outputAmount
      : amount

  const swapOrder = Array.isArray(quoteResult?.data) ? quoteResult?.data?.[0] : quoteResult?.data

  function getBridgeMetadataParams(
    swapBridgeOutputCurrency: Currency | Currency[] | null | undefined,
    bridgeInputAmount: CurrencyAmount<Currency> | CurrencyAmount<Currency>[] | undefined,
  ): BridgeMetadataParams[] {
    if (!bridgeInputAmount || !swapBridgeOutputCurrency) {
      return []
    }

    if (
      Array.isArray(swapBridgeOutputCurrency) &&
      Array.isArray(bridgeInputAmount) &&
      bridgeInputAmount.length === swapBridgeOutputCurrency.length
    ) {
      return bridgeInputAmount.map((x, i) => ({ inputAmount: x!, outputCurrency: swapBridgeOutputCurrency[i][1]! }))
    }

    // In normal case, either bridgeInputAmount and swapBridgeOutputCurrency is an array with the same lenght or one of them is not an array
    // In unexpected case, return empty array
    if (
      Array.isArray(bridgeInputAmount) ||
      Array.isArray(swapBridgeOutputCurrency) ||
      Array.isArray(swapBridgeCurrencyOnDestinationChain) ||
      !swapBridgeCurrencyOnDestinationChain
    ) {
      return []
    }

    return [{ inputAmount: bridgeInputAmount, outputCurrency: swapBridgeCurrencyOnDestinationChain }]
  }

  const {
    data: bridgeOrders,
    error: bridgeError,
    isLoading: bridgeLoading,
  } = useBridgeMetadata(getBridgeMetadataParams(swapBridgeCurrencyOnOriginChain, bridgeInputAmount))

  const bridgeOrder = first(bridgeOrders)

  const destinationQuoteResult = useSwapQuoteSync({
    amount: bridgeOrder?.trade?.outputAmount,
    outputCurrency: stateOutputCurrency,
    tradeType: TradeType.EXACT_INPUT,
    paused,
    addNonce: true,
    setNonce,
    nonce,
  })

  const destinationSwapOrder = Array.isArray(destinationQuoteResult?.data)
    ? destinationQuoteResult?.data?.[0]
    : destinationQuoteResult?.data

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
      if (swapOrder?.trade && quoteResult.placeholderHash && !quoteResult.loading) {
        setPlaceholder(quoteResult.placeholderHash, swapOrder)
      }

      if (paused) {
        return
      }

      setTrade({
        bestOrder: swapOrder,
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
