import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import {
  Box,
  Button,
  ButtonMenu,
  ButtonMenuItem,
  Card,
  ColumnCenter,
  copyText,
  Flex,
  LogoIcon,
  Text,
  useToast,
} from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { NoteContainer } from 'components/NoteContainer'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { ActionButton } from 'components/WalletModalV2/ActionButton'
import { nanoid } from 'nanoid'
import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useState } from 'react'
import { styled } from 'styled-components'
import { GIFT_CODE_LENGTH } from '../constants'
import { useCreateGift } from '../hooks/useCreateGift'
import { generateClaimLink } from '../utils/generateClaimLink'

enum GIFT_VIEW {
  SEND_LINK = 0,
  SEND_QR = 1,
}

const QRCode = styled(Box)`
  width: 262px;
  height: 262px;
  background-color: white;
  border-radius: 16px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
`

function QRView({
  tokenAmount,
  usdValue,
  claimLink,
}: {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  usdValue: number
  claimLink: string
}) {
  return (
    <>
      <Card mb="16px">
        <Flex p="8px">
          <CurrencyLogo showChainLogo currency={tokenAmount.currency} size="40px" />
          <Flex flexDirection="column" ml="8px">
            <Text fontWeight="600" fontSize="14px" color="text">
              {tokenAmount.toSignificant(6)} {tokenAmount.currency.symbol}
            </Text>
            <Text fontSize="12px" color="textSubtle">
              ~{usdValue.toFixed(2)} USD
            </Text>
          </Flex>
        </Flex>
      </Card>
      <Flex mb="16px" justifyContent="center">
        <Box position="relative">
          <QRCodeSVG
            value={claimLink}
            size={246}
            level="H"
            includeMargin
            imageSettings={{
              src: '/images/tokens/pancakeswap-token.png',
              x: undefined,
              y: undefined,
              height: 48,
              width: 48,
              excavate: true,
            }}
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            style={{ transform: 'translate(-50%, -50%)' }}
            background="white"
          >
            <LogoIcon width="40px" />
          </Box>
        </Box>
      </Flex>
    </>
  )
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
    const claimLink = generateClaimLink({ code })

    return (
      <ColumnCenter>
        <Box width="100%" mb="16px" onClick={(e) => e.stopPropagation()}>
          <ButtonMenu scale="sm" variant="subtle" onItemClick={setSelectedView} activeIndex={selectedView} fullWidth>
            <ButtonMenuItem>{t('Link')}</ButtonMenuItem>
            <ButtonMenuItem>{t('QR')}</ButtonMenuItem>
          </ButtonMenu>
        </Box>

        {selectedView === GIFT_VIEW.SEND_LINK && <TokenAmountSection tokenAmount={tokenAmount} price={price} />}

        <Card
          style={{
            maxWidth: '100%',
            width: '100%',
          }}
        >
          <Box padding="16px" width="100%">
            {selectedView === GIFT_VIEW.SEND_LINK ? (
              <>
                <NoteContainer mb="16px" p="8px">
                  {t(`Just sent you $${usdValue.toFixed(2)}! 🎉 Tap this link and to claim it: 👉 ${claimLink}`)}
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
                    copyText(claimLink)
                    toastSuccess(t('Claim code'), t('Copied!'))
                  }}
                >
                  {t('Copy')}
                </ActionButton>
              </>
            ) : (
              <QRView tokenAmount={tokenAmount} usdValue={usdValue} claimLink={claimLink} />
            )}
          </Box>
        </Card>
      </ColumnCenter>
    )
  }

  return (
    <ColumnCenter>
      <Box width="100%" mb="16px" onClick={(e) => e.stopPropagation()}>
        <ButtonMenu scale="sm" variant="subtle" onItemClick={setSelectedView} activeIndex={selectedView} fullWidth>
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
