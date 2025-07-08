import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, Card, Flex, LogoIcon, Image } from '@pancakeswap/uikit'
import { QRCodeSVG } from 'qrcode.react'
import styled from 'styled-components'
import { SecondaryCard } from 'components/SecondaryCard'
import { generateClaimLink } from '../utils/generateClaimLink'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'

const GiftCodeContainer = styled(Box)`
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: center;
`

export function QRView({ tokenAmount, code }: { tokenAmount: CurrencyAmount<Token | NativeCurrency>; code: string }) {
  const { t } = useTranslation()
  return (
    <>
      <Card mb="16px">
        <CurrencyAmountGiftDisplay p="8px" currencyAmount={tokenAmount} />
      </Card>
      <Flex mb="16px" justifyContent="center" flexDirection="column" alignItems="center">
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
        <GiftCodeContainer>
          {t('Gift Code:')} <b style={{ marginLeft: '4px' }}>{code}</b>
        </GiftCodeContainer>
      </Flex>
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
