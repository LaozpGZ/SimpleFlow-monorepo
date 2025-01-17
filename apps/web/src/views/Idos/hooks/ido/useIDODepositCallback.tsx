import { useTranslation } from '@pancakeswap/localization'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import useCatchTxError from 'hooks/useCatchTxError'
import { useIDOContract } from 'hooks/useContract'
import { useCallback } from 'react'
import { isAddressEqual } from 'utils'
import { isUserRejected } from 'utils/sentry'
import { zeroAddress } from 'viem'
import { useIDOPoolInfo } from './useIDOPoolInfo'

export const useIDODepositCallback = () => {
  const idoContract = useIDOContract()
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()
  const { toastSuccess, toastWarning } = useToast()
  const { data: poolInfo } = useIDOPoolInfo()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError({ throwUserRejectError: true })

  const deposit = useCallback(
    async (pid: number, amount: CurrencyAmount<Currency>) => {
      if (!account || !idoContract || !pid) return

      const depositAddress = amount.currency.isNative ? zeroAddress : amount.currency.address

      if (!poolInfo?.[pid].poolToken || !isAddressEqual(poolInfo[pid].poolToken, depositAddress)) {
        console.error('Invalid pool token')
        return
      }

      const value = amount.currency.isNative ? amount.quotient : 0n
      const amountPool = amount.currency.isNative ? 0n : amount.quotient
      try {
        const receipt = await fetchWithCatchTxError(() =>
          idoContract.write.depositPool([amountPool, pid], {
            account,
            chain: idoContract.chain,
            value,
          }),
        )
        if (receipt?.status) {
          toastSuccess(t('Deposit successful'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
        }
      } catch (error) {
        if (isUserRejected(error)) {
          toastWarning(
            t('You canceled deposit'),
            t(`You didn't confirm %symbol% deposit in your wallet`, {
              symbol: amount.currency.symbol,
            }),
          )
        }
      }
    },
    [account, idoContract, poolInfo, fetchWithCatchTxError, toastSuccess, t, toastWarning],
  )

  return {
    deposit,
    isPending,
  }
}
