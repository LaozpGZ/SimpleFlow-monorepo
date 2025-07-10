import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, ButtonMenu, ButtonMenuItem, Card, ColumnCenter, FlexGap, RowBetween, Text } from '@pancakeswap/uikit'
import { BulletList } from 'components/BulletList'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { nanoid } from 'nanoid'
import { useCallback, useState } from 'react'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { GIFT_CODE_LENGTH } from '../constants'
import { useCalculateTotalCostCreateGift } from '../hooks/useCalculateTotalCostCreateGift'
import { useCreateGift } from '../hooks/useCreateGift'
import { useReadGasPaymentAmount } from '../hooks/useReadGasPayment'
import { useSendGiftContext } from '../providers/SendGiftProvider'
import { GiftQRPlaceholder, QRView } from './ClaimQRView'
import { CopyLinkCheckBoxes } from './CopyLinkCheckBoxes'
import { CreateGiftButton } from './CreateGiftButton'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import { SendLinkView } from './SendLinkView'

enum GIFT_VIEW {
  SEND_LINK = 0,
  SEND_QR = 1,
}

export const CreateGiftView = ({ tokenAmount }: { tokenAmount?: CurrencyAmount<Token | NativeCurrency> }) => {
  const { t } = useTranslation()
  const [code, setCode] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<GIFT_VIEW>(GIFT_VIEW.SEND_LINK)
  const { nativeAmount, includeStarterGas } = useSendGiftContext()

  const { createGift, isLoading, isConfirmed } = useCreateGift()

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

  const { gasPayment, gasPaymentUsd } = useReadGasPaymentAmount()

  const totalUsd = useCalculateTotalCostCreateGift({ tokenAmount, nativeAmount })

  if (!tokenAmount) {
    return null
  }

  const tokenDisplay = nativeAmount ? (
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
    <TokenAmountSection tokenAmount={tokenAmount} />
  )

  if (code && isConfirmed) {
    return (
      <ColumnCenter>
        {viewTabs}

        {selectedView === GIFT_VIEW.SEND_LINK && tokenDisplay}

        <Card
          style={{
            maxWidth: '100%',
            width: '100%',
            marginBottom: '16px',
          }}
        >
          <Box padding="16px" width="100%">
            {selectedView === GIFT_VIEW.SEND_LINK ? (
              <SendLinkView tokenAmount={tokenAmount} nativeAmount={nativeAmount} code={code} />
            ) : (
              <QRView tokenAmount={tokenAmount} nativeAmount={nativeAmount} code={code} />
            )}
          </Box>
        </Card>

        <CopyLinkCheckBoxes />
      </ColumnCenter>
    )
  }

  return (
    <ColumnCenter>
      {viewTabs}

      {selectedView === GIFT_VIEW.SEND_QR && <GiftQRPlaceholder />}

      {tokenDisplay}

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

      <FlexGap flexDirection="column" gap="8px" mb="16px" width="100%">
        <RowBetween>
          <Text color="textSubtle">{t('Gift Claim Gas Fee (Fixed)')}</Text>
          <Text>
            {gasPayment?.toSignificant(6)} {gasPayment?.currency.symbol}
          </Text>
        </RowBetween>

        <RowBetween>
          <Text color="textSubtle">{t('Total cost to Create Gift')}</Text>
          <Text>{formatDollarAmount(totalUsd + gasPaymentUsd)}</Text>
        </RowBetween>
      </FlexGap>

      {tokenAmount && (
        <CreateGiftButton isLoading={isLoading} handleCreateGift={handleCreateGift} tokenAmount={tokenAmount} />
      )}
    </ColumnCenter>
  )
}
