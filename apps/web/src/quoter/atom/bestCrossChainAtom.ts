import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType, SmartRouter } from '@pancakeswap/smart-router'
import { type Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { userSlippageAtomWithLocalStorage } from '@pancakeswap/utils/user/slippage'
import BigNumber from 'bignumber.js'
import { convertTokenToCurrency, mapWithoutUrls } from 'hooks/Tokens'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { BridgeTradeError, type QuoteQuery } from 'quoter/quoter.types'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { createQuoteQuery } from 'quoter/utils/createQuoteQuery'
import { combinedTokenMapFromActiveUrlsAtom } from 'state/lists/hooks'
import { Field } from 'state/swap/actions'
import { logGTMBridgeQuoteQueryEvent } from 'utils/customGTMEventTracking'
import { basisPointsToPercent } from 'utils/exchange'
import { type Route, getBridgeAvailableRoutes, getMetadata, getTokenAddress } from 'views/Swap/Bridge/api'
import { computeSlippageAdjustedAmounts } from 'views/Swap/V3Swap/utils/exchange'
import type { BridgeOrderWithCommands, InterfaceOrder } from 'views/Swap/utils'
import { atomWithLoadable } from './atomWithLoadable'
import { bestSameChainWithoutPlaceHolderAtom } from './bestSameChainAtom'
import { placeholderAtom } from './placeholderAtom'

// Define a type for our complete path
type SwapAndBridgeQuote = {
  originToken: Currency
  destinationToken: Currency
  swapOrder: InterfaceOrder
  bridgeQuote: BridgeOrderWithCommands
}

type CompletePath = SwapAndBridgeQuote & {
  finalSwapOrder: InterfaceOrder
  outputAmount: CurrencyAmount<Currency>
}

export const getAvailableBridgeRoutes = atomFamily(
  (option: QuoteQuery) => {
    return atomWithLoadable(async () => {
      // Early return if currencies or chainIds are not available
      if (!option.baseCurrency || !option.currency) {
        return []
      }

      // Check if this is a cross-chain request
      const isCrossChain = option.baseCurrency.chainId !== option.currency.chainId
      if (!isCrossChain) {
        return []
      }

      try {
        // Fetch available routes from the bridge API
        const routes = await getBridgeAvailableRoutes({
          originChainId: option.baseCurrency.chainId,
          destinationChainId: option.currency.chainId,
        })

        return routes || []
      } catch (error) {
        console.error('Failed to fetch bridge routes:', error)
        // TODO: return Loadable.Fail<Route[]>(error)
        return []
      }
    })
  },
  (a, b) => a?.baseCurrency?.chainId === b?.baseCurrency?.chainId && a?.currency?.chainId === b?.currency?.chainId,
)

export type BridgeMetadataParams = {
  inputAmount: CurrencyAmount<Currency>
  outputCurrency: Currency
  nonce?: number
  postBridgeSwapTrade?: SwapOrderWithSlippage
}

// Convert the function to an atom
export const getBridgeQuote = atomFamily(
  (params: BridgeMetadataParams) =>
    atomWithLoadable(async () => {
      const { inputAmount, outputCurrency } = params
      const metadata = await getMetadata({
        inputToken: getTokenAddress(inputAmount.currency),
        originChainId: inputAmount.currency.chainId,
        outputToken: getTokenAddress(outputCurrency),
        destinationChainId: outputCurrency.chainId,
        amount: inputAmount.quotient.toString(),
      })

      if (!metadata.supported) {
        throw new BridgeTradeError(metadata?.reason || metadata?.error?.message || 'Unknown error')
      }

      const outputAmount = CurrencyAmount.fromRawAmount(outputCurrency, metadata.bridgeTransactionData.outputAmount)

      /**
       * Note: 1% is represented as 1e16, 100% is 1e18, 50% is 5e17, etc. These values are in the same format that the contract understands.
       * Bridge fee and expectedFillTimeSec is used for diplay purpose only.
       */
      const bridgeFee = new BigNumber(inputAmount.quotient.toString())
        .times(metadata.bridgeTransactionData.totalRelayFee)
        .div(1e18)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()

      const bridgeTrade: BridgeOrderWithCommands = {
        bridgeTransactionData: metadata.bridgeTransactionData,
        bridgeFee: CurrencyAmount.fromRawAmount(inputAmount.currency, bridgeFee),
        expectedFillTimeSec: metadata.expectedFillTimeSec ? Number.parseInt(metadata.expectedFillTimeSec) : 0,
        type: OrderType.PCS_BRIDGE,
        trade: {
          inputAmount,
          outputAmount,
          routes: [
            {
              path: [inputAmount.currency, outputAmount.currency],
              inputAmount,
              outputAmount,
              type: RouteType.BRIDGE,
            },
          ],
          tradeType: TradeType.EXACT_INPUT,
        },
      }

      return {
        ...bridgeTrade,
        commands: [bridgeTrade],
      }
    }),
  // add Equality check for BridgeMetadataParams
  (a, b) =>
    a.inputAmount.quotient.toString() === b.inputAmount.quotient.toString() &&
    a.outputCurrency.wrapped.address === b.outputCurrency.wrapped.address &&
    a.nonce === b.nonce,
)

type SwapOrderWithSlippage = InterfaceOrder & { trade: InterfaceOrder['trade'] & { routes: Route[] } }

function constructSwapOrderRoutes({
  swapOrder,
  userSlippage,
}: {
  swapOrder: InterfaceOrder
  userSlippage: number
}): SwapOrderWithSlippage {
  if (!('routes' in swapOrder.trade)) {
    return swapOrder as SwapOrderWithSlippage
  }

  const swapOrderRoutes = swapOrder.trade.routes || []
  const userSlippagePct = basisPointsToPercent(userSlippage)

  const routes: Route[] = swapOrderRoutes.map((route) => {
    return {
      ...route,
      outputAmount: SmartRouter.minimumAmountOut(swapOrder.trade, userSlippagePct, route.outputAmount),
    }
  })

  return {
    ...swapOrder,
    trade: {
      ...swapOrder.trade,
      routes,
    },
  } as SwapOrderWithSlippage
}

export const bestCrossChainQuoteWithoutPlaceHolderAtom = atomFamily((option: QuoteQuery) => {
  return atom(async (get) => {
    const { xEnabledOnDestinationChain, ..._option } = option

    const isCrossChain =
      _option.baseCurrency && _option.currency && _option.baseCurrency?.chainId !== _option.currency?.chainId

    // handle cross chain quote
    if (isCrossChain && _option.amount && _option.currency) {
      const userSlippage = get(userSlippageAtomWithLocalStorage)

      // Catch all errors here
      try {
        // we don't support outputamount when cross chain
        // so amount is always base currency amount
        const baseCurrencyAmount = _option.amount
        const quoteCurrency = _option.currency

        const crossChainRoutesLoadable = get(getAvailableBridgeRoutes(_option))

        let crossChainRoutes: Route[] = []

        if (crossChainRoutesLoadable.isPending()) {
          return Loadable.Pending<InterfaceOrder>()
        }

        crossChainRoutes = crossChainRoutesLoadable.unwrapOr([]) || []

        if (crossChainRoutes.length === 0) {
          throw new BridgeTradeError('No available routes')
        }

        const isOriginTokenSupported = crossChainRoutes.find(
          (route) =>
            route.originChainId === baseCurrencyAmount.currency.chainId &&
            route.originToken === baseCurrencyAmount.currency.wrapped.address,
        )

        const isDestinationTokenSupported = crossChainRoutes.find(
          (route) =>
            route.destinationChainId === quoteCurrency.chainId &&
            route.destinationToken === quoteCurrency.wrapped.address,
        )

        // pass native token to bridge, server will convert to wrapped address for route check
        const isBridgeOnlyQuery =
          isOriginTokenSupported &&
          isDestinationTokenSupported &&
          isOriginTokenSupported?.originToken === isDestinationTokenSupported?.originToken

        // if origin/destination tokens is supported, then it's a bridge to swap quote
        const isBridgeToSwapQuery = isOriginTokenSupported
        const isSwapToBridgeQuery = !isOriginTokenSupported && isDestinationTokenSupported
        const isSwapToBridgeToSwapQuery = !isOriginTokenSupported && !isDestinationTokenSupported

        let quoteLoadable: Loadable<BridgeOrderWithCommands> | undefined

        // handle bridge only quote
        if (isBridgeOnlyQuery) {
          // Native tokens use wrapped addresses for route checks but 0x000..00 for actual submission
          // If usser select ETH -> WETH or WETH -> ETH,
          quoteLoadable = get(
            getBridgeQuote({
              inputAmount: baseCurrencyAmount,
              outputCurrency: quoteCurrency,
              nonce: _option.nonce,
            }),
          )
        } else if (isBridgeToSwapQuery) {
          // handle bridge -> swap quote
          const tokenMap = get(combinedTokenMapFromActiveUrlsAtom)

          const tokenMapWithoutUrls = mapWithoutUrls(tokenMap, quoteCurrency.chainId)

          // Find the corresponding token on the destination chain that the bridge will output
          const bridgeRoute = crossChainRoutes.find(
            (route) => route.originToken === baseCurrencyAmount.currency.wrapped.address,
          )

          // Find the bridged token from the token map
          // can safely use bridgeRoute!.destinationToken.toLowerCase() because we already checked if the bridge route is supported
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const bridgedTokenInfo = tokenMapWithoutUrls[bridgeRoute!.destinationToken]

          if (!bridgedTokenInfo) {
            throw new Error('Token not supported for bridge')
          }

          // Create the output currency for the bridge
          const bridgeDestinationCurrency = convertTokenToCurrency(bridgedTokenInfo)

          // Get the bridge quote
          const bridgeQuoteLoadable = get(
            getBridgeQuote({
              inputAmount: baseCurrencyAmount,
              outputCurrency: bridgeDestinationCurrency,
              nonce: _option.nonce,
            }),
          )

          if (bridgeQuoteLoadable.isPending()) {
            return Loadable.Pending<InterfaceOrder>()
          }

          if (bridgeQuoteLoadable.isFail()) {
            return Loadable.Fail<InterfaceOrder>(bridgeQuoteLoadable.error)
          }

          const bridgeQuote = bridgeQuoteLoadable.unwrapOr(undefined)

          if (!bridgeQuote) {
            throw new BridgeTradeError('No bridge quote')
          }

          // Create a modified option for the swap quote
          const swapOption: QuoteQuery = {
            ..._option,
            baseCurrency: bridgeQuote.trade.outputAmount.currency,
            amount: bridgeQuote.trade.outputAmount,
            xEnabled: xEnabledOnDestinationChain ?? false,
            hash: '',
            placeholderHash: '',
          }

          const quoteQuery = createQuoteQuery(swapOption)

          // Get the swap quote using the bridge output amount
          const swapOrderLoadable = get(bestSameChainWithoutPlaceHolderAtom(quoteQuery))

          if (swapOrderLoadable.isPending()) {
            return Loadable.Pending<InterfaceOrder>()
          }

          if (swapOrderLoadable.isFail()) {
            return Loadable.Fail<InterfaceOrder>(swapOrderLoadable.error)
          }

          const swapOrder = swapOrderLoadable.unwrapOr(undefined)

          if (swapOrder?.trade?.outputAmount?.greaterThan(0)) {
            swapOrder.trade.outputAmount =
              computeSlippageAdjustedAmounts(swapOrder, userSlippage)[Field.OUTPUT] || swapOrder.trade.outputAmount

            const swapOrderWithSlippage = constructSwapOrderRoutes({ swapOrder, userSlippage })

            // The final combined quote
            quoteLoadable = Loadable.Just({
              ...bridgeQuote,
              trade: {
                ...bridgeQuote.trade,
                outputAmount: swapOrder.trade.outputAmount,

                // Create a custom mixed route array by manually mapping routes to ensure type compatibility
                // the last swap route will add slippage adjusted amount
                routes: [
                  // Add bridge routes
                  ...(bridgeQuote.trade.routes || []),
                  // Add swap routes with appropriate type casting for compatibility
                  ...swapOrderWithSlippage.trade.routes,
                  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                ] as any, // Use type assertion as a last resort
              },
              commands: [bridgeQuote, swapOrderWithSlippage],
            })
          }
        } else if (isSwapToBridgeQuery) {
          // handle swap -> bridge quote
          const tokenMap = get(combinedTokenMapFromActiveUrlsAtom)
          const tokenMapWithoutUrls = mapWithoutUrls(tokenMap, baseCurrencyAmount.currency.chainId)

          // Find the supported bridge route for the destination token
          const bridgeRoute = crossChainRoutes.find((route) => route.destinationToken === quoteCurrency.wrapped.address)

          // Find the token on the origin chain that the bridge supports
          // can safely use bridgeRoute!.originToken.toLowerCase() because we already checked if the bridge route is supported
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const bridgeOriginTokenInfo = tokenMapWithoutUrls[bridgeRoute!.originToken]

          if (!bridgeOriginTokenInfo) {
            throw new Error('Could not find bridge origin token in token map')
          }

          // Create the origin currency for the bridge
          const bridgeOriginCurrency = convertTokenToCurrency(bridgeOriginTokenInfo)

          // Create a modified option for the swap quote
          const swapOption: QuoteQuery = {
            ..._option,
            currency: bridgeOriginCurrency,
            hash: '',
            placeholderHash: '',
          }

          const quoteQuery = createQuoteQuery(swapOption)

          // Get the swap quote from base currency to bridge origin currency
          const swapOrderLoadable = get(bestSameChainWithoutPlaceHolderAtom(quoteQuery))

          if (swapOrderLoadable.isPending()) {
            return Loadable.Pending<InterfaceOrder>()
          }

          if (swapOrderLoadable.isFail()) {
            return Loadable.Fail<InterfaceOrder>(swapOrderLoadable.error)
          }

          const swapOrder = swapOrderLoadable.unwrapOr(undefined)

          if (swapOrder?.trade?.outputAmount?.greaterThan(0)) {
            const slippagedOutputAmount =
              computeSlippageAdjustedAmounts(swapOrder, userSlippage)[Field.OUTPUT] || swapOrder.trade.outputAmount

            // Use the swap output amount as the bridge input amount
            const bridgeQuoteLoadable = get(
              getBridgeQuote({
                inputAmount: slippagedOutputAmount,
                outputCurrency: quoteCurrency,
                nonce: _option.nonce,
              }),
            )

            if (bridgeQuoteLoadable.isPending()) {
              return Loadable.Pending<InterfaceOrder>()
            }

            if (bridgeQuoteLoadable.isFail()) {
              return Loadable.Fail<InterfaceOrder>(bridgeQuoteLoadable.error)
            }

            const bridgeQuote = bridgeQuoteLoadable.unwrapOr(undefined)

            if (!bridgeQuote) {
              throw new BridgeTradeError('No bridge quote')
            }

            // NOTE: we don't apply slippage before bridge quote because it causes re-render of the atom
            swapOrder.trade.outputAmount = slippagedOutputAmount

            const swapOrderWithSlippage = constructSwapOrderRoutes({ swapOrder, userSlippage })

            // The final combined quote
            quoteLoadable = Loadable.Just({
              type: OrderType.PCS_BRIDGE,
              bridgeTransactionData: bridgeQuote.bridgeTransactionData,
              bridgeFee: bridgeQuote.bridgeFee,
              expectedFillTimeSec: bridgeQuote.expectedFillTimeSec,
              trade: {
                inputAmount: swapOrder.trade.inputAmount,
                outputAmount: bridgeQuote.trade.outputAmount,
                tradeType: TradeType.EXACT_INPUT,
                routes: [
                  // Add swap routes with appropriate type casting for compatibility
                  ...swapOrderWithSlippage.trade.routes,
                  // Add bridge routes
                  ...(bridgeQuote.trade.routes || []),
                  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                ] as any, // Use type assertion as a last resort
              },
              commands: [swapOrderWithSlippage, bridgeQuote],
            })
          }
        } else if (isSwapToBridgeToSwapQuery) {
          // handle swap -> bridge -> swap quote

          // 1. find swapOriginQuotes from baseCurrency -> crossChainRoutes[].originToken
          const tokenMap = get(combinedTokenMapFromActiveUrlsAtom)
          const originTokenMapWithoutUrls = mapWithoutUrls(tokenMap, baseCurrencyAmount.currency.chainId)
          const destinationTokenMapWithoutUrls = mapWithoutUrls(tokenMap, quoteCurrency.chainId)

          // Get all supported bridge origin tokens from the available routes
          const supportedOriginBridgeCurrencies: Currency[] = crossChainRoutes.reduce((uniqueTokens, route) => {
            const tokenInfo = originTokenMapWithoutUrls[route.originToken]
            if (!tokenInfo) return uniqueTokens

            const token = convertTokenToCurrency(tokenInfo)
            if (!token) return uniqueTokens

            if (!uniqueTokens.some((t) => t.wrapped.address === token.wrapped.address)) {
              uniqueTokens.push(token)
            }
            return uniqueTokens
          }, [] as Currency[])

          // 2. find swap quotes from base currency to supported origin tokens and get bridge quotes
          const swapAndBridgeQuotes = supportedOriginBridgeCurrencies.map((originBridgeCurrency) => {
            // Create a modified option for the swap quote to get from base currency to bridge origin token
            const swapOption: QuoteQuery = {
              ..._option,
              currency: originBridgeCurrency,
              hash: '',
              placeholderHash: '',
            }

            // Get the swap quote from base currency to origin token
            const quoteQuery = createQuoteQuery(swapOption)
            const swapOrderLoadable = get(bestSameChainWithoutPlaceHolderAtom(quoteQuery))

            if (swapOrderLoadable.isPending()) {
              return Loadable.Pending<SwapAndBridgeQuote>()
            }

            if (swapOrderLoadable.isFail()) {
              return Loadable.Fail<SwapAndBridgeQuote>(swapOrderLoadable.error)
            }

            const swapOrder = swapOrderLoadable.unwrapOr(undefined)
            if (!swapOrder?.trade.outputAmount.greaterThan(0)) {
              return Loadable.Nothing<SwapAndBridgeQuote>()
            }

            const slippagedOutputAmount =
              computeSlippageAdjustedAmounts(swapOrder, userSlippage)[Field.OUTPUT] || swapOrder.trade.outputAmount

            const originBridgeCurrencyAmount = slippagedOutputAmount

            const destinationBridgeTokenAddress = crossChainRoutes.find(
              (route) => route.originToken === originBridgeCurrency.wrapped.address,
            )?.destinationToken

            // safely use destinationBridgeTokenAddress! because we already checked if the bridge route is supported
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const destinationBridgeToken = destinationTokenMapWithoutUrls[destinationBridgeTokenAddress!]

            const destinationBridgeCurrency = convertTokenToCurrency(destinationBridgeToken)

            const bridgeQuoteLoadable = get(
              getBridgeQuote({
                // Using non-null assertion as we've checked this above
                inputAmount: originBridgeCurrencyAmount,
                outputCurrency: destinationBridgeCurrency,
                nonce: _option.nonce,
              }),
            )

            if (bridgeQuoteLoadable.isPending()) {
              return Loadable.Pending<SwapAndBridgeQuote>()
            }

            if (bridgeQuoteLoadable.isFail()) {
              return Loadable.Fail<SwapAndBridgeQuote>(bridgeQuoteLoadable.error)
            }

            const bridgeQuote = bridgeQuoteLoadable.unwrapOr(undefined)
            if (!bridgeQuote) {
              return Loadable.Nothing<SwapAndBridgeQuote>()
            }

            return Loadable.Just<SwapAndBridgeQuote>({
              originToken: originBridgeCurrency,
              destinationToken: destinationBridgeCurrency,
              // NOTE: not apply slippage output amount here because it causes re-render of the atom
              // so we apply it in the final step
              swapOrder,
              bridgeQuote,
            })
          })

          // Check if any quotes are pending
          if (swapAndBridgeQuotes.some((quote) => quote.isPending())) {
            return Loadable.Pending<InterfaceOrder>()
          }

          // Check if any quotes failed
          const failedQuote = swapAndBridgeQuotes.find((quote) => quote.isFail())
          if (failedQuote) {
            return Loadable.Fail<InterfaceOrder>(failedQuote.error)
          }

          // Filter out Nothing results and unwrap Just values
          const validSwapAndBridgeQuotes = swapAndBridgeQuotes
            .filter((quote) => !quote.isNothing())
            .map((quote) => quote.unwrapOr(undefined))
            .filter((quote): quote is SwapAndBridgeQuote => quote !== undefined)

          // 3. find swapDestinationQuotes from validSwapAndBridgeQuotes -> quoteCurrency
          const completePaths = validSwapAndBridgeQuotes.map((swapAndBridgeQuote) => {
            // Create a swap query from the bridge destination token to the quote currency
            const finalSwapOption: QuoteQuery = {
              ..._option,
              baseCurrency: swapAndBridgeQuote.bridgeQuote.trade.outputAmount.currency,
              amount: swapAndBridgeQuote.bridgeQuote.trade.outputAmount,
              hash: '',
              placeholderHash: '',
              xEnabled: xEnabledOnDestinationChain ?? false,
            }

            const quoteQuery = createQuoteQuery(finalSwapOption)

            // Get the swap quote from bridge destination to quote currency
            const finalSwapOrderLoadable = get(bestSameChainWithoutPlaceHolderAtom(quoteQuery))

            if (finalSwapOrderLoadable.isPending()) {
              return Loadable.Pending<CompletePath>()
            }

            if (finalSwapOrderLoadable.isFail()) {
              return Loadable.Fail<CompletePath>(finalSwapOrderLoadable.error)
            }

            const finalSwapOrder = finalSwapOrderLoadable.unwrapOr(undefined)
            if (!finalSwapOrder?.trade?.outputAmount?.greaterThan(0)) {
              return Loadable.Nothing<CompletePath>()
            }

            return Loadable.Just<CompletePath>({
              ...swapAndBridgeQuote,
              finalSwapOrder,
              outputAmount: finalSwapOrder.trade.outputAmount,
            })
          })

          // Check if any paths are pending
          if (completePaths.some((path) => path.isPending())) {
            return Loadable.Pending<InterfaceOrder>()
          }

          // Check if any paths failed
          const failedPath = completePaths.find((path) => path.isFail())
          if (failedPath) {
            return Loadable.Fail<InterfaceOrder>(failedPath.error)
          }

          // Filter out Nothing results and unwrap Just values
          const validCompletePaths = completePaths
            .filter((path) => !path.isNothing())
            .map((path) => path.unwrapOr(undefined))
            .filter((path): path is CompletePath => path !== undefined)

          // 4. pick the best quote from validCompletePaths based on output amount
          if (validCompletePaths.length > 0) {
            // Find the path with the highest output amount
            let bestPathWithoutPostbridgeCalldataFee = validCompletePaths[0]

            for (let i = 1; i < validCompletePaths.length; i++) {
              const currentPath = validCompletePaths[i]

              // Compare output amounts to find the best path
              if (currentPath.outputAmount.greaterThan(bestPathWithoutPostbridgeCalldataFee.outputAmount)) {
                bestPathWithoutPostbridgeCalldataFee = currentPath
              }
            }

            // 5. combine swap, bridge, and final swap quotes into a single quote
            const {
              swapOrder,
              bridgeQuote,
              finalSwapOrder: finalSwapOrderWithoutPostbridgeCalldataFee,
            } = bestPathWithoutPostbridgeCalldataFee

            // NOTE: need to apply slippate for swap order and final swap order
            // because we don't apply it in the previous steps
            swapOrder.trade.outputAmount =
              computeSlippageAdjustedAmounts(swapOrder, userSlippage)[Field.OUTPUT] || swapOrder.trade.outputAmount

            // 6. refetch bridge quote with postbridge calldata fee
            const bridgeQuoteWithPostbridgeCalldataFee = get(
              getBridgeQuote({
                inputAmount: swapOrder.trade.outputAmount,
                outputCurrency: bridgeQuote.trade.inputAmount.currency,
                nonce: _option.nonce,
                postBridgeSwapTrade: constructSwapOrderRoutes({
                  swapOrder: finalSwapOrderWithoutPostbridgeCalldataFee,
                  userSlippage,
                }),
              }),
            )

            if (bridgeQuoteWithPostbridgeCalldataFee.isPending()) {
              return Loadable.Pending<InterfaceOrder>()
            }

            const finalBridgeQuote = bridgeQuoteWithPostbridgeCalldataFee.unwrapOr(undefined)

            if (!finalBridgeQuote) {
              throw new BridgeTradeError('No bridge quote with postbridge calldata fee')
            }

            const finalSwapOption: QuoteQuery = {
              ..._option,
              baseCurrency: finalBridgeQuote.trade.outputAmount.currency,
              amount: finalBridgeQuote.trade.outputAmount,
              hash: '',
              placeholderHash: '',
            }

            const quoteQuery = createQuoteQuery(finalSwapOption)

            // 7. refetch swap quote with postbridge calldata fee
            const finalSwapOrderLoadable = get(bestSameChainWithoutPlaceHolderAtom(quoteQuery))

            if (finalSwapOrderLoadable.isPending()) {
              return Loadable.Pending<InterfaceOrder>()
            }

            const finalSwapOrder = finalSwapOrderLoadable.unwrapOr(undefined)

            if (!finalSwapOrder) {
              throw new BridgeTradeError('No final swap order')
            }

            const swapOrderWithSlippage = constructSwapOrderRoutes({ swapOrder, userSlippage })

            finalSwapOrder.trade.outputAmount =
              computeSlippageAdjustedAmounts(finalSwapOrder, userSlippage)[Field.OUTPUT] ||
              finalSwapOrder.trade.outputAmount

            const finalSwapOrderWithSlippage = constructSwapOrderRoutes({ swapOrder: finalSwapOrder, userSlippage })

            // Create the combined quote with proper type handling
            quoteLoadable = Loadable.Just({
              bridgeTransactionData: bridgeQuote.bridgeTransactionData,
              type: OrderType.PCS_BRIDGE,
              bridgeFee:
                'bridgeFee' in bridgeQuote
                  ? bridgeQuote.bridgeFee
                  : CurrencyAmount.fromRawAmount(swapOrder.trade.inputAmount.currency, '0'),
              expectedFillTimeSec: 'expectedFillTimeSec' in bridgeQuote ? bridgeQuote.expectedFillTimeSec : 0,
              trade: {
                inputAmount: swapOrder.trade.inputAmount,
                outputAmount: finalSwapOrder.trade.outputAmount,
                tradeType: TradeType.EXACT_INPUT,
                routes: [
                  // Add initial swap routes
                  ...swapOrderWithSlippage.trade.routes,
                  // Add bridge routes
                  ...bridgeQuote.trade.routes,
                  // Add final swap routes if they exist
                  ...finalSwapOrderWithSlippage.trade.routes,
                  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                ] as any, // Type assertion for routes compatibility
              },
              commands: [swapOrderWithSlippage, bridgeQuote, finalSwapOrderWithSlippage],
            })
          }
        }

        if (!quoteLoadable) {
          throw new BridgeTradeError('Unknown error in cross chain quote')
        }

        if (quoteLoadable?.isPending()) {
          return Loadable.Pending<InterfaceOrder>()
        }

        return quoteLoadable
      } catch (error: unknown) {
        console.error('Failed to get cross chain quote:', error)

        logGTMBridgeQuoteQueryEvent('fail', {
          originChainId: _option.baseCurrency?.chainId,
          destinationChainId: _option.currency?.chainId,
          originToken: _option.baseCurrency?.symbol,
          destinationToken: _option.currency?.symbol,
          amount: _option.amount?.toString(),
        })

        return Loadable.Fail<InterfaceOrder>(error as BridgeTradeError)
      }
    }

    return get(bestSameChainWithoutPlaceHolderAtom(_option))
  })
}, isEqualQuoteQuery)

export const bestCrossChainQuoteAtom = atomFamily((_option: QuoteQuery) => {
  return atom(async (get) => {
    const result = await get(bestCrossChainQuoteWithoutPlaceHolderAtom(_option))

    if (result.isPending()) {
      const placeHolder = get(placeholderAtom(_option.placeholderHash || ''))
      if (placeHolder) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        return Loadable.Just(placeHolder).setFlag('placeholder').setExtra('placeholderHash', _option.placeholderHash!)
      }
    }
    // eslint-disable-next-line no-console
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    console.info(`[ph]`, 'bestCrossChainQuoteAtom hash', _option.placeholderHash)

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return result.setExtra('placeholderHash', _option.placeholderHash!)
  })
}, isEqualQuoteQuery)
