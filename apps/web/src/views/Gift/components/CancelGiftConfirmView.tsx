import { useTranslation } from '@pancakeswap/localization'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { useContext } from 'react'
import { useCancelGift } from '../hooks/useCancelGift'
import { CancelGiftContext } from '../providers/CancelGiftProvider'

export const CancelGiftConfirmView = () => {
  const { codeHash } = useContext(CancelGiftContext)
  const { t } = useTranslation()

  const { cancelGift, isLoading } = useCancelGift()

  return (
    <>
      <div>{codeHash}</div>
      <ActionButton
        onClick={() => cancelGift({ codeHash })}
        variant="danger"
        disabled={!codeHash || isLoading}
        isLoading={isLoading}
      >
        {t('Cancel')}
      </ActionButton>
    </>
  )
}
