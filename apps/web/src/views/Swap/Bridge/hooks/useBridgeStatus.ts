import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { useMemo } from 'react'
import { getBridgeStatus } from '../api'
import { BridgeStatus, BridgeStatusData } from '../types'

export const useBridgeStatus = (chainId?: number, txHash?: string) => {
  const queryResult = useQuery({
    queryKey: ['bridge-status', chainId, txHash],
    queryFn: () => (chainId && txHash ? getBridgeStatus(chainId, txHash) : undefined),
    refetchInterval: 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!chainId && !!txHash,
    notifyOnChangeProps: ['data'],
    initialData: {
      status: BridgeStatus.PENDING,
    },
  })

  const data = queryResult.data

  const inputCurrency = useCurrencyByChainId(data?.inputToken, data?.originChainId)
  const outputCurrency = useCurrencyByChainId(data?.outputToken, data?.destinationChainId)

  const inputCurrencyAmount = useMemo(() => {
    if (!inputCurrency || !data || !data?.inputAmount) return undefined
    return CurrencyAmount.fromRawAmount(inputCurrency, data?.inputAmount)
  }, [inputCurrency, data?.inputAmount])

  const outputCurrencyAmount = useMemo(() => {
    if (!outputCurrency || !data || !data?.outputAmount) return undefined
    return CurrencyAmount.fromRawAmount(outputCurrency, data?.outputAmount)
  }, [outputCurrency, data?.outputAmount])

  const bridgeStatusData: BridgeStatusData | undefined = useMemo(
    () =>
      data
        ? {
            ...data,
            inputCurrencyAmount,
            outputCurrencyAmount,
          }
        : undefined,
    [data, inputCurrencyAmount, outputCurrencyAmount],
  )

  return bridgeStatusData
}
