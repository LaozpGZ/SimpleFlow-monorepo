import { Currency } from '@simpleflow/aptos-swap-sdk'
import { useSendTransaction } from '@simpleflow/awgmi'
import { useTranslation } from '@simpleflow/l10n'
import { IconButton, Loading, useToast, useTooltip, WalletRegisterIcon } from '@simpleflow/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from './Toast'

export function CoinRegisterButton({ currency }: { currency: Currency }) {
  const { t } = useTranslation()
  const { tooltip, tooltipVisible, targetRef } = useTooltip(t('Register coin to receive transfers'), {
    placement: 'auto',
    trigger: 'hover',
  })

  const { sendTransactionAsync, isPending } = useSendTransaction()
  const { fetchWithCatchTxError, loading } = useCatchTxError()
  const { toastSuccess } = useToast()

  return (
    <>
      <div ref={targetRef}>
        <IconButton
          variant="text"
          onClick={() => {
            fetchWithCatchTxError(() =>
              sendTransactionAsync({
                payload: {
                  typeArguments: [currency.address],
                  functionArguments: [],
                  function: `0x1::managed_coin::register`,
                },
              }),
            ).then(
              (rec) =>
                rec?.status && toastSuccess(t('Registered!'), <ToastDescriptionWithTx txHash={rec.transactionHash} />),
            )
          }}
          style={{ width: 'auto' }}
          scale="sm"
        >
          {!isPending && !loading ? <WalletRegisterIcon color="textSubtle" /> : <Loading width="16px" height="16px" />}
        </IconButton>
      </div>
      {tooltipVisible && tooltip}
    </>
  )
}
