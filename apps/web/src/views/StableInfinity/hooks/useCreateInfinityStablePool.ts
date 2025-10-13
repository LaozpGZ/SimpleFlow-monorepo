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
import { InfinityStablePoolFactory, type CreateInfinityStablePoolOptions, type PoolPreset, TokenType } from '../sdk'

interface CreateInfinityStablePoolParams extends Omit<CreateInfinityStablePoolOptions, 'tokenA' | 'tokenB'> {
  tokenA: Currency
  tokenB: Currency
  preset?: PoolPreset
  /**
   * Asset types for each token
   * [0, 0] = Standard tokens (no oracle)
   * [1, 1] = Oracle-based tokens
   * [0, 1] = Mixed (tokenA standard, tokenB oracle)
   */
  assetTypes: readonly [number, number]
}

export const useCreateInfinityStablePool = () => {
  const { t } = useTranslation()
  const { account, chainId } = useAccountActiveChain()
  const { data: signer } = useWalletClient()
  const { sendTransactionAsync } = useSendTransaction()
  const addTransaction = useTransactionAdder()
  const { toastError } = useToast()

  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()

  const createInfinityStablePool = useCallback(
    async ({ tokenA, tokenB, preset, assetTypes, ...options }: CreateInfinityStablePoolParams) => {
      if (!chainId || !signer || !account || !tokenA || !tokenB) {
        return undefined
      }

      // Validate assetTypes
      if (!assetTypes || assetTypes.length !== 2) {
        throw new Error('assetTypes must be provided as [number, number]')
      }

      try {
        setAttemptingTxn(true)
        setTxnErrorMessage(undefined)

        // Generate call parameters using the SDK
        // When preset is provided, merge it with custom options (custom options override preset)
        const { calldata } = preset
          ? InfinityStablePoolFactory.createPoolCallParameters({
              tokenA,
              tokenB,
              ...InfinityStablePoolFactory.getPresetConfig(preset),
              assetTypes,
              ...options, // Override preset values with custom options
            })
          : InfinityStablePoolFactory.createPoolCallParameters({
              tokenA,
              tokenB,
              assetTypes,
              ...options,
            })

        const factoryAddress = InfinityStablePoolFactory.getFactoryAddress(chainId)

        const txn = {
          data: calldata,
          to: factoryAddress,
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

        // Add transaction to tracking
        addTransaction(
          { hash },
          {
            summary: `Create ${tokenA.symbol}-${tokenB.symbol} InfinityStable Pool`,
          },
        )

        setAttemptingTxn(false)

        return hash
      } catch (error) {
        console.error('Failed to create InfinityStable pool', error)
        setAttemptingTxn(false)

        if (!isUserRejected(error)) {
          const errorMessage = transactionErrorToUserReadableMessage(error, t)
          setTxnErrorMessage(errorMessage)
          toastError(t('Error'), getViemErrorMessage(error))
        }

        throw error
      }
    },
    [account, chainId, signer, sendTransactionAsync, t, toastError],
  )

  return useMemo(
    () => ({
      createInfinityStablePool,
      attemptingTxn,
      txnErrorMessage,
    }),
    [createInfinityStablePool, attemptingTxn, txnErrorMessage],
  )
}
