import { useTranslation } from '@pancakeswap/localization'
import { useContext } from 'react'
import { BalanceData } from 'hooks/useAddressBalance'
import { Card, CurrencyLogo } from '@pancakeswap/widgets-internal'
import { Box, Button, Flex, RowBetween, Spinner, Text } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { SecondaryCard } from 'components/SecondaryCard'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

import { useCancelGift } from '../hooks/useCancelGift'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { GiftStatusTag } from './GiftStatusTag'

export const CancelGiftConfirmView = ({ assets }: { assets: BalanceData[] }) => {
  const { codeHash } = useContext(CancelGiftContext)
  const { t } = useTranslation()

  const { cancelGift, isLoading: isLoadingCancelGift } = useCancelGift()

  const { data: giftInfo, isLoading: isLoadingGiftInfo } = useGetGiftByCodeHash({ codeHash, assets })

  if (!giftInfo || isLoadingGiftInfo) {
    return (
      <Flex width="100%" py="24px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }

  const usdValue = parseFloat(giftInfo.nativeAmount.toSignificant(6)) * giftInfo.nativePrice

  return (
    <>
      <SecondaryCard mb="16px">
        <Flex>
          <CurrencyLogo showChainLogo currency={giftInfo.tokenInfo} size="40px" />
          <Flex flexDirection="column" ml="8px">
            <Text fontWeight="600" fontSize="14px" color="text">
              {giftInfo.nativeAmount.toSignificant(6)} {giftInfo.tokenInfo.symbol}
            </Text>
            <Text fontSize="12px" color="textSubtle">
              {formatDollarAmount(usdValue)}
            </Text>
          </Flex>
        </Flex>
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
