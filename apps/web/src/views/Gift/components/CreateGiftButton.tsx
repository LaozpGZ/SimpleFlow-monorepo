import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Button } from '@pancakeswap/uikit'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useTranslation } from '@pancakeswap/localization'
import { useCallback, useState } from 'react'
import { GIFT_PANCAKE_V1_ADDRESS } from '../constants'

export const CreateGiftButton = ({
  isLoading,
  handleCreateGift,
  tokenAmount,
}: {
  isLoading: boolean
  handleCreateGift: () => void
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
}) => {
  const [isApproving, setIsApproving] = useState(false)
  const { t } = useTranslation()
  // check whether the user has approved the router on the tokens
  const {
    approvalState,
    approveCallback: approveGiftCallback,
    currentAllowance: currentAllowanceGift,
  } = useApproveCallback(tokenAmount, GIFT_PANCAKE_V1_ADDRESS)

  const needApprove =
    tokenAmount.currency.isToken &&
    approvalState !== ApprovalState.APPROVED &&
    currentAllowanceGift?.lessThan(tokenAmount)

  const onCreateGiftClick = useCallback(async () => {
    if (needApprove) {
      setIsApproving(true)
      await approveGiftCallback()
      setIsApproving(false)
    }

    handleCreateGift()
  }, [tokenAmount, approveGiftCallback, handleCreateGift])

  return (
    <Button disabled={isLoading || isApproving} onClick={onCreateGiftClick} width="100%">
      {isLoading ? t('Creating...') : isApproving ? t('Approving...') : t('Create gift')}
    </Button>
  )
}
