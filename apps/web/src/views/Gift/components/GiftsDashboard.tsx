import { useTranslation } from '@pancakeswap/localization'
import { Box, DeleteOutlineIcon, Flex, FlexGap, IconButton, Spinner, Tag, Text } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { ViewState } from 'components/WalletModalV2/type'
import { BalanceData } from 'hooks/useAddressBalance'
import { useContext } from 'react'
import { useGetGiftInfo } from '../hooks/useGetGiftInfo'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { GiftStatus } from '../types'

const getStatusVariant = (status: GiftStatus) => {
  switch (status) {
    case GiftStatus.PENDING:
      return 'warning'
    case GiftStatus.CLAIMED:
      return 'success'
    case GiftStatus.CANCELLED:
      return 'failure'
    case GiftStatus.EXPIRED:
      return 'textDisabled'
    case GiftStatus.REQUESTED_CLAIM:
      return 'warning'
    default:
      return 'primary'
  }
}

const getStatusText = (status: GiftStatus) => {
  switch (status) {
    case GiftStatus.PENDING:
      return 'Pending'
    case GiftStatus.CLAIMED:
      return 'Claimed'
    case GiftStatus.CANCELLED:
      return 'Cancelled'
    case GiftStatus.EXPIRED:
      return 'Expired'
    case GiftStatus.REQUESTED_CLAIM:
      return 'Requested'
    default:
      return status
  }
}

const getExpirationTime = (timestamp: string, status: GiftStatus) => {
  // Assuming gifts expire 7 days after creation for pending/cancelled
  // and shorter times for claimed/expired based on the UI
  const createdAt = new Date(timestamp)
  const now = new Date()

  let expirationDays: number
  switch (status) {
    case GiftStatus.PENDING:
    case GiftStatus.CANCELLED:
      expirationDays = 7
      break
    case GiftStatus.CLAIMED:
    case GiftStatus.EXPIRED:
      expirationDays = 4
      break
    default:
      expirationDays = 7
  }

  const expirationDate = new Date(createdAt.getTime() + expirationDays * 24 * 60 * 60 * 1000)
  const timeDiff = expirationDate.getTime() - now.getTime()
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

  return daysRemaining > 0 ? `${daysRemaining} days` : '0 days'
}

export const GiftsDashboard = ({
  assets,
  setViewState,
}: {
  assets: BalanceData[]
  setViewState: (viewState: ViewState) => void
}) => {
  const { data: giftInfo = [], isLoading, error } = useGetGiftInfo(assets)
  const { t } = useTranslation()
  const { setCodeHash } = useContext(CancelGiftContext)

  if (isLoading) {
    return (
      <Flex width="100%" py="24px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex width="100%" justifyContent="center" alignItems="center">
        <Text color="failure">Error loading gifts: {error.message}</Text>
      </Flex>
    )
  }

  if (giftInfo.length === 0) {
    return (
      <Flex width="100%" justifyContent="center" alignItems="center">
        <Text color="textSubtle">No gifts found</Text>
      </Flex>
    )
  }

  return (
    <>
      <Box mb="16px" padding="16px 0" maxHeight="280px" overflow="auto">
        {giftInfo.map((gift) => (
          <Box mb="16px" key={gift.codeHash}>
            <FlexGap gap="8px" alignItems="center" mb="8px">
              <Tag variant={getStatusVariant(gift.status)} scale="sm" outline>
                {getStatusText(gift.status)}
              </Tag>

              {gift.status === GiftStatus.PENDING && (
                <Text fontSize="12px" color="textSubtle">
                  Expires: {getExpirationTime(gift.timestamp, gift.status)}
                </Text>
              )}
            </FlexGap>

            <Flex alignItems="center" width="100%" justifyContent="space-between">
              <Flex>
                <CurrencyLogo showChainLogo currency={gift.tokenInfo} size="40px" />
                <Flex flexDirection="column" ml="8px">
                  <Text fontWeight="600" fontSize="14px" color="text">
                    {gift.nativeAmount.toSignificant(6)} {gift.tokenInfo.symbol}
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
        ))}
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
