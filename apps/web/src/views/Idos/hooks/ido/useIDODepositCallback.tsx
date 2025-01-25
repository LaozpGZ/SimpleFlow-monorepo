import { useTranslation } from '@pancakeswap/localization'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import useCatchTxError from 'hooks/useCatchTxError'
import { useIDOContract } from 'hooks/useContract'
import { useCallback } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { isAddressEqual } from 'utils'
import { zeroAddress } from 'viem'
import { userRejectedError } from 'views/Swap/V3Swap/hooks/useSendSwapTransaction'
import { useW3WAccountSign } from '../w3w/useW3WAccountSign'
import { useIDOPoolInfo } from './useIDOPoolInfo'
import { useIDOUserInfo } from './useIDOUserInfo'

class W3WSignError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'W3WSignError'
  }
}

export const useIDODepositCallback = () => {
  const idoContract = useIDOContract()
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()
  const { toastSuccess, toastWarning } = useToast()
  const [, setLatestTxReceipt] = useLatestTxReceipt()
  const { data: poolInfo } = useIDOPoolInfo()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError({ throwUserRejectError: true })
  const { refetch } = useIDOUserInfo()
  const sign = useW3WAccountSign()

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
        const receipt = await fetchWithCatchTxError(async () => {
          const { signature, expireAt } = await sign()

          console.log('signature', signature)
          console.log('expireAt', expireAt)

          if (!signature || !expireAt) {
            throw new W3WSignError('Invalid signature or expiredAt')
          }

          return idoContract.write.depositPool([amountPool, pid, BigInt(expireAt), `0x${signature}`], {
            account,
            chain: idoContract.chain,
            value,
          })
        })
        if (receipt?.status) {
          setLatestTxReceipt(receipt)
          toastSuccess(t('Deposit successful'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
        }
      } catch (error) {
        if (userRejectedError(error)) {
          toastWarning(
            t('You canceled deposit'),
            t(`You didn't confirm %symbol% deposit in your wallet`, {
              symbol: amount.currency.symbol,
            }),
          )
        }
        console.error(error)
      } finally {
        onFinish?.()
        refetch()
      }
    },
    [
      account,
      idoContract,
      sign,
      poolInfo?.pool0Info?.poolToken,
      poolInfo?.pool1Info?.poolToken,
      fetchWithCatchTxError,
      setLatestTxReceipt,
      toastSuccess,
      t,
      toastWarning,
      refetch,
    ],
  )

  return {
    deposit,
    isPending,
  }
}
