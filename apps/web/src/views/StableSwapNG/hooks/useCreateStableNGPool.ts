import { useCallback, useMemo, useState } from 'react'
import { Currency } from '@pancakeswap/sdk'
import { useSendTransaction, useWalletClient } from 'wagmi'
import { useTransactionAdder } from 'state/transactions/hooks'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { calculateGasMargin } from 'utils'
import { getViemClients } from 'utils/viem'
import { isUserRejected } from 'utils/sentry'
import { getViemErrorMessage } from 'utils/errors'
import { useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import {
  StableSwapNGPoolFactory,
  STABLE_NG_POOL_FACTORY_ADDRESS,
  type CreateStableNGPoolOptions,
  type PoolPreset,
} from '../sdk'

interface CreateStableNGPoolParams extends Omit<CreateStableNGPoolOptions, 'tokenA' | 'tokenB'> {
  tokenA: Currency
  tokenB: Currency
  preset?: PoolPreset
}

export const useCreateStableNGPool = () => {
  const { t } = useTranslation()
  const { account, chainId } = useAccountActiveChain()
  const { data: signer } = useWalletClient()
  const { sendTransactionAsync } = useSendTransaction()
  const addTransaction = useTransactionAdder()
  const { toastError } = useToast()

  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()

  const createStableNGPool = useCallback(
    async ({ tokenA, tokenB, preset, ...options }: CreateStableNGPoolParams) => {
      if (!chainId || !signer || !account || !tokenA || !tokenB) {
        return undefined
      }

      try {
        setAttemptingTxn(true)
        setTxnErrorMessage(undefined)

        // Generate call parameters using the SDK
        const { calldata } = preset
          ? StableSwapNGPoolFactory.createPoolWithPresetCallParameters(tokenA, tokenB, preset)
          : StableSwapNGPoolFactory.createPoolCallParameters({
              tokenA,
              tokenB,
              ...options,
            })

        const txn = {
          data: calldata,
          to: STABLE_NG_POOL_FACTORY_ADDRESS,
          value: 0n,
          account,
        }

        // Estimate gas
        const estimatedGas = await getViemClients({ chainId })?.estimateGas(txn)
        if (!estimatedGas) {
          throw new Error('Failed to estimate gas')
        }

        // Send transaction
        const hash = await sendTransactionAsync({
          ...txn,
          gas: calculateGasMargin(estimatedGas),
        })

        // Add to transaction list
        addTransaction(
          { hash },
          {
            type: 'add-liquidity-v3',
            summary: `Create ${tokenA.symbol}-${tokenB.symbol} StableNG Pool`,
          },
        )

        setAttemptingTxn(false)

        return hash
      } catch (error) {
        console.error('Failed to create StableNG pool', error)
        setAttemptingTxn(false)

        if (!isUserRejected(error)) {
          const errorMessage = transactionErrorToUserReadableMessage(error, t)
          setTxnErrorMessage(errorMessage)
          toastError(t('Error'), getViemErrorMessage(error))
        }

        throw error
      }
    },
    [account, chainId, signer, sendTransactionAsync, addTransaction, t, toastError],
  )

  return useMemo(
    () => ({
      createStableNGPool,
      attemptingTxn,
      txnErrorMessage,
    }),
    [createStableNGPool, attemptingTxn, txnErrorMessage],
  )
}
