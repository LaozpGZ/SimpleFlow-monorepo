import { useTranslation } from '@pancakeswap/localization'
import {
  Button,
  type ButtonProps,
  FlexGap,
  Modal,
  ModalBody,
  Text,
  WalletFilledV2Icon,
  useModal,
} from '@pancakeswap/uikit'
import Trans from './Trans'

interface ConnectWalletButtonProps extends ButtonProps {
  withIcon?: boolean
}

const InstallModal = () => {
  const { t } = useTranslation()
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
          <Button as="a" href="https://www.binance.com/en/download" target="_blank" rel="noopener noreferrer">
            <Text bold fontSize="16px" color="invertedContrast">
              {t('Download Now')}
            </Text>
          </Button>
        </FlexGap>
      </ModalBody>
    </Modal>
  )
}

const ConnectW3WButton = ({ children, withIcon, ...props }: ConnectWalletButtonProps) => {
  const [onPresentInstallModal] = useModal(<InstallModal />, true, true, 'install-w3w')

  return (
    <>
      <Button onClick={onPresentInstallModal} {...props}>
        <FlexGap gap="8px" justifyContent="center" alignItems="center">
          {children || <Trans>Connect Wallet</Trans>} {withIcon && <WalletFilledV2Icon color="invertedContrast" />}
        </FlexGap>
      </Button>
    </>
  )
}

export default ConnectW3WButton
