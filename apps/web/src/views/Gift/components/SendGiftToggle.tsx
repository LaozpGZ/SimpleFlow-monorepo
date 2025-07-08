import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Text, Toggle } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useContext } from 'react'
import { SendGiftContext } from '../providers/SendGiftProvider'
import { GasSponsor } from './GasSponsor'
import { CHAINS_WITH_GIFT_CLAIM } from '../constants'

export const SendGiftToggle = ({
  children,
  isNativeToken,
}: {
  isNativeToken: boolean
  children: (isSendGiftOn: boolean) => React.ReactNode
}) => {
  const { t } = useTranslation()
  const { isSendGift, setIsSendGift } = useContext(SendGiftContext)
  const { chainId } = useActiveChainId()

  const isSupportedChain = chainId && CHAINS_WITH_GIFT_CLAIM.includes(chainId)

  if (!isSupportedChain) {
    return children(false)
  }

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
      {children(isSendGift)}
      {isSendGift && !isNativeToken && <GasSponsor />}
    </>
  )
}
