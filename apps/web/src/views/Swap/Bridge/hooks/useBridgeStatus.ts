import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { useMemo } from 'react'
import { getBridgeStatus } from '../api'
import { ActiveBridgeOrderMetadata, BridgeStatusData, BridgeStatusResponse } from '../types'

export const bridgeStatusQueryKey = (chainId?: number, txHash?: string) => ['bridge-status', chainId, txHash]

export const useBridgeStatus = (
  chainId?: number,
  txHash?: string,
  metadata?: ActiveBridgeOrderMetadata['metadata'],
) => {
  const queryResult = useQuery({
    queryKey: bridgeStatusQueryKey(chainId, txHash),
    queryFn: () => (chainId && txHash ? getBridgeStatus(chainId, txHash) : undefined),
    refetchInterval: 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!chainId && !!txHash,
    notifyOnChangeProps: ['data', 'isFetching'],
  })

  const data: BridgeStatusResponse | undefined = metadata
    ? {
        ...(metadata as BridgeStatusResponse),
        ...queryResult.data,
      }
    : queryResult.data

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

  const feesBreakdown = useMemo(() => {
    return {
      totalFeesUSD: data && data.data?.reduce((prev, curr) => prev + Number(curr.metadata.fee), 0),
    }
  }, [data])

  const bridgeStatusData: BridgeStatusData | undefined = useMemo(
    () =>
      data
        ? {
            ...data,
            minOutputAmount: metadata?.minOutputAmount || data?.minOutputAmount,
            inputCurrencyAmount,
            outputCurrencyAmount,
            feesBreakdown,
          }
        : undefined,
    [data, inputCurrencyAmount, outputCurrencyAmount],
  )

  return { data: bridgeStatusData, isLoading: queryResult.isFetching }
}
