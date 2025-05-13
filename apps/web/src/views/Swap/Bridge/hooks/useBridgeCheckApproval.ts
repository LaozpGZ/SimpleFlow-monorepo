import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useMemo } from 'react'

import { useSubmitPermit2 } from 'hooks/usePermit2'
import { getCurrencyAddress } from 'utils/getCurrencyAddress'
import { Address } from 'viem'
import { Permit2ResponseSchema, postBridgeCheckApproval, PostBridgeCheckApprovalResponse } from '../api'

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
        const permit2Details: Permit2ResponseSchema = {
          amount: '0',
          expiration: 0,
          nonce: 0,
        }

        return {
          approval: {
            isRequired: false,
            permit2Details,
            to: `0x0`,
            tokenAddress: getCurrencyAddress(currencyAmountIn.currency),
            walletAddress: account,
            // data?: `0x${string}`
          },
        } as PostBridgeCheckApprovalResponse
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

  const isRequiredFromResponse = approvalData?.approval?.isRequired

  // NOTE: when approval response returns error, we should flag it as requiring approval to show the approval error
  const requiresApproval =
    typeof isRequiredFromResponse === 'boolean' ? isRequiredFromResponse : Boolean(approvalData?.error?.code || error)

  const finalApprovalData = useMemo(() => {
    if (error) {
      return {
        error: {
          code: '500',
          message: `Bridge approval check failed: ${error.message}`,
        },
      }
    }

    return approvalData
  }, [approvalData, error])

  const permit2Details = useMemo(() => {
    if (!currencyAmountIn || !finalApprovalData?.approval?.permit2Details) return undefined

    return {
      ...finalApprovalData.approval.permit2Details,
      amount: CurrencyAmount.fromRawAmount(
        currencyAmountIn?.currency.asToken,
        BigInt(finalApprovalData.approval.permit2Details?.amount ?? '0'),
      ),
    }
  }, [finalApprovalData])

  const { permit: signPermit2, isPermitting: isBridgePermitting } = useSubmitPermit2({
    currency: currencyAmountIn?.currency.asToken,
    spender: approvalData?.approval?.to,
    permit2Details,
  })

  return useMemo(
    () => ({
      approvalData: finalApprovalData,
      requiresApproval,
      isLoading,
      refetch,
      signPermit2,
    }),
    [finalApprovalData, requiresApproval, isLoading, signPermit2, refetch],
  )
}
