import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useMemo } from 'react'

import { useSubmitPermit2 } from 'hooks/usePermit2'
import { Address } from 'viem'
import { postBridgeCheckApproval } from '../api'

export const useBridgeCheckApproval = ({ currencyAmountIn }: { currencyAmountIn?: CurrencyAmount<Currency> }) => {
  const { account } = useAccountActiveChain()

  const isNativeCurrency = currencyAmountIn?.currency?.isNative

  const {
    data: approvalData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'bridge-check-approval',
      account,
      isNativeCurrency ? 'native' : currencyAmountIn?.currency?.wrapped.address,
      currencyAmountIn?.currency?.chainId,
      currencyAmountIn?.quotient.toString(),
    ],
    queryFn: async () => {
      if (!currencyAmountIn || !account) return Promise.resolve(undefined)

      if (isNativeCurrency) {
        return undefined
      }

      try {
        const response = await postBridgeCheckApproval({
          currencyAmountIn,
          recipient: account as Address,
        })

        return response
      } catch (err) {
        console.error('Bridge approval check error:', err)
        throw err
      }
    },
    enabled: !!currencyAmountIn && !!account,
    retry: 1,
    // If the query fails, return an error object
    throwOnError: false,
  })

  const isRequiredFromResponse = approvalData?.isApprovalRequired

  // NOTE: when approval response returns error, we should flag it as requiring approval to show the approval error
  // if native currency, no approval is needed
  const requiresApproval = isNativeCurrency
    ? false
    : typeof isRequiredFromResponse === 'boolean'
    ? isRequiredFromResponse
    : Boolean(approvalData?.error?.code || error)

  const permit2Details = useMemo(() => {
    if (!currencyAmountIn || !approvalData?.permit2Details) return undefined

    return {
      ...approvalData.permit2Details,
      amount: CurrencyAmount.fromRawAmount(
        currencyAmountIn?.currency.asToken,
        BigInt(approvalData.permit2Details?.amount ?? '0'),
      ),
    }
  }, [approvalData, currencyAmountIn])

  const { permit: signPermit2 } = useSubmitPermit2({
    currency: currencyAmountIn?.currency.asToken,
    spender: approvalData?.spender,
    permit2Details,
  })

  return useMemo(
    () => ({
      approvalData,
      requiresApproval,
      isLoading,
      refetch,
      signPermit2,
      error: error
        ? {
            code: '500',
            message: `Bridge approval check failed: ${error.message}`,
          }
        : undefined,
    }),
    [requiresApproval, isLoading, signPermit2, refetch, approvalData, error],
  )
}
