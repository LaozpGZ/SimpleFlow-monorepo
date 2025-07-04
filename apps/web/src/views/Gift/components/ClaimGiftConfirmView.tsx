import { useTranslation } from '@pancakeswap/localization'
import { Box, ColumnCenter, Spinner, Text, useToast } from '@pancakeswap/uikit'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { BalanceData } from 'hooks/useAddressBalance'
import { useContext, useEffect } from 'react'
import { useClaimGift } from '../hooks/useClaimGift'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { ClaimGiftContext } from '../providers/ClaimGiftProvider'
import { GiftApiStatus } from '../types'
import { convertCodeHash } from '../utils/convertCodeHash'

export const ClaimGiftConfirmView = ({ assets }: { assets: BalanceData[] }) => {
  const { code, setCode } = useContext(ClaimGiftContext)
  const { t } = useTranslation()
  const { toastSuccess } = useToast()

  const { data: giftInfo, isLoading } = useGetGiftByCodeHash({
    codeHash: convertCodeHash(code),
    assets,
  })

  const {
    mutate: claimGift,
    isPending,
    isError,
    error,
    data: claimGiftData,
  } = useClaimGift({
    onSuccess: () => {
      toastSuccess(t('Claim Gift Successfully'))
    },
  })

  useEffect(() => {
    if (code && claimGiftData?.status === GiftApiStatus.SUCCESS) {
      // In case user click back button after claim gift, the code will be reset
      return () => setCode('')
    }

    return () => {}
  }, [claimGiftData?.status, code, setCode])

  const handleClaim = () => {
    if (code) {
      claimGift({ code })
    }
  }

  if (!giftInfo || isLoading) {
    return (
      <ColumnCenter>
        <Spinner />
      </ColumnCenter>
    )
  }

  return (
    <ColumnCenter>
      <TokenAmountSection tokenAmount={giftInfo.nativeAmount} price={giftInfo.nativePrice} />

      {isError && (
        <Box mb="16px" color="failure">
          {error?.message || t('Failed to claim gift')}
        </Box>
      )}
      {claimGiftData?.status === GiftApiStatus.SUCCESS ? (
        <Text>{t('Claimed')}</Text>
      ) : (
        <ActionButton onClick={handleClaim} variant="tertiary" disabled={!code || isPending} isLoading={isPending}>
          {t('Claim')}
        </ActionButton>
      )}
    </ColumnCenter>
  )
}
