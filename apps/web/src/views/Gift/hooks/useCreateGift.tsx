import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { useQueryClient } from '@tanstack/react-query'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isUserRejected } from 'utils/sentry'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { PancakeGiftV1Abi } from '../abis/PancakeGiftV1Abi'
import { GIFT_PANCAKE_V1_ADDRESS, QUERY_KEY_GIFT_INFO } from '../constants'
import { CreateGiftParams } from '../types'
import { convertCodeHash } from '../utils/convertCodeHash'
import { generateCreateGiftParams } from '../utils/generateCreateGiftParams'
import { useReadGasPayment } from './useReadGasPayment'

export const useCreateGift = () => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const [error, setError] = useState<Error | null>(null)
  const { toastSuccess, toastError } = useToast()

  const { address: account } = useAccount()

  const { writeContractAsync, data: txHash, isPending } = useWriteContract()
  const queryClient = useQueryClient()

  // Get GAS_PAYMENT from contract
  const gasPayment = useReadGasPayment()

  const createGift = useCallback(
    async ({ tokenAmount, nativeAmount, code }: CreateGiftParams) => {
      if (!gasPayment) {
        setError(new Error('Gas payment not found'))
        return
      }

      const codeHash = convertCodeHash(code)

      if (!codeHash) {
        setError(new Error('Code is invalid'))
        return
      }

      // Calculate transaction value: nativeAmount + GAS_PAYMENT
      const gasPaymentBigInt = BigInt(gasPayment.toString())

      const { tokenAddress, tokenAmountBigInt, nativeAmountBigInt, transactionValue } = generateCreateGiftParams({
        tokenAmount,
        nativeAmount,
        gasPaymentBigInt,
      })

      writeContractAsync(
        {
          address: GIFT_PANCAKE_V1_ADDRESS,
          abi: PancakeGiftV1Abi,
          functionName: 'createGift',
          args: [codeHash, tokenAddress, tokenAmountBigInt, nativeAmountBigInt],
          value: transactionValue,
        },
        {
          onError: (error) => {
            if (isUserRejected(error)) {
              return
            }

            toastError(t('Create Gift Error'), error.message)

            setError(new Error('Failed to create gift'))
          },
        },
      )
    },
    [gasPayment, t, writeContractAsync, toastSuccess, queryClient, chainId, account],
  )

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrorConfirming,
    error: errorConfirming,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (isConfirmed && txHash) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GIFT_INFO, chainId, account] })
    }
  }, [isConfirmed, txHash])

  useEffect(() => {
    if (isErrorConfirming && errorConfirming && txHash) {
      const reason = errorConfirming?.message?.split('\n').find((line) => line.includes('Details'))

      toastError(t(`Create Gift Error ${reason}`), <ToastDescriptionWithTx bscTrace txHash={txHash} />)
    }
  }, [isErrorConfirming, errorConfirming, txHash])

  useEffect(() => {
    if (isConfirmed && txHash) {
      toastSuccess(t('Create Gift Successfully'), <ToastDescriptionWithTx bscTrace txHash={txHash} />)
    }
  }, [isConfirmed, txHash])

  return useMemo(
    () => ({
      isErrorConfirming,
      errorConfirming,
      createGift,
      isLoading: isPending || isConfirming,
      error,
      txHash,
      isConfirmed,
    }),
    [createGift, isPending, isConfirming, txHash, error, isConfirmed, isErrorConfirming, errorConfirming],
  )
}
