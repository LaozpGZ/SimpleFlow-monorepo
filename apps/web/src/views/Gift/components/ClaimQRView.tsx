import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Box, Card, Flex, LogoIcon, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { QRCodeSVG } from 'qrcode.react'
import styled from 'styled-components'
import { generateClaimLink } from '../utils/generateClaimLink'

const GiftCodeContainer = styled(Box)`
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: center;
`

export function QRView({
  tokenAmount,
  usdValue,
  code,
}: {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  usdValue: number
  code: string
}) {
  const { t } = useTranslation()
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
