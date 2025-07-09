import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Input, Text } from '@pancakeswap/uikit'
import { ViewState } from 'components/WalletModalV2/type'
import { useMemo } from 'react'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { useClaimGiftContext } from '../providers/ClaimGiftProvider'
import { GiftStatus } from '../types'
import { convertCodeHash } from '../utils/convertCodeHash'

export const ClaimGiftView = ({ setViewState }: { setViewState: (viewState: ViewState) => void }) => {
  const { t } = useTranslation()
  const { code, setCode } = useClaimGiftContext()

  const codeHash = convertCodeHash(code)

  const { data: giftInfo, isLoading } = useGetGiftByCodeHash({ codeHash })

  const isValid = Boolean(giftInfo?.status === GiftStatus.PENDING)

  const buttonText = useMemo(() => {
    if (!code) {
      return t('Enter a gift code')
    }

    if (isLoading) {
      return t('Checking...')
    }

    return t('Next')
  }, [isLoading, code, t])

  return (
    <>
      <Text fontSize="14px" mb="8px" color="textSubtle">
        {t('If you have a gift code from a friend, enter it here to claim your gift token.')}
      </Text>
      <Box mb="16px">
        <Text fontWeight={600} mb="4px" fontSize="16px">
          {t('Claim Gift')}
        </Text>
        <Input
          id="claim-code"
          placeholder={t('Enter code')}
          scale="md"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
      </Box>
      {!isLoading && giftInfo && !isValid ? (
        <Text color="textSubtle" mb="4px" fontSize="12px" bold>
          {t('The gift code you entered is invalid or expired. Please reach out to the gift creator for a new one.')}
        </Text>
      ) : null}

      <Button width="100%" disabled={!isValid} onClick={() => setViewState(ViewState.CLAIM_GIFT_CONFIRM)}>
        {buttonText}
      </Button>
    </>
  )
}
