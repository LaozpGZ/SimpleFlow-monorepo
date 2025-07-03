import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Text, Toggle } from '@pancakeswap/uikit'
import { useContext } from 'react'
import { SendGiftContext } from '../providers/SendGiftProvider'

export const SendGiftToggle = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()
  const { isSendGift, setIsSendGift } = useContext(SendGiftContext)

  return (
    <>
      <FlexGap alignItems="center" justifyContent="space-between">
        <FlexGap alignItems="center" gap="8px" flexDirection="column">
          <Text fontSize="20px" fontWeight="bold">
            {t('Send as a gift')}
          </Text>
        </FlexGap>
        <Toggle
          id="toggle-show-testnet"
          checked={isSendGift}
          scale="md"
          onChange={() => {
            setIsSendGift(!isSendGift)
          }}
        />
      </FlexGap>
      {isSendGift ? null : children}
    </>
  )
}
