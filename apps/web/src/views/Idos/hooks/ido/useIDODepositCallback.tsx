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
import { useIDOUserInfo } from './useIDOUserInfo'

export const useIDODepositCallback = () => {
  const idoContract = useIDOContract()
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()
  const { toastSuccess, toastWarning } = useToast()
  const { data: poolInfo } = useIDOPoolInfo()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError({ throwUserRejectError: true })
  const { refetch } = useIDOUserInfo()

  const deposit = useCallback(
    async (pid: number, amount: CurrencyAmount<Currency>, onFinish?: () => void) => {
      if (!account || !idoContract || (!pid && pid !== 0)) return

      const depositAddress = amount.currency.isNative ? zeroAddress : amount.currency.address
      const poolToken = pid === 0 ? poolInfo?.pool0Info?.poolToken : poolInfo?.pool1Info?.poolToken

      if (!poolToken || !isAddressEqual(poolToken, depositAddress)) {
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
      } finally {
        onFinish?.()
        refetch()
      }
    },
    [account, idoContract, poolInfo, fetchWithCatchTxError, toastSuccess, t, toastWarning, refetch],
  )

  return {
    deposit,
    isPending,
  }
}
