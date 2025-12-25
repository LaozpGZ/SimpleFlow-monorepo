import { Toggle } from '@simpleflow/uikit'
import { TxVersion } from '@simpleflow/solana-core-sdk'
import { useTranslation } from '@simpleflow/l10n'
import { useAppStore } from '@/store/useAppStore'
import { SettingField } from './SettingField'

export function VersionedTransactionSettingField() {
  const { t } = useTranslation()
  const txVersion = useAppStore((s) => s.txVersion)
  const handleChange = () => {
    useAppStore.setState(
      {
        txVersion: txVersion === TxVersion.LEGACY ? TxVersion.V0 : TxVersion.LEGACY
      },
      false,
      { type: 'VersionedTransactionSettingField' } as any
    )
  }
  return (
    <SettingField
      fieldName={t('Versioned Transaction')}
      tooltip={t(
        'Versioned Tx is a significant upgrade that allows for additional functionality, including advanced swap routing. Before turning on Vers. Tx, ensure that your wallet is compatible.'
      )}
      renderToggleButton={<Toggle scale="md" checked={txVersion === TxVersion.V0} onChange={handleChange} />}
    />
  )
}
