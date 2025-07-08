import { useTranslation } from '@pancakeswap/localization'
import { useContext } from 'react'
import { Card } from '@pancakeswap/widgets-internal'
import { Box, Button, Flex, RowBetween, Spinner, Text } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { SecondaryCard } from 'components/SecondaryCard'
import Divider from 'components/Divider'

import { useCancelGift } from '../hooks/useCancelGift'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { GiftStatusTag } from './GiftStatusTag'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'

export const CancelGiftConfirmView = () => {
  const { codeHash } = useContext(CancelGiftContext)
  const { t } = useTranslation()

  const { cancelGift, isLoading: isLoadingCancelGift } = useCancelGift()

  const { data: giftInfo, isLoading: isLoadingGiftInfo } = useGetGiftByCodeHash({ codeHash })

  if (!giftInfo || isLoadingGiftInfo) {
    return (
      <Flex width="100%" py="24px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }

  return (
    <>
      <SecondaryCard mb="16px">
        {giftInfo.tokenAmount.greaterThan(0) && <CurrencyAmountGiftDisplay currencyAmount={giftInfo.tokenAmount} />}

        {giftInfo.tokenAmount.greaterThan(0) && giftInfo.nativeAmount.greaterThan(0) && (
          <Divider thin style={{ margin: '0 -16px', width: 'calc(100% + 32px)' }} />
        )}

        {giftInfo.nativeAmount.greaterThan(0) && <CurrencyAmountGiftDisplay currencyAmount={giftInfo.nativeAmount} />}
      </SecondaryCard>
      <Card mb="16px">
        <Box mb="16px">
          <GiftStatusTag status={giftInfo?.status} />
        </Box>

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
      </Card>

      <Button
        onClick={() => cancelGift({ codeHash })}
        variant="danger"
        width="100%"
        disabled={!codeHash || isLoadingCancelGift}
        isLoading={isLoadingCancelGift}
      >
        {isLoadingCancelGift ? t('Cancelling...') : t('Cancel')}
      </Button>
    </>
  )
}
