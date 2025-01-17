import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import useCatchTxError from 'hooks/useCatchTxError'
import { useIDOContract } from 'hooks/useContract'
import { useCallback } from 'react'

export const useIDOClaimCallback = () => {
  const idoContract = useIDOContract()
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const claim = useCallback(
    async (pid: number) => {
      if (!account || !idoContract || (!pid && pid !== 0)) return
      const receipt = await fetchWithCatchTxError(() =>
        idoContract.write.harvestPool([pid], {
          account,
          chain: idoContract.chain,
        }),
      )
      if (receipt?.status) {
        toastSuccess(t('Claim successful'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      }
    },
    [account, idoContract, fetchWithCatchTxError, toastSuccess, t],
  )

  return { claim, isPending }
}
