import { useTranslation } from '@pancakeswap/localization'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import useCatchTxError from 'hooks/useCatchTxError'
import { useIDOContract } from 'hooks/useContract'
import { useCallback } from 'react'

export const useIDODepositCallback = () => {
  const idoContract = useIDOContract()
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const deposit = useCallback(
    async (amount: CurrencyAmount<Currency>) => {
      if (!account || !idoContract) return
      const value = amount.currency.isNative ? amount.quotient : 0n
      const amountPool = amount.currency.isNative ? 0n : amount.quotient
      const receipt = await fetchWithCatchTxError(() =>
        idoContract.write.depositPool([amountPool], {
          account,
          chain: idoContract.chain,
          value,
        }),
      )
      if (receipt?.status) {
        toastSuccess(t('Deposit successful'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      }
    },
    [account, idoContract, fetchWithCatchTxError, toastSuccess, t],
  )

  return {
    deposit,
    isPending,
  }
}
