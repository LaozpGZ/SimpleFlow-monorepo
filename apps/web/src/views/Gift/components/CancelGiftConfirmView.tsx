import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Flex, RowBetween, Spinner, Text } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { Card } from '@pancakeswap/widgets-internal'
import Divider from 'components/Divider'
import { SecondaryCard } from 'components/SecondaryCard'
import { useContext } from 'react'

import { useCancelGift } from '../hooks/useCancelGift'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import { GiftStatusTag } from './GiftStatusTag'

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
        {giftInfo.currencyAmount && giftInfo.currencyAmount.greaterThan(0) && (
          <CurrencyAmountGiftDisplay currencyAmount={giftInfo.currencyAmount} />
        )}

        {giftInfo.currencyAmount &&
          giftInfo.currencyAmount.greaterThan(0) &&
          giftInfo.nativeCurrencyAmount.greaterThan(0) && (
            <Divider thin style={{ margin: '0 -16px', width: 'calc(100% + 32px)' }} />
          )}

        {giftInfo.nativeCurrencyAmount.greaterThan(0) && (
          <CurrencyAmountGiftDisplay currencyAmount={giftInfo.nativeCurrencyAmount} />
        )}
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
            {formatTimestamp(new Date(giftInfo.expiryTimestamp).getTime(), {
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
