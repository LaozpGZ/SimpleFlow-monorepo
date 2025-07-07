import { useTranslation } from '@pancakeswap/localization'
import { Box, Input, Text } from '@pancakeswap/uikit'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { ViewState } from 'components/WalletModalV2/type'
import { BalanceData } from 'hooks/useAddressBalance'
import { useMemo } from 'react'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { useClaimGiftContext } from '../providers/ClaimGiftProvider'
import { GiftStatus } from '../types'
import { convertCodeHash } from '../utils/convertCodeHash'

export const ClaimGiftView = ({
  setViewState,
  assets,
}: {
  setViewState: (viewState: ViewState) => void
  assets: BalanceData[]
}) => {
  const { t } = useTranslation()
  const { code, setCode } = useClaimGiftContext()

  const codeHash = convertCodeHash(code)

  const { data: giftInfo, isLoading } = useGetGiftByCodeHash({ codeHash, assets })

  const isInValid = Boolean(code && (!giftInfo || (giftInfo?.status && giftInfo.status !== GiftStatus.PENDING)))

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
      <Box mb="16px">
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
      {!isLoading && isInValid ? (
        <Text color="textSubtle" mb="4px" fontSize="12px" bold>
          {t('The gift code you entered is invalid or expired. Please reach out to the gift creator for a new one.')}
        </Text>
      ) : null}

      <ActionButton
        disabled={!code || isLoading || isInValid}
        onClick={() => setViewState(ViewState.CLAIM_GIFT_CONFIRM)}
        variant="tertiary"
      >
        {buttonText}
      </ActionButton>
    </>
  )
}
