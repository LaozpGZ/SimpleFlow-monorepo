import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, Button, ButtonMenu, ButtonMenuItem, Card, ColumnCenter, Text } from '@pancakeswap/uikit'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { nanoid } from 'nanoid'
import { BulletList } from 'components/BulletList'
import { useCallback, useState } from 'react'
import { GIFT_CODE_LENGTH } from '../constants'
import { useCreateGift } from '../hooks/useCreateGift'
import { QRView } from './ClaimQRView'
import { SendLinkView } from './SendLinkView'

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
  const [selectedView, setSelectedView] = useState<GIFT_VIEW>(GIFT_VIEW.SEND_LINK)

  const { createGift, isLoading, txHash, error } = useCreateGift()

  const handleCreateGift = useCallback(() => {
    const randomCode = nanoid(GIFT_CODE_LENGTH)
    setCode(() => {
      createGift({ tokenAmount: tokenAmount!, code: randomCode })
      return randomCode
    })
  }, [tokenAmount, createGift])

  const viewTabs = (
    <Box width="100%" mb="16px" onClick={(e) => e.stopPropagation()}>
      <ButtonMenu scale="sm" variant="subtle" onItemClick={setSelectedView} activeIndex={selectedView} fullWidth>
        <ButtonMenuItem>{t('Link')}</ButtonMenuItem>
        <ButtonMenuItem>{t('QR')}</ButtonMenuItem>
      </ButtonMenu>
    </Box>
  )

  if (!tokenAmount) {
    return null
  }

  if (code && txHash) {
    const amount = tokenAmount.toExact()
    const usdValue = parseFloat(amount) * price

    return (
      <ColumnCenter>
        {viewTabs}

        {selectedView === GIFT_VIEW.SEND_LINK && <TokenAmountSection tokenAmount={tokenAmount} price={price} />}

        <Card
          style={{
            maxWidth: '100%',
            width: '100%',
          }}
        >
          <Box padding="16px" width="100%">
            {selectedView === GIFT_VIEW.SEND_LINK ? (
              <SendLinkView usdValue={usdValue} code={code} />
            ) : (
              <QRView tokenAmount={tokenAmount} usdValue={usdValue} code={code} />
            )}
          </Box>
        </Card>
      </ColumnCenter>
    )
  }

  return (
    <ColumnCenter>
      {viewTabs}
      <TokenAmountSection tokenAmount={tokenAmount} price={price} />

      <Card mb="16px">
        <Box p="16px">
          <BulletList>
            <li>
              <Text fontSize="12px" display="inline">
                {t('Send without a wallet address.')}
              </Text>
            </li>
            <li>
              <Text fontSize="12px" display="inline">
                {t('The gift remains safely on-chain, accessible only to the recipient.')}
              </Text>
            </li>
            <li>
              <Text fontSize="12px" display="inline">
                {t('Gifts expire after 7 days, unclaimed funds will be returned to you.')}
              </Text>
            </li>
          </BulletList>
        </Box>
      </Card>

      {error && <div>{error.message}</div>}
      <Button disabled={isLoading} onClick={handleCreateGift} width="100%">
        {isLoading ? t('Sending...') : t('Send')}
      </Button>
    </ColumnCenter>
  )
}
