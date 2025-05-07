import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import BigNumber from 'bignumber.js'
import { convertTokenToCurrency, mapWithoutUrls } from 'hooks/Tokens'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { BridgeTradeError, QuoteQuery } from 'quoter/quoter.types'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { combinedTokenMapFromActiveUrlsAtom } from 'state/lists/hooks'
import { logGTMBridgeQuoteQueryEvent } from 'utils/customGTMEventTracking'
import { getBridgeAvailableRoutes, getMetadata, getTokenAddress } from 'views/Swap/Bridge/api'
import { BridgeOrderWithCommands, InterfaceOrder } from 'views/Swap/utils'
import { errorLoadable, valueLoadable } from './atomWithLoadable'
import { bestQuoteAtom } from './bestQuoteAtom'

// Define a type for our complete path
type CompletePath = {
  originToken: Currency
  destinationToken: Currency
  swapOrder: BridgeOrderWithCommands
  bridgeQuote: BridgeOrderWithCommands
  finalSwapOrder: BridgeOrderWithCommands | null
  outputAmount: CurrencyAmount<Currency>
}

export const getAvailableBridgeRoutes = atomFamily((option: QuoteQuery) => {
  return atom(async () => {
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
      // QUESTION: should we log this error?
      console.error('Failed to fetch bridge routes:', error)
      return []
    }
  })
}, isEqualQuoteQuery)

export type BridgeMetadataParams = {
  inputAmount: CurrencyAmount<Currency>
  outputCurrency: Currency
}

// Convert the function to an atom
export const getBridgeQuote = atomFamily(
  (params: BridgeMetadataParams) =>
    atom(async () => {
      const { inputAmount, outputCurrency } = params
      const metadata = await getMetadata({
        inputToken: getTokenAddress(inputAmount.currency),
        originChainId: inputAmount.currency.chainId,
        outputToken: getTokenAddress(outputCurrency),
        destinationChainId: outputCurrency.chainId,
        amount: inputAmount.quotient.toString(),
      })

      if (!metadata.supported) {
        throw new BridgeTradeError(metadata.reason)
      }

      const outputAmount = CurrencyAmount.fromRawAmount(outputCurrency, metadata.minOutputAmount)

      /**
       * Note: 1% is represented as 1e16, 100% is 1e18, 50% is 5e17, etc. These values are in the same format that the contract understands.
       */
      const bridgeFee = new BigNumber(inputAmount.quotient.toString())
        .times(metadata.bridgeFee)
        .div(1e18)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()

      const bridgeTrade: BridgeOrderWithCommands = {
        bridgeFee: CurrencyAmount.fromRawAmount(inputAmount.currency, bridgeFee),
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
  (a, b) => a.inputAmount === b.inputAmount && a.outputCurrency === b.outputCurrency,
)

export const bestCrossChainQuoteAtom = atomFamily((_option: QuoteQuery) => {
  return atom(async (get) => {
    const isCrossChain =
      _option.baseCurrency && _option.currency && _option.baseCurrency?.chainId !== _option.currency?.chainId

    // handle cross chain quote
    if (isCrossChain && _option.amount && _option.currency) {
      // Catch all errors here
      try {
        // we don't support outputamount when cross chain
        // so amount is always base currency amount
        const baseCurrencyAmount = _option.amount
        const quoteCurrency = _option.currency

        const crossChainRoutes = await get(getAvailableBridgeRoutes(_option))

        const isOriginTokenSupported = crossChainRoutes.find(
          (route) => route.originToken === baseCurrencyAmount.currency.wrapped.address,
        )

        const isDestinationTokenSupported = crossChainRoutes.find(
          (route) => route.destinationToken === quoteCurrency.wrapped.address,
        )

        const isBridgeOnlyQuery = baseCurrencyAmount.currency.symbol === quoteCurrency.symbol && isOriginTokenSupported
        const isBridgeToSwapQuery = isOriginTokenSupported && !isDestinationTokenSupported
        const isSwapToBridgeQuery = !isOriginTokenSupported && isDestinationTokenSupported
        const isSwapToBridgeToSwapQuery = !isOriginTokenSupported && !isDestinationTokenSupported

        let quote: BridgeOrderWithCommands | undefined

        // handle bridge only quote
        if (isBridgeOnlyQuery) {
          // Native tokens use wrapped addresses for route checks but 0x000..00 for actual submission
          // If usser select ETH -> WETH or WETH -> ETH,
          quote = await get(
            getBridgeQuote({
              inputAmount: baseCurrencyAmount,
              outputCurrency: quoteCurrency,
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
          const bridgedTokenInfo = tokenMapWithoutUrls[bridgeRoute!.destinationToken]

          if (!bridgedTokenInfo) {
            throw new Error('Could not find bridged token in token map')
          }

          // Create the output currency for the bridge
          const bridgeDestinationCurrency = convertTokenToCurrency(bridgedTokenInfo)

          // Get the bridge quote
          const bridgeQuote = await get(
            getBridgeQuote({
              inputAmount: baseCurrencyAmount,
              outputCurrency: bridgeDestinationCurrency,
            }),
          )

          // Create a modified option for the swap quote
          const swapOption: QuoteQuery = {
            ..._option,
            baseCurrency: bridgeQuote.trade.outputAmount.currency,
            amount: bridgeQuote.trade.outputAmount,
            // NOTE: use suffix to avoid hash collision
            // if there is a better way, please fix
            hash: _option.hash ? `${_option.hash}-swap-bridge` : '',
            placeholderHash: _option.placeholderHash ? `${_option.placeholderHash}-swap-bridge` : undefined,
          }

          // Get the swap quote using the bridge output amount
          const swapOrder = await get(bestQuoteAtom(swapOption))

          if (swapOrder.data) {
            // The final combined quote
            quote = {
              ...bridgeQuote,
              trade: {
                ...bridgeQuote.trade,
                outputAmount: swapOrder.data.trade.outputAmount,
                // Create a custom mixed route array by manually mapping routes to ensure type compatibility
                routes: [
                  // Add bridge routes
                  ...(bridgeQuote.trade.routes || []),
                  // Add swap routes with appropriate type casting for compatibility
                  ...('routes' in swapOrder.data.trade
                    ? (swapOrder.data.trade.routes || []).map((route) => ({
                        ...route,
                        // Ensure the route has all required properties for type compatibility
                        type: route.type,
                        path: route.path,
                        inputAmount: route.inputAmount,
                        outputAmount: route.outputAmount,
                      }))
                    : []),
                ] as any, // Use type assertion as a last resort
              },
              commands: [bridgeQuote, swapOrder.data],
            }
          }
        } else if (isSwapToBridgeQuery) {
          // handle swap -> bridge quote
          const tokenMap = get(combinedTokenMapFromActiveUrlsAtom)
          const tokenMapWithoutUrls = mapWithoutUrls(tokenMap, baseCurrencyAmount.currency.chainId)

          // Find the supported bridge route for the destination token
          const bridgeRoute = crossChainRoutes.find((route) => route.destinationToken === quoteCurrency.wrapped.address)

          // Find the token on the origin chain that the bridge supports
          // can safely use bridgeRoute!.originToken.toLowerCase() because we already checked if the bridge route is supported
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
            // NOTE: use suffix to avoid hash collision
            hash: _option.hash ? `${_option.hash}-swap-bridge` : '',
            placeholderHash: _option.placeholderHash ? `${_option.placeholderHash}-swap-bridge` : undefined,
          }

          // Get the swap quote from base currency to bridge origin currency
          const swapOrder = await get(bestQuoteAtom(swapOption))

          if (swapOrder.data) {
            // Use the swap output amount as the bridge input amount
            const bridgeQuote = await get(
              getBridgeQuote({
                inputAmount: swapOrder.data.trade.outputAmount,
                outputCurrency: quoteCurrency,
              }),
            )

            // The final combined quote
            quote = {
              type: OrderType.PCS_BRIDGE,
              bridgeFee: bridgeQuote.bridgeFee,
              trade: {
                inputAmount: swapOrder.data.trade.inputAmount,
                outputAmount: bridgeQuote.trade.outputAmount,
                tradeType: TradeType.EXACT_INPUT,
                routes: [
                  // Add swap routes with appropriate type casting for compatibility
                  ...('routes' in swapOrder.data.trade
                    ? (swapOrder.data.trade.routes || []).map((route) => ({
                        ...route,
                        // Ensure the route has all required properties for type compatibility
                        type: route.type,
                        path: route.path,
                        inputAmount: route.inputAmount,
                        outputAmount: route.outputAmount,
                      }))
                    : []),
                  // Add bridge routes
                  ...(bridgeQuote.trade.routes || []),
                ] as any, // Use type assertion as a last resort
              },
              commands: [swapOrder.data, bridgeQuote],
            }
          }
        } else if (isSwapToBridgeToSwapQuery) {
          // handle swap -> bridge -> swap quote

          // 1. find swapOriginQuotes from baseCurrency -> crossChainRoutes[].originToken
          const tokenMap = get(combinedTokenMapFromActiveUrlsAtom)
          const originTokenMapWithoutUrls = mapWithoutUrls(tokenMap, baseCurrencyAmount.currency.chainId)
          const destinationTokenMapWithoutUrls = mapWithoutUrls(tokenMap, quoteCurrency.chainId)

          // Get all supported bridge origin tokens from the available routes
          const supportedOriginTokens: Currency[] = Array.from(
            new Set(
              crossChainRoutes
                .map((route) => {
                  const tokenInfo = originTokenMapWithoutUrls[route.originToken]
                  return tokenInfo ? convertTokenToCurrency(tokenInfo) : null
                })
                .filter((token): token is Currency => token !== null)
                .map((token) => token.wrapped.address),
            ),
          )
            .map((address) => {
              const tokenInfo = originTokenMapWithoutUrls[address]
              return tokenInfo ? convertTokenToCurrency(tokenInfo) : null
            })
            .filter((token): token is Currency => token !== null)

          // 2. find swap quotes from base currency to supported origin tokens and get bridge quotes
          const swapAndBridgePromises = supportedOriginTokens.map(async (originToken) => {
            try {
              // Create a modified option for the swap quote to get from base currency to bridge origin token
              const swapOption: QuoteQuery = {
                ..._option,
                currency: originToken,
                // NOTE: use suffix to avoid hash collision
                hash: _option.hash ? `${_option.hash}-swap-origin-${originToken.symbol}` : '',
                placeholderHash: _option.placeholderHash
                  ? `${_option.placeholderHash}-swap-origin-${originToken.symbol}`
                  : undefined,
              }

              // Get the swap quote from base currency to origin token
              const swapOrder = get(bestQuoteAtom(swapOption))

              if (!swapOrder.data || !swapOrder.data.trade.outputAmount) {
                return null
              }

              // Find bridge routes that have this origin token
              const bridgeRoutesForOrigin = crossChainRoutes.filter(
                (route) => route.originToken === originToken.wrapped.address,
              )

              // Get the supported destination tokens for this origin token
              const supportedDestinationTokens: Currency[] = bridgeRoutesForOrigin
                .map((route) => {
                  const tokenInfo = destinationTokenMapWithoutUrls[route.destinationToken]
                  return tokenInfo ? convertTokenToCurrency(tokenInfo) : null
                })
                .filter((token): token is Currency => token !== null)

              // For each destination token, get a bridge quote from origin token
              const bridgeQuotes = await Promise.all(
                supportedDestinationTokens.map(async (destinationToken) => {
                  try {
                    // We already checked that swapOrder.data and swapOrder.data.trade.outputAmount exist above
                    const bridgeQuote = await get(
                      getBridgeQuote({
                        // Using non-null assertion as we've checked this above
                        inputAmount: swapOrder.data!.trade.outputAmount,
                        outputCurrency: destinationToken,
                      }),
                    )

                    return {
                      originToken,
                      destinationToken,
                      swapOrder: swapOrder.data!,
                      bridgeQuote,
                    }
                  } catch (error) {
                    console.error(
                      `Failed to get bridge quote from ${originToken.symbol} to ${destinationToken.symbol}:`,
                      error,
                    )
                    return null
                  }
                }),
              )

              return bridgeQuotes.filter(Boolean)
            } catch (error) {
              console.error(`Failed to process origin token ${originToken.symbol}:`, error)
              return null
            }
          })

          // Resolve all promises and flatten the array
          const allSwapAndBridgeQuotes = (await Promise.all(swapAndBridgePromises))
            .filter(Boolean)
            .flat()
            .filter(Boolean)

          // 3. find swapDestinationQuotes from allSwapAndBridgeQuotes -> quoteCurrency
          const completePathPromises = allSwapAndBridgeQuotes
            .filter((quote): quote is NonNullable<typeof quote> => quote !== null)
            .map(async (swapAndBridgeQuote) => {
              try {
                // Skip if the bridge destination is already the quote currency
                if (swapAndBridgeQuote.destinationToken.wrapped.address === quoteCurrency.wrapped.address) {
                  // This is already a complete path (swap -> bridge -> no final swap needed)
                  return {
                    ...swapAndBridgeQuote,
                    finalSwapOrder: null,
                    outputAmount: swapAndBridgeQuote.bridgeQuote.trade.outputAmount,
                  }
                }

                // Create a swap query from the bridge destination token to the quote currency
                const finalSwapOption: QuoteQuery = {
                  ..._option,
                  baseCurrency: swapAndBridgeQuote.destinationToken,
                  amount: swapAndBridgeQuote.bridgeQuote.trade.outputAmount,
                  // NOTE: use suffix to avoid hash collision
                  hash: _option.hash
                    ? `${_option.hash}-destination-swap-${swapAndBridgeQuote.destinationToken.symbol}`
                    : '',
                  placeholderHash: _option.placeholderHash
                    ? `${_option.placeholderHash}-destination-swap-${swapAndBridgeQuote.destinationToken.symbol}`
                    : undefined,
                }

                // Get the swap quote from bridge destination to quote currency
                const finalSwapOrder = get(bestQuoteAtom(finalSwapOption))

                if (!finalSwapOrder.data) {
                  return null
                }

                // Return the complete path with all three components
                return {
                  ...swapAndBridgeQuote,
                  finalSwapOrder: finalSwapOrder.data,
                  outputAmount: finalSwapOrder.data.trade.outputAmount,
                }
              } catch (error) {
                console.error(
                  `Failed to get final swap quote for ${swapAndBridgeQuote.destinationToken.symbol} to ${quoteCurrency.symbol}:`,
                  error,
                )
                return null
              }
            })

          // Resolve all promises and filter out any null values
          const completePaths = (await Promise.all(completePathPromises)).filter(Boolean)

          // 4. pick the best quote from completePaths based on output amount
          if (completePaths.length > 0) {
            // Find the path with the highest output amount
            // We can assert the type because we know completePaths contains objects of this structure
            let bestPath = completePaths[0] as CompletePath

            for (let i = 1; i < completePaths.length; i++) {
              const currentPath = completePaths[i] as CompletePath

              // Compare output amounts to find the best path
              if (currentPath.outputAmount.greaterThan(bestPath.outputAmount)) {
                bestPath = currentPath
              }
            }

            // 5. combine swap, bridge, and final swap quotes into a single quote
            const { swapOrder, bridgeQuote, finalSwapOrder } = bestPath

            // Create the combined quote with proper type handling
            quote = {
              type: OrderType.PCS_BRIDGE,
              bridgeFee:
                'bridgeFee' in bridgeQuote
                  ? bridgeQuote.bridgeFee
                  : CurrencyAmount.fromRawAmount(swapOrder.trade.inputAmount.currency, '0'),
              trade: {
                inputAmount: swapOrder.trade.inputAmount,
                outputAmount: finalSwapOrder ? finalSwapOrder.trade.outputAmount : bridgeQuote.trade.outputAmount,
                tradeType: TradeType.EXACT_INPUT,
                routes: [
                  // Add initial swap routes
                  ...('routes' in swapOrder.trade
                    ? (swapOrder.trade.routes || []).map((route) => ({
                        ...route,
                        type: route.type,
                        path: route.path,
                        inputAmount: route.inputAmount,
                        outputAmount: route.outputAmount,
                      }))
                    : []),
                  // Add bridge routes
                  ...('routes' in bridgeQuote.trade ? bridgeQuote.trade.routes || [] : []),
                  // Add final swap routes if they exist
                  ...(finalSwapOrder && 'routes' in finalSwapOrder.trade
                    ? (finalSwapOrder.trade.routes || []).map((route) => ({
                        ...route,
                        type: route.type,
                        path: route.path,
                        inputAmount: route.inputAmount,
                        outputAmount: route.outputAmount,
                      }))
                    : []),
                ] as any, // Type assertion for routes compatibility
              },
              commands: [swapOrder, bridgeQuote, ...(finalSwapOrder ? [finalSwapOrder] : [])],
            }
          }
        }

        const result = valueLoadable<InterfaceOrder | undefined>(quote)

        return {
          ...result,
          hash: _option.hash,
          placeholderHash: _option.placeholderHash,
        }
      } catch (error) {
        console.error('Failed to get cross chain quote:', error)
        logGTMBridgeQuoteQueryEvent('fail', {
          originChainId: _option.baseCurrency?.chainId,
          destinationChainId: _option.currency?.chainId,
          originToken: _option.baseCurrency?.symbol,
          destinationToken: _option.currency?.symbol,
          amount: _option.amount?.toString(),
        })

        return {
          ...errorLoadable<InterfaceOrder | undefined>(error),
          // QUESTION: should we add hash and placeholderHash here?
          hash: _option.hash,
          placeholderHash: _option.placeholderHash,
          loading: false,
        }
      }
    }

    return get(bestQuoteAtom(_option))
  })
}, isEqualQuoteQuery)
