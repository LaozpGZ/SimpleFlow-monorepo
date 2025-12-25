import { useTranslation } from '@simpleflow/l10n'
import { WETH9 } from '@simpleflow/sdk'
import { MaxUint256 } from '@simpleflow/swap-sdk-core'
import { useToast } from '@simpleflow/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useTokenContract } from 'hooks/useContract'
import { useCallback } from 'react'
import { Address } from 'viem'
import { useActiveChainId } from './useActiveChainId'

export const useApproveETH = (spender: string) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const { chainId } = useActiveChainId()

  const ethContract = useTokenContract(chainId ? WETH9[chainId].address : undefined)

  const onApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(ethContract, 'approve', [spender as Address, MaxUint256])
    })

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Please progress to the next step.')}
        </ToastDescriptionWithTx>,
      )
    }
  }, [spender, ethContract, t, callWithGasPrice, fetchWithCatchTxError, toastSuccess])

  return { isPending, onApprove }
}
