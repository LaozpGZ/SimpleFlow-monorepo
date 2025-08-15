import { useTranslation } from '@pancakeswap/localization'
import { AtomBox, Button, Card, CardBody, FlexGap, Heading, Text } from '@pancakeswap/uikit'
import { lazy, Suspense } from 'react'
import styled from 'styled-components'
import { LinkOfDevice, WalletConfigV3 } from '../../types'

const Qrcode = lazy(() => import('../QRCode'))

const getDesktopLink = (linkDevice: LinkOfDevice) =>
  typeof linkDevice === 'string'
    ? linkDevice
    : typeof linkDevice.desktop === 'string'
    ? linkDevice.desktop
    : linkDevice.desktop?.url

const getDesktopText = (linkDevice: LinkOfDevice, fallback: string) =>
  typeof linkDevice === 'string'
    ? fallback
    : typeof linkDevice.desktop === 'string'
    ? fallback
    : linkDevice.desktop?.text ?? fallback

const QRCodeBox = styled(AtomBox)`
  overflow: hidden;
  width: 222px;
  height: 222px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom-width: 2px;
  border-radius: 12px;
`

export const NotInstalled = ({ wallet, qrCode }: { wallet: WalletConfigV3; qrCode?: string }) => {
  const { t } = useTranslation()

  if (qrCode) {
    return (
      <Card mx="23px">
        <CardBody>
          <FlexGap flexDirection="column" gap="8px" justifyContent="center" alignItems="center">
            <Text fontWeight={600} fontSize="16px">
              {t('%wallet% is not installed', { wallet: wallet.title })}
            </Text>
            <Text fontSize={12} color="textSubtle">
              {t(
                'If you’re using the app, scan your wallet to continue on EVM, or install TokenPocket to proceed on Solana.',
              )}
            </Text>
            {qrCode && (
              <Suspense>
                <QRCodeBox>
                  <Qrcode
                    size={222}
                    logoSize={40}
                    url={qrCode}
                    image={typeof wallet.icon === 'string' ? wallet.icon : undefined}
                  />
                </QRCodeBox>
              </Suspense>
            )}
            <FlexGap gap="8px" justifyContent="center">
              {wallet.downloadLink && (
                <Button variant="text" as="a" scale="xs" href={getDesktopLink(wallet.downloadLink)} external>
                  {getDesktopText(wallet.downloadLink, t('Install'))}
                </Button>
              )}
              {wallet.guide && (
                <Button variant="text" as="a" scale="xs" href={getDesktopLink(wallet.guide)} external>
                  {getDesktopText(wallet.guide, t('Setup Guide'))}
                </Button>
              )}
            </FlexGap>
          </FlexGap>
        </CardBody>
      </Card>
    )
  }
  return (
    <AtomBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ gap: '12px' }}
      textAlign="center"
      width="100%"
    >
      <Heading as="h1" fontSize="20px" color="secondary">
        {t('%wallet% is not installed', { wallet: wallet.title })}
      </Heading>
      {!wallet.isNotExtension && (
        <Text maxWidth="246px" m="auto">
          {t('Please install the %wallet% browser extension to connect the %wallet% wallet.', {
            wallet: wallet.title,
          })}
        </Text>
      )}
      {wallet.guide && (
        <Button variant="subtle" as="a" href={getDesktopLink(wallet.guide)} external>
          {getDesktopText(wallet.guide, t('Setup Guide'))}
        </Button>
      )}
      {wallet.downloadLink && (
        <Button variant="subtle" as="a" href={getDesktopLink(wallet.downloadLink)} external>
          {getDesktopText(wallet.downloadLink, t('Install'))}
        </Button>
      )}
    </AtomBox>
  )
}
