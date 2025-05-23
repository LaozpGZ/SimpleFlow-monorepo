import { Trans } from '@pancakeswap/localization'
import { TxMeta } from '@/hooks/toast/useTxStatus'

export const getTxMeta = ({ values = {} }: { values?: Record<string, unknown> }): TxMeta => {
  return {
    title: <Trans>Swap</Trans>,
    description: <Trans {...values}>Swap %amountA% %symbolA% for %amountB% %symbolB%.</Trans>,
    txHistoryTitle: <Trans>Swap</Trans>,
    txHistoryDesc: <Trans {...values}>Swap %amountA% %symbolA% for %amountB% %symbolB%.</Trans>,
    txValues: values
  }
}
