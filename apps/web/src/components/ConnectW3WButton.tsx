import { useIsMounted } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import {
  Button,
  type ButtonProps,
  FlexGap,
  Modal,
  ModalBody,
  ModalV2,
  Text,
  WalletFilledV2Icon,
} from '@pancakeswap/uikit'
import { ConnectorNames } from 'config/wallet'
import useAuth from 'hooks/useAuth'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Trans from './Trans'

interface ConnectWalletButtonProps extends ButtonProps {
  withIcon?: boolean
}

export const getBinanceDeepLink = (url: string, chainId = 1) => {
  const base = 'bnc://app.binance.com/mp/app'
  const appId = 'yFK5FCqYprrXDiVFbhyRx7'

  const startPagePath = btoa('/pages/browser/index')
  const startPageQuery = btoa(`url=${url}&defaultChainId=${chainId}`)
  const deeplink = `${base}?appId=${appId}&startPagePath=${startPagePath}&startPageQuery=${startPageQuery}`
  const dp = btoa(deeplink)
  const http = `https://app.binance.com/en/download?_dp=${dp}`
  return { http, bnc: deeplink }
}

const InstallModal = () => {
  const { t } = useTranslation()

  const href = useMemo(() => {
    const { http } = getBinanceDeepLink(`${window.location.origin}/ido?chain=bsc`, 56)
    return http
  }, [])

  return (
    <Modal title={t('Connect Binance Wallet')}>
      <ModalBody>
        <FlexGap gap="16px" flexDirection="column">
          {/* <Heading textAlign="center">{t('Connect Binance Wallet')}</Heading> */}
          <Text>
            {t(
              'This IDO is exclusively available on the Binance Wallet. It seems you do not have the Binance App installed. Please download it on your mobile device to proceed.',
            )}
          </Text>
          <Text color="textSubtle">
            {t(
              'To participate, please create a wallet using the Binance Wallet, as importing wallets with seed phrases is not supported for this sale.',
            )}
          </Text>
          <Button as="a" href={href} target="_blank" rel="noopener noreferrer">
            <Text bold fontSize="16px" color="invertedContrast">
              {t('Use Binance Wallet')}
            </Text>
          </Button>
        </FlexGap>
      </ModalBody>
    </Modal>
  )
}

const isBinanceWallet = () => {
  return (
    typeof window !== 'undefined' && (window.ethereum?.isBinance || window.navigator?.userAgent.includes('Binance'))
  )
}

const ConnectW3WButton = ({ children, withIcon, ...props }: ConnectWalletButtonProps) => {
  const { login } = useAuth()
  const [open, setOpen] = useState(false)
  const handleOnDismiss = useCallback(() => setOpen(false), [])

  const handleClick = () => {
    if (isBinanceWallet()) {
      login(ConnectorNames.Injected)
    } else {
      setOpen(true)
    }
  }

  const [autoConnected, setAutoConnected] = useState(false)
  const isMounted = useIsMounted()

  useEffect(() => {
    if (isMounted && !autoConnected && isBinanceWallet()) {
      login(ConnectorNames.Injected)
      setAutoConnected(true)
    }
  }, [autoConnected, isMounted, login])

  return (
    <>
      <Button onClick={handleClick} {...props}>
        <FlexGap gap="8px" justifyContent="center" alignItems="center">
          {children || <Trans>Connect Wallet</Trans>} {withIcon && <WalletFilledV2Icon color="invertedContrast" />}
        </FlexGap>
      </Button>
      <ModalV2 isOpen={open} onDismiss={handleOnDismiss}>
        <InstallModal />
      </ModalV2>
    </>
  )
}

export default ConnectW3WButton
