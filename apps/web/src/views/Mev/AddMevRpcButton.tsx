import { useTranslation } from '@pancakeswap/localization'
import { Button, CheckmarkCircleFillIcon, SwapLoading } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useTheme from 'hooks/useTheme'
import { useState } from 'react'
import { useAddMevRpc } from './hooks'

export const AddMevRpcButton: React.FC<{
  addedToWallet: boolean
  setAddedToWallet: (addedToWallet: boolean) => void
  onSuccess?: () => void
}> = ({ addedToWallet, setAddedToWallet, onSuccess }) => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()
  const { addMevRpc } = useAddMevRpc(
    () => {
      setAddedToWallet(true)
      onSuccess?.()
    },
    () => setIsLoading(true),
    () => setIsLoading(false),
  )

  if (!account) {
    return <ConnectWalletButton withIcon />
  }
  return (
    <Button
      width="100%"
      endIcon={
        isLoading ? (
          <SwapLoading />
        ) : addedToWallet ? (
          <CheckmarkCircleFillIcon color={theme.colors.background} />
        ) : undefined
      }
      variant={addedToWallet ? 'success' : undefined}
      isLoading={isLoading}
      onClick={addedToWallet && !isLoading ? undefined : addMevRpc}
    >
      {isLoading ? t('Adding to wallet') : addedToWallet ? t('Added to wallet') : t('Add to wallet')}
    </Button>
  )
}
