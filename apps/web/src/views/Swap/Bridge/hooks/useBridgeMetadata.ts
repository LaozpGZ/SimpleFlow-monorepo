import { parseBridgeQuoteResponse, ResponseType } from '@pancakeswap/price-api-sdk'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { useQuery } from '@tanstack/react-query'
import { UnsafeCurrency } from 'config/constants/types'
import { getMetadata, getTokenAddress } from '../api'

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
        throw new Error(metadata.reason)
      }

      console.log('metadata', metadata)

      const outputAmount = CurrencyAmount.fromRawAmount(outputCurrency!, metadata.minOutputAmount)

      return {
        bridgeFee: CurrencyAmount.fromRawAmount(inputAmount!.currency, metadata.bridgeFee),
        ...parseBridgeQuoteResponse(
          {
            messageType: ResponseType.MM_PRICE_RESPONSE,
            message: '',
          },
          {
            amountIn: inputAmount!,
            amountOut: outputAmount,
            tradeType: TradeType.EXACT_INPUT,
          },
        ),
      }
    },
    enabled: !!inputAmount && !!outputCurrency && inputAmount.greaterThan(0),
  })
}
