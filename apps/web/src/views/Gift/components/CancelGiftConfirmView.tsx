import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, CheckmarkCircleIcon, Flex, FlexGap, Spinner } from '@pancakeswap/uikit'
import { Card } from '@pancakeswap/widgets-internal'
import Divider from 'components/Divider'
import { SecondaryCard } from 'components/SecondaryCard'
import { useContext } from 'react'

import { useCancelGift } from '../hooks/useCancelGift'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { GiftStatus } from '../types'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import { GiftInfoCreatedAt, GiftInfoExpireOn } from './GiftInfoDetail'
import { GiftStatusTag } from './GiftStatusTag'

export const CancelGiftConfirmView = () => {
  const { codeHash } = useContext(CancelGiftContext)
  const { t } = useTranslation()

  const { cancelGift, isLoading: isLoadingCancelGift, txHash, error } = useCancelGift()

  const { data: giftInfo, isLoading: isLoadingGiftInfo } = useGetGiftByCodeHash({ codeHash })

  // Check if cancel was successful (transaction completed and has hash)
  const isCancelSuccessful = !isLoadingCancelGift && !!txHash && !error

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
          <GiftStatusTag status={isCancelSuccessful ? GiftStatus.CANCELLED : giftInfo?.status} />
        </Box>

        <FlexGap flexDirection="column" gap="8px">
          <GiftInfoCreatedAt
            txnHash={giftInfo.createTransactionHash}
            chainId={giftInfo.nativeCurrencyAmount.currency.chainId}
          />

          <GiftInfoExpireOn expiryTimestamp={giftInfo.expiryTimestamp} />
        </FlexGap>
      </Card>

      {isCancelSuccessful ? (
        <Flex width="100%" py="8px" justifyContent="center" alignItems="center">
          <CheckmarkCircleIcon color="success" width="40px" />
        </Flex>
      ) : (
        <Button
          onClick={() => cancelGift({ codeHash })}
          variant="danger"
          width="100%"
          disabled={!codeHash || isLoadingCancelGift}
          isLoading={isLoadingCancelGift}
        >
          {isLoadingCancelGift ? t('Cancelling...') : t('Cancel')}
        </Button>
      )}
    </>
  )
}
