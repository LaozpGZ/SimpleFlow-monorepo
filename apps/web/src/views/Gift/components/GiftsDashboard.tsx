import { useTranslation } from '@pancakeswap/localization'
import { Box, DeleteOutlineIcon, Flex, FlexGap, IconButton, Spinner, Text } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { ViewState } from 'components/WalletModalV2/type'
import { useContext } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useGetGiftInfo } from '../hooks/useGetGiftInfo'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { GiftStatus } from '../types'
import { GiftStatusTag } from './GiftStatusTag'

export const GiftsDashboard = ({ setViewState }: { setViewState: (viewState: ViewState) => void }) => {
  const { data: giftInfo = [], isLoading } = useGetGiftInfo()
  const { t } = useTranslation()
  const { setCodeHash } = useContext(CancelGiftContext)

  if (isLoading) {
    return (
      <Flex width="100%" py="24px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }

  return (
    <>
      <Box mb="16px" padding="16px 0" maxHeight="280px" overflow="auto">
        {giftInfo.length === 0 ? (
          <Flex width="100%" justifyContent="center" alignItems="center">
            <Text color="textSubtle">No gifts found</Text>
          </Flex>
        ) : (
          giftInfo.map((gift) => (
            <Box mb="16px" key={gift.codeHash}>
              <FlexGap gap="8px" alignItems="center" mb="8px">
                <GiftStatusTag status={gift.status} />

                {gift.status === GiftStatus.PENDING && (
                  <Text fontSize="12px" color="textSubtle">
                    Expires: {formatDistanceToNow(new Date(gift.expiryTimestamp), { addSuffix: true })}
                  </Text>
                )}
              </FlexGap>

              <Flex alignItems="center" width="100%" justifyContent="space-between">
                <Flex>
                  <CurrencyLogo showChainLogo currency={gift.tokenAmount.currency.wrapped} size="40px" />
                  <Flex flexDirection="column" ml="8px">
                    <Text fontWeight="600" fontSize="14px" color="text">
                      {gift.tokenAmount.greaterThan(0)
                        ? `${gift.tokenAmount.toSignificant(6)} ${gift.tokenAmount.currency.symbol}`
                        : `${gift.nativeAmount.toSignificant(6)} ${gift.nativeAmount.currency.symbol}`}
                    </Text>
                    <Text fontSize="12px" color="textSubtle">
                      {formatTimestamp(new Date(gift.timestamp).getTime(), {
                        precision: Precision.MINUTE,
                      })}
                    </Text>
                  </Flex>
                </Flex>
                {gift.status === GiftStatus.PENDING && (
                  <IconButton
                    variant="text"
                    onClick={() => {
                      setCodeHash(gift.codeHash)
                      setViewState(ViewState.CANCEL_GIFT_CONFIRM)
                    }}
                  >
                    <DeleteOutlineIcon color="textSubtle" />
                  </IconButton>
                )}
              </Flex>
            </Box>
          ))
        )}
      </Box>

      <FlexGap gap="8px" width="100%">
        <ActionButton
          onClick={() => {
            setViewState(ViewState.SEND_ASSETS)
          }}
          variant="tertiary"
        >
          {t('Create Gift')}
        </ActionButton>
        <ActionButton
          onClick={() => {
            setViewState(ViewState.CLAIM_GIFT)
          }}
          variant="tertiary"
        >
          {t('Claim Gift')}
        </ActionButton>
      </FlexGap>
    </>
  )
}
