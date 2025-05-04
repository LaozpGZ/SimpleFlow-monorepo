import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { convertTokenToCurrency, mapWithoutUrls } from 'hooks/Tokens'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { QuoteQuery } from 'quoter/quoter.types'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { combinedTokenMapFromActiveUrlsAtom } from 'state/lists/hooks'
import { getBridgeAvailableRoutes, getMetadata, getTokenAddress } from 'views/Swap/Bridge/api'
import { BridgeMetadataParams, BridgeTradeError } from 'views/Swap/Bridge/hooks/useBridgeMetadata'
import { BridgeOrderWithCommands } from 'views/Swap/utils'
import { bestQuoteAtom } from './bestQuoteAtom'

export const getAvailableBridgeRoutes = atomFamily((option: QuoteQuery) => {
  return atom(async (get) => {
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
      return []
    }
  })
})

// Convert the function to an atom
export const getBridgeQuote = atomFamily((params: BridgeMetadataParams) =>
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

    const bridgeTrade: BridgeOrderWithCommands = {
      bridgeFee: CurrencyAmount.fromRawAmount(inputAmount.currency, metadata.bridgeFee),
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
)

export const bestCrossChainQuoteAtom = atomFamily((_option: QuoteQuery) => {
  return atom(async (get) => {
    const isCrossChain =
      _option.baseCurrency && _option.currency && _option.baseCurrency?.chainId !== _option.currency?.chainId

    // handle cross chain quote
    if (isCrossChain && _option.amount && _option.currency) {
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

      const isBridgeOnlyQuery = baseCurrencyAmount.currency.symbol === quoteCurrency.symbol
      const isBridgeToSwapQuery = isOriginTokenSupported && !isDestinationTokenSupported
      const isSwapToBridgeQuery = !isOriginTokenSupported && isDestinationTokenSupported
      const isSwapToBridgeToSwapQuery = !isOriginTokenSupported && !isDestinationTokenSupported

      let quote: BridgeOrderWithCommands | undefined

      // handle bridge only quote
      if (isBridgeOnlyQuery && isOriginTokenSupported) {
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

        try {
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
          const swapOrder = get(bestQuoteAtom(swapOption))

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
        } catch (error) {
          console.error('Failed to get bridge -> swap quote:', error)
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

        try {
          // Create a modified option for the swap quote
          const swapOption: QuoteQuery = {
            ..._option,
            currency: bridgeOriginCurrency,
            // NOTE: use suffix to avoid hash collision
            hash: _option.hash ? `${_option.hash}-swap-bridge` : '',
            placeholderHash: _option.placeholderHash ? `${_option.placeholderHash}-swap-bridge` : undefined,
          }

          // Get the swap quote from base currency to bridge origin currency
          const swapOrder = get(bestQuoteAtom(swapOption))

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
        } catch (error) {
          console.error('Failed to get swap -> bridge quote:', error)
        }
      } else if (isSwapToBridgeToSwapQuery) {
        // handle swap -> bridge -> swap quote
        console.log('swap -> bridge -> swap')
        // find swapOriginQuotes from baseCurrency -> crossChainRoutes[].originToken
        // find bridgeQuotes from swapOriginQuotes.originTokenAmount ->  crossChainRoutes[].destinationTokenOutAmount
        // dinf swapDestinationQuotes from crossChainRoutes[].destinationTokenOutAmount -> quoteCurrency
        // build graph from swapOriginQuotes, bridgeQuotes, swapDestinationQuotes
        // find the best quote from the graph
        // merge swapOriginQuotes, bridgeQuotes, swapDestinationQuotes
      }

      if (quote) {
        return {
          data: quote,
          hash: _option.hash,
          placeholderHash: _option.placeholderHash,
          loading: false,
        }
      }
    }

    return get(bestQuoteAtom(_option))
  })
}, isEqualQuoteQuery)
