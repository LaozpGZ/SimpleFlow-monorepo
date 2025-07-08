import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useWriteContract } from 'wagmi'
import { PancakeGiftV1Abi } from '../abis/PancakeGiftV1Abi'
import { GIFT_PANCAKE_V1_ADDRESS, QUERY_KEY_GIFT_INFO } from '../constants'
import { convertCodeHash } from '../utils/convertCodeHash'
import { useReadGasPayment } from './useReadGasPayment'
import { generateCreateGiftParams } from '../utils/generateCreateGiftParams'

interface CreateGiftParams {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  code: string
  nativeAmount?: CurrencyAmount<NativeCurrency>
}

export const useCreateGift = () => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const [error, setError] = useState<Error | null>(null)
  const { toastSuccess } = useToast()

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
          onSuccess: (transactionHash) => {
            if (transactionHash) {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GIFT_INFO, chainId, account] })

              toastSuccess(t('Create Gift Successfully'), <ToastDescriptionWithTx bscTrace txHash={transactionHash} />)
            }
          },
        },
      )
    },
    [gasPayment, t, writeContractAsync, toastSuccess, queryClient, chainId, account],
  )

  return useMemo(
    () => ({
      createGift,
      isLoading: isPending,
      error,
      txHash,
    }),
    [createGift, isPending, txHash, error],
  )
}
