import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, Card, Flex, LogoIcon, Image, Text, FlexGap } from '@pancakeswap/uikit'
import { QRCodeSVG } from 'qrcode.react'
import styled from 'styled-components'
import { SecondaryCard } from 'components/SecondaryCard'
import { generateClaimLink } from '../utils/generateClaimLink'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import QRDownloadImageButton from './QRDownloadImageButton'

const GiftCodeContainer = styled(Box)`
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: start;
  width: 100%;
`

// offscreen container for the QR code
const QRCodeContainer = styled(Box)`
  position: absolute;
  left: -9999px; /* moves it offscreen */
`

function QRImageDownloadView({
  qrCodeElement,
  code,
  tokenAmount,
  nativeAmount,
}: {
  qrCodeElement: React.ReactNode
  code: string
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  nativeAmount?: CurrencyAmount<NativeCurrency>
}) {
  const { t } = useTranslation()

  return (
    <>
      <QRCodeContainer>
        <Flex id="qr-code" p="8px" justifyContent="center" flexDirection="column" alignItems="center">
          <Text mb="16px" bold>
            {t('Unlock Your Gift!')}
          </Text>

          {qrCodeElement}

          <SecondaryCard>
            <Text>{t('Scan the QR code to claim your gift, which includes:')}</Text>
            <FlexGap flexDirection="column" gap="8px">
              {tokenAmount.greaterThan(0) && (
                <Card>
                  <CurrencyAmountGiftDisplay p="8px" currencyAmount={tokenAmount} />
                </Card>
              )}
              {nativeAmount && nativeAmount.greaterThan(0) && (
                <Card>
                  <CurrencyAmountGiftDisplay p="8px" currencyAmount={nativeAmount} />
                </Card>
              )}
            </FlexGap>
            <Flex alignItems="end">
              <Text fontSize="12px" mr="4px" color="textSubtle">
                {t('Gift Code:')}
              </Text>{' '}
              <Text bold fontSize="14px">
                {code}
              </Text>
            </Flex>
            <Text fontSize="12px" color="textSubtle">
              {t('Only valid for 1 claim.')}
            </Text>
          </SecondaryCard>
        </Flex>
      </QRCodeContainer>
      <QRDownloadImageButton elementId="qr-code" />
    </>
  )
}

export function QRView({
  tokenAmount,
  nativeAmount,
  code,
}: {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  nativeAmount?: CurrencyAmount<NativeCurrency>
  code: string
}) {
  const { t } = useTranslation()

  const qrElement = (
    <Box position="relative">
      <QRCodeSVG
        value={generateClaimLink({ code })}
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
      <Box position="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} background="white">
        <LogoIcon width="40px" />
      </Box>
    </Box>
  )

  return (
    <>
      <FlexGap flexDirection="column" gap="8px" mb="16px" width="100%">
        {tokenAmount.greaterThan(0) && (
          <Card>
            <CurrencyAmountGiftDisplay p="8px" currencyAmount={tokenAmount} />
          </Card>
        )}
        {nativeAmount && nativeAmount.greaterThan(0) && (
          <Card>
            <CurrencyAmountGiftDisplay p="8px" currencyAmount={nativeAmount} />
          </Card>
        )}
      </FlexGap>
      <Flex mb="16px" justifyContent="center" flexDirection="column" alignItems="center">
        <Box mb="16px">{qrElement}</Box>
        <GiftCodeContainer>
          <Flex alignItems="end">
            <Text fontSize="12px" mr="4px" color="textSubtle">
              {t('Gift Code:')}
            </Text>{' '}
            <Text bold fontSize="14px">
              {code}
            </Text>
          </Flex>
        </GiftCodeContainer>
      </Flex>
      <QRImageDownloadView
        qrCodeElement={qrElement}
        code={code}
        tokenAmount={tokenAmount}
        nativeAmount={nativeAmount}
      />
    </>
  )
}

export function GiftQRPlaceholder() {
  return (
    <SecondaryCard mb="16px" style={{ width: '100%' }}>
      <Flex background="" justifyContent="center" flexDirection="column" alignItems="center">
        <Image src="/images/gifts/gift-qr-placeholder.png" alt="Gift QR Placeholder" width={170} height={143} />
      </Flex>
    </SecondaryCard>
  )
}
