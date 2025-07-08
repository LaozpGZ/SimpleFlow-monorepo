import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, ButtonMenu, ButtonMenuItem, Card, ColumnCenter, FlexGap, RowBetween, Text } from '@pancakeswap/uikit'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { nanoid } from 'nanoid'
import { BulletList } from 'components/BulletList'
import { useCallback, useState } from 'react'
import { useSendGiftContext } from '../providers/SendGiftProvider'
import { GIFT_CODE_LENGTH } from '../constants'
import { useCreateGift } from '../hooks/useCreateGift'
import { GiftQRPlaceholder, QRView } from './ClaimQRView'
import { SendLinkView } from './SendLinkView'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import { useReadGasPaymentAmount } from '../hooks/useReadGasPayment'
import { CreateGiftButton } from './CreateGiftButton'
import { CopyLinkCheckBoxes } from './CopyLinkCheckBoxes'

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
  const { nativeAmount, includeStarterGas } = useSendGiftContext()

  const { createGift, isLoading, txHash, error } = useCreateGift()

  const handleCreateGift = useCallback(() => {
    const randomCode = nanoid(GIFT_CODE_LENGTH)

    createGift({ tokenAmount: tokenAmount!, code: randomCode, nativeAmount })

    setCode(() => {
      return randomCode
    })
  }, [tokenAmount, createGift, nativeAmount])

  const viewTabs = (
    <Box width="100%" mb="16px" onClick={(e) => e.stopPropagation()}>
      <ButtonMenu scale="sm" variant="subtle" onItemClick={setSelectedView} activeIndex={selectedView} fullWidth>
        <ButtonMenuItem>{t('Link')}</ButtonMenuItem>
        <ButtonMenuItem>{t('QR')}</ButtonMenuItem>
      </ButtonMenu>
    </Box>
  )

  const gasPaymentAmount = useReadGasPaymentAmount()

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
            marginBottom: '16px',
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

        <CopyLinkCheckBoxes />
      </ColumnCenter>
    )
  }

  const hasIncludeStarterGas = includeStarterGas && nativeAmount

  return (
    <ColumnCenter>
      {viewTabs}

      {selectedView === GIFT_VIEW.SEND_QR && <GiftQRPlaceholder />}

      {hasIncludeStarterGas ? (
        <FlexGap mb="16px" width="100%" flexDirection="column" gap="8px">
          <Card>
            <Box p="8px">
              <CurrencyAmountGiftDisplay currencyAmount={tokenAmount} />
            </Box>
          </Card>
          <Card>
            <Box p="8px">
              <CurrencyAmountGiftDisplay currencyAmount={nativeAmount} />
            </Box>
          </Card>
        </FlexGap>
      ) : (
        <TokenAmountSection tokenAmount={tokenAmount} price={price} />
      )}

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

      {hasIncludeStarterGas && (
        <RowBetween mb="8px">
          <Text color="textSubtle">{t('Starter Gas for Recipient')}</Text>
          <Text>
            {nativeAmount?.toSignificant(6)} {nativeAmount?.currency.symbol}
          </Text>
        </RowBetween>
      )}

      <RowBetween mb="16px">
        <Text color="textSubtle">{t('Gift Claim Gas Fee (Fixed)')}</Text>
        <Text>
          {gasPaymentAmount?.toSignificant(6)} {gasPaymentAmount?.currency.symbol}
        </Text>
      </RowBetween>

      {error && <div>{error.message}</div>}
      {tokenAmount && (
        <CreateGiftButton isLoading={isLoading} handleCreateGift={handleCreateGift} tokenAmount={tokenAmount} />
      )}
    </ColumnCenter>
  )
}
