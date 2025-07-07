import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { PancakeGiftV1Abi } from '../abis/PancakeGiftV1Abi'
import { GIFT_PANCAKE_V1_ADDRESS, QUERY_KEY_GIFT_INFO } from '../constants'
import { convertCodeHash } from '../utils/convertCodeHash'

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
  const { data: gasPayment } = useReadContract({
    address: GIFT_PANCAKE_V1_ADDRESS,
    abi: PancakeGiftV1Abi,
    functionName: 'GAS_PAYMENT',
    chainId,
  })

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

      // const isOnlyNative = tokenAmount?.currency.isNative && !nativeAmount
      const tokenAddress = tokenAmount.currency.isNative ? zeroAddress : tokenAmount.currency.address
      const tokenAmountBigInt = tokenAmount.currency.isNative ? 0n : tokenAmount.quotient
      const nativeAmountBigInt = tokenAmount.currency.isNative ? tokenAmount.quotient : nativeAmount?.quotient ?? 0n

      const transactionValue = nativeAmountBigInt + gasPaymentBigInt

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
    [gasPayment, t, writeContractAsync, toastSuccess],
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
