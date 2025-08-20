import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { SolanaDescriptionWithTx } from 'components/Toast'
import React, { useCallback, useState } from 'react'

/**
 * Solana-specific transaction error handling hook
 * Based on apps/web Solana swap implementation
 */
export default function useSolanaTxError() {
  const { t } = useTranslation()
  const { toastError, toastSuccess } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSolanaError = useCallback(
    (error: any) => {
      console.error('Solana transaction error:', error)

      // Provide user-friendly error messages for common Solana errors
      let errorMessage = t('Transaction failed')

      if (error?.message) {
        const message = error.message.toLowerCase()
        if (message.includes('insufficient funds') || message.includes('insufficient lamports')) {
          errorMessage = t('Insufficient balance to complete transaction')
        } else if (message.includes('blockhash not found')) {
          errorMessage = t('Network congestion. Please try again')
        } else if (message.includes('transaction was not confirmed')) {
          errorMessage = t('Transaction failed to confirm. Please try again')
        } else if (message.includes('user rejected') || message.includes('user denied')) {
          errorMessage = t('Transaction rejected by user')
        } else if (message.includes('invalid account data')) {
          errorMessage = t('Invalid account data. Please check recipient address')
        } else if (message.includes('program error')) {
          errorMessage = t('Program execution error. Please try again')
        } else if (message.includes('timeout')) {
          errorMessage = t('Transaction timeout. Please try again')
        } else {
          errorMessage = t('Send didn’t go through. Please try again.')
        }
      }

      toastError(t('Transaction Failed'), errorMessage)
    },
    [t, toastError],
  )

  const executeSolanaTransaction = useCallback(
    async (txCallback: () => Promise<{ hash: string; status?: number }>) => {
      let txResult: { hash: string; status?: number } | null = null

      try {
        setLoading(true)

        txResult = await txCallback()

        if (!txResult) {
          throw new Error('Transaction failed to execute')
        }

        // Show success toast with transaction hash

        toastSuccess(
          `${t('Transaction Submitted')}!`,
          React.createElement(
            SolanaDescriptionWithTx,
            { txHash: txResult.hash },
            t('Your transaction has been submitted to the network'),
          ),
        )

        return txResult
      } catch (error: any) {
        // Don't show error toast for user rejections
        if (
          !error.message?.toLowerCase().includes('user rejected') &&
          !error.message?.toLowerCase().includes('user denied')
        ) {
          handleSolanaError(error)
        }

        throw error
      } finally {
        setLoading(false)
      }
    },
    [t, toastSuccess, handleSolanaError],
  )

  return {
    loading,
    executeSolanaTransaction,
    handleSolanaError,
  }
}
