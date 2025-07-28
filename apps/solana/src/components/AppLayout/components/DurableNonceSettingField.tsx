import { Flex, Input, InputGroup } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { Toggle } from '@pancakeswap/uikit'
import { PublicKey } from '@solana/web3.js'
import { KeyboardEvent, useState } from 'react'
import { setStorageItem } from '@/utils/localStorage'
import { colors } from '@/theme/cssVariables'
import { CUSTOM_NONCE_ACCOUNT_KEY, DURABLE_NONCE_KEY, useAppStore } from '@/store/useAppStore'
import { useEvent } from '@/hooks/useEvent'
import { SettingField } from './SettingField'

export function DurableNonceSettingField() {
  const { t } = useTranslation()
  const [useDurableNonce, customNonceAccount] = useAppStore((s) => [s.useDurableNonce, s.customNonceAccount])
  const [localNonceAccount, setLocalNonceAccount] = useState(customNonceAccount || '')

  const handleToggleChange = useEvent(() => {
    const newValue = !useDurableNonce
    useAppStore.setState(
      {
        useDurableNonce: newValue
      },
      false,
      { type: 'DurableNonceSettingField' } as any
    )
    setStorageItem(DURABLE_NONCE_KEY, newValue.toString())
  })

  const isValidSolanaAddress = (address: string): boolean => {
    if (!address.trim()) return true // will be auto-generated if empty
    try {
      const _ = new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  const handleNonceAccountChange = (value: string) => {
    setLocalNonceAccount(value)
  }

  const handleNonceAccountBlur = () => {
    if (isValidSolanaAddress(localNonceAccount)) {
      const trimmedValue = localNonceAccount.trim()
      useAppStore.setState(
        {
          customNonceAccount: trimmedValue || undefined
        },
        false,
        { type: 'DurableNonceSettingField.customNonceAccount' } as any
      )
      setStorageItem(CUSTOM_NONCE_ACCOUNT_KEY, trimmedValue)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleNonceAccountBlur()
    }
  }

  return (
    <SettingField
      fieldName={t('Durable Nonce')}
      isCollapseDefaultOpen={useDurableNonce}
      tooltip={
        <>
          {t('Durable Nonce allows transactions to be valid for extended periods without relying on recent blockhashes.')}
          <br />
          {t('This feature enables more reliable transaction submission, especially useful for scheduled or delayed transactions.')}
          <br />
          {t('Note: Creating a nonce account costs approximately 0.00144 SOL.')}
          <br />
          {t('You can provide a custom nonce account address, or leave it empty to auto-create one.')}
        </>
      }
      renderToggleButton={<Toggle scale="md" checked={useDurableNonce} onChange={handleToggleChange} />}
      renderWidgetContent={
        useDurableNonce ? (
          <Flex flexDirection="column" gap={2}>
            <InputGroup>
              <Input
                flexGrow={1}
                width="full"
                variant="filledDark"
                placeholder={t('Custom Nonce Account Address (optional)')}
                bg={colors.backgroundDark}
                rounded="full"
                py={1}
                px={3}
                isInvalid={!isValidSolanaAddress(localNonceAccount)}
                value={localNonceAccount}
                onChange={({ currentTarget: { value } }) => handleNonceAccountChange(value)}
                onBlur={handleNonceAccountBlur}
                onKeyDown={handleKeyDown}
              />
            </InputGroup>
          </Flex>
        ) : undefined
      }
    />
  )
}
