import { OrderType } from '@pancakeswap/price-api-sdk'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { useQuery } from '@tanstack/react-query'
import { UnsafeCurrency } from 'config/constants/types'
import { getMetadata, getTokenAddress } from '../api'

export class BridgeTradeError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'BridgeTradeError'
  }
}

export function useBridgeMetadata({
  inputAmount,
  outputCurrency,
}: {
  inputAmount?: CurrencyAmount<Currency>
  outputCurrency?: UnsafeCurrency
}) {
  const inputToken = inputAmount ? getTokenAddress(inputAmount.currency) : undefined
  const originChainId = inputAmount?.currency.chainId
  const outputToken = outputCurrency ? getTokenAddress(outputCurrency) : undefined
  const destinationChainId = outputCurrency?.chainId
  const amount = inputAmount?.quotient.toString()

  return useQuery({
    queryKey: ['bridge-metadata', inputToken, originChainId, outputToken, destinationChainId, amount],
    queryFn: async () => {
      const metadata = await getMetadata({
        inputToken: inputToken!,
        originChainId: originChainId!,
        outputToken: outputToken!,
        destinationChainId: destinationChainId!,
        amount: amount!,
      })

      if (!metadata.supported) {
        throw new BridgeTradeError(metadata.reason)
      }

      const outputAmount = CurrencyAmount.fromRawAmount(outputCurrency!, metadata.minOutputAmount)

      return {
        bridgeFee: CurrencyAmount.fromRawAmount(inputAmount!.currency, metadata.bridgeFee),
        type: OrderType.PCS_BRIDGE,
        trade: {
          inputAmount,
          outputAmount,
          routes: [
            {
              path: [inputAmount!.currency, outputAmount.currency],
              inputAmount,
              outputAmount,
              type: RouteType.BRIDGE,
            },
          ],
          tradeType: TradeType.EXACT_INPUT,
        },
      }
    },
    enabled: !!inputAmount && !!outputCurrency && inputAmount.greaterThan(0) && originChainId !== destinationChainId,
  })
}
