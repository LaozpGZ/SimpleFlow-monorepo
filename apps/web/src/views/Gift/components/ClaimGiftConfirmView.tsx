import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  Card,
  CheckmarkCircleIcon,
  ColumnCenter,
  RowBetween,
  Spinner,
  Text,
  useToast,
} from '@pancakeswap/uikit'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { BalanceData } from 'hooks/useAddressBalance'
import { useEffect } from 'react'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { useClaimGift } from '../hooks/useClaimGift'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { useClaimGiftContext } from '../providers/ClaimGiftProvider'
import { GiftApiStatus } from '../types'
import { convertCodeHash } from '../utils/convertCodeHash'

export const ClaimGiftConfirmView = ({ assets }: { assets: BalanceData[] }) => {
  const { code, setCode } = useClaimGiftContext()
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

      <Card mb="16px" style={{ width: '100%' }}>
        <Box p="16px">
          <RowBetween>
            <Text color="textSubtle" small>
              {t('Expires on:')}
            </Text>
            <Text small>
              {formatTimestamp(new Date(giftInfo.timestamp).getTime(), {
                precision: Precision.MINUTE,
              })}
            </Text>
          </RowBetween>
        </Box>
      </Card>

      {claimGiftData?.status === GiftApiStatus.SUCCESS ? (
        <CheckmarkCircleIcon color="success" width="40px" />
      ) : (
        <Button onClick={handleClaim} width="100%" disabled={!code || isPending} isLoading={isPending}>
          {t('Claim')}
        </Button>
      )}
    </ColumnCenter>
  )
}
