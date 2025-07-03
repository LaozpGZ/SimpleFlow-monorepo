import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, Button, ButtonMenu, ButtonMenuItem, Card, ColumnCenter, copyText, useToast } from '@pancakeswap/uikit'
import { NoteContainer } from 'components/NoteContainer'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { nanoid } from 'nanoid'
import { useCallback, useState } from 'react'
import { GIFT_CODE_LENGTH } from '../constants'
import { useCreateGift } from '../hooks/useCreateGift'
import { generateClaimLink } from '../utils/generateClaimLink'

enum GIFT_VIEW {
  SEND_LINK = 0,
  SEND_QR = 1,
}

export const SendGiftView = ({
  tokenAmount,
  price,
}: {
  tokenAmount?: CurrencyAmount<Token | NativeCurrency>
  price: number
}) => {
  const { t } = useTranslation()
  const [code, setCode] = useState<string | null>(null)

  const { createGift, isLoading, txHash, error } = useCreateGift()
  const { toastSuccess } = useToast()

  const handleCreateGift = useCallback(() => {
    const randomCode = nanoid(GIFT_CODE_LENGTH)
    setCode(() => {
      createGift({ tokenAmount: tokenAmount!, code: randomCode })
      return randomCode
    })
  }, [tokenAmount, createGift])

  if (!tokenAmount) {
    return null
  }

  if (code && txHash) {
    const amount = tokenAmount.toExact()

    const usdValue = parseFloat(amount) * price

    return (
      <ColumnCenter>
        <TokenAmountSection tokenAmount={tokenAmount} price={price} />

        <Card
          style={{
            maxWidth: '100%',
          }}
        >
          <Box padding="8px">
            <NoteContainer mb="16px" p="4px">
              {t(
                `Just sent you $${usdValue.toFixed(2)}! 🎉 Tap this link and to claim it: 👉 ${generateClaimLink({
                  code,
                })}`,
              )}
              <br />
              <br />
              {t(`Please connect your wallet to claim it!`)}
              <br />
              <br />
              {t(`Alternatively, you can manually enter the code ${code} on PancakeSwap wallet to claim.`)}
            </NoteContainer>

            <ActionButton
              variant="danger"
              onClick={() => {
                const link = generateClaimLink({ code: code! })
                copyText(link)

                toastSuccess(t('Claim code'), t('Copied!'))
              }}
            >
              {t('Copy')}
            </ActionButton>
          </Box>
        </Card>
      </ColumnCenter>
    )
  }

  return (
    <ColumnCenter>
      <Box width="100%" mb="16px" onClick={(e) => e.stopPropagation()}>
        <ButtonMenu scale="sm" variant="subtle" onItemClick={() => {}} activeIndex={GIFT_VIEW.SEND_LINK} fullWidth>
          <ButtonMenuItem>{t('Link')}</ButtonMenuItem>
          <ButtonMenuItem>{t('QR')}</ButtonMenuItem>
        </ButtonMenu>
      </Box>

      <TokenAmountSection tokenAmount={tokenAmount} price={price} />

      <Card mb="16px">
        <ul style={{ fontSize: '12px', lineHeight: '14px', padding: '16px 24px' }}>
          <li>{t('Send without a wallet address.')}</li>
          <li>{t('The gift remains safely on-chain, accessible only to the recipient.')}</li>
          <li>{t('Gifts expire after 7 days, unclaimed funds will be returned to you.')}</li>
        </ul>
      </Card>

      {error && <div>{error.message}</div>}
      <Button disabled={isLoading} onClick={handleCreateGift} width="100%">
        {isLoading ? t('Sending...') : t('Send')}
      </Button>
    </ColumnCenter>
  )
}
