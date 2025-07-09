import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Card, CheckmarkCircleIcon, Flex, FlexGap, Spinner } from '@pancakeswap/uikit'
import Divider from 'components/Divider'
import { SecondaryCard } from 'components/SecondaryCard'
import { useContext } from 'react'

import { useCancelGift } from '../hooks/useCancelGift'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { GiftStatus } from '../types'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import { GiftInfoAddress, GiftInfoDescription, GiftInfoTimestamp, GiftInfoTxn } from './GiftInfoDetail'
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

  const showNote = giftInfo.status === GiftStatus.CANCELLED || giftInfo.status === GiftStatus.EXPIRED

  return (
    <>
      {!showNote ? null : giftInfo.status === GiftStatus.EXPIRED ? (
        <GiftInfoDescription
          text={t('Gift Expired, Tokens Returned!')}
          description={t(
            'The starter fee is not refundable, but the full gift amount and any added claim gas will be returned to your wallet.',
          )}
        />
      ) : (
        <GiftInfoDescription
          text={t('Gift Cancelled')}
          description={t(
            `You’ve cancelled this gift. The full amount, including the added gas fee, has been returned to your wallet.`,
          )}
        />
      )}
      {!showNote && (
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
      )}
      <Card mb="16px">
        <Box p="16px">
          {showNote && (
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
          )}
          <Box mb="16px">
            <GiftStatusTag status={isCancelSuccessful ? GiftStatus.CANCELLED : giftInfo?.status} />
          </Box>

          <FlexGap flexDirection="column" gap="8px">
            <GiftInfoTimestamp text={t('Created at:')} timestamp={giftInfo.timestamp} />

            {giftInfo.status === GiftStatus.CLAIMED && giftInfo.actionTransactionHash && (
              <>
                <GiftInfoTxn
                  text={t('Gift claimed:')}
                  txnHash={giftInfo.actionTransactionHash}
                  chainId={giftInfo.nativeCurrencyAmount.currency.chainId}
                />
                <GiftInfoAddress text={t('Claimed by:')} address={giftInfo.claimerAddress} />
              </>
            )}

            {giftInfo.status === GiftStatus.CANCELLED && giftInfo.actionTransactionHash && (
              <GiftInfoTxn
                text={t('Gift cancelled:')}
                txnHash={giftInfo.actionTransactionHash}
                chainId={giftInfo.nativeCurrencyAmount.currency.chainId}
              />
            )}

            {[GiftStatus.PENDING, GiftStatus.EXPIRED].includes(giftInfo.status) && (
              <GiftInfoTimestamp text={t('Expires on:')} timestamp={giftInfo.expiryTimestamp} />
            )}
          </FlexGap>
        </Box>
      </Card>

      {isCancelSuccessful ? (
        <Flex width="100%" py="8px" justifyContent="center" alignItems="center">
          <CheckmarkCircleIcon color="success" width="40px" />
        </Flex>
      ) : (
        giftInfo.status === GiftStatus.PENDING && (
          <Button
            onClick={() => cancelGift({ codeHash })}
            variant="danger"
            width="100%"
            disabled={!codeHash || isLoadingCancelGift}
            isLoading={isLoadingCancelGift}
          >
            {isLoadingCancelGift ? t('Cancelling...') : t('Cancel')}
          </Button>
        )
      )}
    </>
  )
}
