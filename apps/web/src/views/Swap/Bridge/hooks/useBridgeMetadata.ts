import { BridgeOrder, OrderType } from '@pancakeswap/price-api-sdk'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { useQuery } from '@tanstack/react-query'
import first from 'lodash/first'
import { getMetadata, getTokenAddress } from '../api'

export class BridgeTradeError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'BridgeTradeError'
  }
}

export type BridgeMetadataParams = {
  inputAmount: CurrencyAmount<Currency>
  outputCurrency: Currency
}

export function useBridgeMetadata(params: BridgeMetadataParams[]) {
  const originChainId = first(params)?.inputAmount?.currency.chainId
  const destinationChainId = first(params)?.outputCurrency?.chainId

  return useQuery({
    queryKey: ['bridge-metadata', originChainId, destinationChainId],
    queryFn: async () => {
      if (!params?.length) {
        return undefined
      }

      async function exectureData({ inputAmount, outputCurrency }: BridgeMetadataParams): Promise<BridgeOrder> {
        const metadata = await getMetadata({
          inputToken: getTokenAddress(inputAmount.currency),
          originChainId: originChainId!,
          outputToken: getTokenAddress(outputCurrency),
          destinationChainId: destinationChainId!,
          amount: inputAmount.quotient.toString(),
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
      }

      return Promise.all(params.map(exectureData))
    },
    enabled: !!params?.length && originChainId !== destinationChainId,
  })
}
