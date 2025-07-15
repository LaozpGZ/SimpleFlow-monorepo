import { useTranslation } from '@pancakeswap/localization'
import { Toggle } from '@pancakeswap/uikit'
import { DURABLE_NONCE_KEY, useAppStore } from '@/store/useAppStore'
import { setStorageItem } from '@/utils/localStorage'
import { SettingField } from './SettingField'

export function DurableNonceSettingField() {
  const { t } = useTranslation()
  const useDurableNonce = useAppStore((s) => s.useDurableNonce)
  const handleChange = () => {
    const newValue = !useDurableNonce
    useAppStore.setState(
      {
        useDurableNonce: newValue
      },
      false,
      { type: 'DurableNonceSettingField' } as any
    )
    setStorageItem(DURABLE_NONCE_KEY, newValue.toString())
  }
  return (
    <SettingField
      fieldName={t('Durable Nonce')}
      tooltip={
        <>
          {t('Durable Nonce allows transactions to be valid for extended periods without relying on recent blockhashes.')}
          <br />
          {t('This feature enables more reliable transaction submission, especially useful for scheduled or delayed transactions.')}
          <br />
          {t('Note: Creating a nonce account costs approximately 0.00144 SOL.')}
        </>
      }
      renderToggleButton={<Toggle scale="md" checked={useDurableNonce} onChange={handleChange} />}
    />
  )
}
