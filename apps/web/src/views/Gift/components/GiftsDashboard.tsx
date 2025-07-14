import { useTranslation } from '@pancakeswap/localization'
import {
  AutoRenewIcon,
  Box,
  Button,
  DeleteOutlineIcon,
  Flex,
  FlexGap,
  IconButton,
  Spinner,
  Text,
  Toggle,
} from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { SecondaryCard } from 'components/SecondaryCard'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { ViewState } from 'components/WalletModalV2/type'
import { formatDistanceToNow } from 'date-fns'
import { useContext, useState } from 'react'
import { useGetGiftInfo } from '../hooks/useGetGiftInfo'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { SendGiftContext } from '../providers/SendGiftProvider'
import { GiftStatus } from '../types'
import { isExpired } from '../utils/isExpired'
import { GiftStatusTag } from './GiftStatusTag'

export const GiftsDashboard = ({ setViewState }: { setViewState: (viewState: ViewState) => void }) => {
  const { data: giftInfo = [], isLoading, hasNextPage, handleLoadMore } = useGetGiftInfo()
  const { t } = useTranslation()
  const { setCodeHash } = useContext(CancelGiftContext)

  const { setIsSendGift } = useContext(SendGiftContext)

  const [unclaimedOnly, setUnclaimedOnly] = useState(false)

  if (isLoading && !giftInfo.length) {
    return (
      <Flex width="100%" py="24px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }

  return (
    <>
      <Box mb="16px" pb="16px" maxHeight="280px" overflow="auto">
        <SecondaryCard mb="16px">
          <Text fontSize="20px" fontWeight="bold" mb="8px">
            {t('My Gifts History')}
          </Text>
          <FlexGap alignItems="center" gap="16px">
            <Text fontSize="12px">{t('Show unclaimed only')}</Text>
            <Toggle
              id="toggle-show-testnet"
              checked={unclaimedOnly}
              scale="sm"
              onChange={() => {
                setUnclaimedOnly(!unclaimedOnly)
              }}
            />
          </FlexGap>
        </SecondaryCard>
        {giftInfo.length === 0 ? (
          <Flex width="100%" justifyContent="center" alignItems="center">
            <Text color="textSubtle">No gifts found</Text>
          </Flex>
        ) : (
          giftInfo.map((gift) => {
            const displayCurrency = gift.currencyAmount ?? gift.nativeCurrencyAmount
            // Check if the gift is expired (pending status but expiryTimestamp is in the past)
            const isGiftExpired = gift.status === GiftStatus.PENDING && isExpired(gift.expiryTimestamp)
            const displayStatus = isGiftExpired ? GiftStatus.EXPIRED : gift.status

            return (
              <Box
                mb="16px"
                key={gift.codeHash}
                onClick={() => {
                  setCodeHash(gift.codeHash)
                  setViewState(ViewState.GIFT_INFO_DETAIL)
                }}
              >
                <FlexGap gap="8px" alignItems="center" mb="8px">
                  <GiftStatusTag status={displayStatus} />

                  {
                    // if status is pending and expiryTimestamp is in the past, show expired
                    gift.status === GiftStatus.PENDING && !isGiftExpired && (
                      <Text fontSize="12px" color="textSubtle">
                        Expires: {formatDistanceToNow(new Date(gift.expiryTimestamp), { addSuffix: true })}
                      </Text>
                    )
                  }
                </FlexGap>

                <Flex alignItems="center" width="100%" justifyContent="space-between">
                  <Flex>
                    <CurrencyLogo showChainLogo currency={displayCurrency.currency.wrapped} size="40px" />
                    <Flex flexDirection="column" ml="8px">
                      <Text fontWeight="600" fontSize="14px" color="text">
                        {`${displayCurrency.toSignificant(6)} ${displayCurrency.currency.symbol}`}
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
                        setViewState(ViewState.GIFT_INFO_DETAIL)
                      }}
                    >
                      <DeleteOutlineIcon color="textSubtle" />
                    </IconButton>
                  )}
                </Flex>
              </Box>
            )
          })
        )}
        {giftInfo.length > 0 && (
          <Flex mt="16px" justifyContent="center">
            {hasNextPage && (
              <Button
                onClick={handleLoadMore}
                scale="sm"
                disabled={isLoading}
                endIcon={isLoading ? <AutoRenewIcon spin color="currentColor" /> : undefined}
              >
                {isLoading ? t('Loading') : t('Load more')}
              </Button>
            )}
          </Flex>
        )}
      </Box>

      <FlexGap gap="8px" width="100%">
        <ActionButton
          onClick={() => {
            setViewState(ViewState.SEND_ASSETS)
            setIsSendGift(true)
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
