import { useWallet } from '@solana/wallet-adapter-react'
import { useTranslation } from '@pancakeswap/localization'
import { AtomBox, ModalV2, ModalWrapper, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { EvmConnectorNames, SolanaConnectorNames } from '../../config/connectorNames'
import { getTopWalletsConfig, getWalletsConfig } from '../../config/wallets'
import { WalletConnectorNotFoundError, WalletSwitchChainError } from '../../error'
import {
  errorEvmAtom,
  errorSolanaAtom,
  lastUsedEvmWalletNameAtom,
  lastUsedSolanaWalletNameAtom,
  previouslyUsedEvmWalletsAtom,
  previouslyUsedSolanaWalletsAtom,
  setSelectedEvmWalletAtom,
  setSelectedSolanaWalletAtom,
} from '../../state/atom'
import { ConnectData, WalletAdaptedNetwork, WalletConfigV3 } from '../../types'
import { PreviewStatus } from '../PreviewSection'
import { DesktopModal } from './DesktopModal'
import { MobileModal } from './MobileModal'
import { MultichainWalletModalProps } from './types'
import { fullSizeModalWrapperClass } from '../WalletModal.css'
import { modalWrapperClass } from './modal.css'

export const MultichainWalletModal: React.FC<MultichainWalletModalProps> = (props) => {
  const {
    wallets,
    topWallets,
    evmLogin,
    createEvmQrCode,
    solanaLogin,
    onWalletConnectCallBack,
    fullSize,
    onGoogleLogin,
    onXLogin,
    onTelegramLogin,
    onDiscordLogin,
    docLink,
    ...rest
  } = props

  const { t } = useTranslation()

  const [solanaOnly, setSolanaOnly] = useState(false)
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>(PreviewStatus.Intro)

  const { wallets: solanaWallets } = useWallet()

  const wallets_ = wallets ?? getWalletsConfig({ solanaOnly, createEvmQrCode, solanaWalletAdapters: solanaWallets })
  const topWallets_ = topWallets ?? getTopWalletsConfig(wallets_, solanaOnly)

  const handleDismiss = () => {
    props.onDismiss?.()
    setPreviewStatus(PreviewStatus.Intro)
  }

  const setEvmSelectedWallet = useSetAtom(setSelectedEvmWalletAtom)
  const [, setSolanaError] = useAtom(errorSolanaAtom)
  const [, setLastUsedSolanaWallet] = useAtom(lastUsedSolanaWalletNameAtom)
  const [previouslyUsedSolanaWalletsId] = useAtom(previouslyUsedSolanaWalletsAtom)
  const previouslyUsedSolanaWallets = useMemo(
    () =>
      previouslyUsedSolanaWalletsId
        .map((id) => wallets_.find((w) => w.id === id))
        .filter<WalletConfigV3<SolanaConnectorNames>>((w): w is WalletConfigV3<SolanaConnectorNames> => Boolean(w)),
    [wallets_, previouslyUsedSolanaWalletsId],
  )

  const setSolanaSelectedWallet = useSetAtom(setSelectedSolanaWalletAtom)
  const [, setEvmError] = useAtom(errorEvmAtom)
  const [, setLastUsedEvmWallet] = useAtom(lastUsedEvmWalletNameAtom)
  const [previouslyUsedEvmWalletsId] = useAtom(previouslyUsedEvmWalletsAtom)
  const previouslyUsedEvmWallets = useMemo(
    () =>
      previouslyUsedEvmWalletsId
        .map((id) => wallets_.find((w) => w.id === id))
        .filter<WalletConfigV3<EvmConnectorNames>>((w): w is WalletConfigV3<EvmConnectorNames> => Boolean(w)),
    [wallets_, previouslyUsedEvmWalletsId],
  )

  const handleWalletConnected = useCallback(
    (wallet: WalletConfigV3, network: WalletAdaptedNetwork, connectData?: ConnectData) => {
      if (network === WalletAdaptedNetwork.Solana) setLastUsedSolanaWallet(wallet.id)
      if (network === WalletAdaptedNetwork.EVM) setLastUsedEvmWallet(wallet.id)

      onWalletConnectCallBack?.(wallet.title, connectData?.accounts?.[0])
    },
    [onWalletConnectCallBack, setLastUsedEvmWallet, setLastUsedSolanaWallet],
  )

  const connectWallet = useCallback((wallet: WalletConfigV3, network: WalletAdaptedNetwork) => {
    if (network === WalletAdaptedNetwork.Solana) {
      setSolanaSelectedWallet(wallet as WalletConfigV3<SolanaConnectorNames>)
      setSolanaError('')
    }
    if (network === WalletAdaptedNetwork.EVM) {
      setEvmSelectedWallet(wallet as WalletConfigV3<EvmConnectorNames>)
      setEvmError('')
    }

    if (!('installed' in wallet) || wallet.installed !== false) {
      if (network === WalletAdaptedNetwork.EVM) {
        evmLogin(wallet)
          .then((connectData) => {
            if (connectData) {
              handleWalletConnected(wallet, network, connectData)
            }
          })
          .catch((err) => {
            if (err instanceof WalletConnectorNotFoundError) {
              setEvmError(t('no provider found'))
            } else if (err instanceof WalletSwitchChainError) {
              setEvmError(err.message)
            } else {
              setEvmError(t('Error connecting, please authorize wallet to access.'))
            }
          })
      }

      // @TODO @ChefJerry, add solana login
    }
  }, [])

  const displaySocialLogin = () => {
    setPreviewStatus(PreviewStatus.SocialLogin)
  }
  const handleSocialLoginWithCleanup = (originalCallback?: () => void) => {
    return () => {
      // Close modal when social login is initiated
      props.onDismiss?.()

      // Execute the original callback
      originalCallback?.()
    }
  }

  const { isMobile } = useMatchBreakpoints()
  const mobileContainerStyle: React.CSSProperties = isMobile ? { height: '100%', borderRadius: 0 } : {}

  return (
    <ModalV2 closeOnOverlayClick disableOutsidePointerEvents={false} {...rest} onDismiss={handleDismiss}>
      <ModalWrapper
        onDismiss={handleDismiss}
        containerStyle={{ border: 'none', ...mobileContainerStyle }}
        style={{
          overflow: 'visible',
          border: 'none',
          ...mobileContainerStyle,
        }}
      >
        <AtomBox
          position="relative"
          zIndex="modal"
          className={fullSize ? fullSizeModalWrapperClass : modalWrapperClass}
        >
          <AtomBox
            display="flex"
            position="relative"
            background={isMobile ? 'backgroundAlt' : 'gradientCardHeader'}
            borderRadius="card"
            flexDirection={isMobile ? 'column' : 'row'}
            px={isMobile ? '16px' : '0px'}
            py={isMobile ? '24px' : '0px'}
            borderBottomRadius={{
              xs: '0',
              md: 'card',
            }}
            zIndex="modal"
            width="100%"
          >
            {/* todo: add close button on mobile */}
            {isMobile ? (
              <MobileModal
                wallets={wallets_}
                topWallets={topWallets_}
                previouslyUsedWallets={[previouslyUsedEvmWallets, previouslyUsedSolanaWallets]}
                connectWallet={connectWallet}
                displaySocialLogin={displaySocialLogin}
              />
            ) : (
              <DesktopModal
                wallets={wallets_}
                topWallets={topWallets_}
                previouslyUsedWallets={[previouslyUsedEvmWallets, previouslyUsedSolanaWallets]}
                connectWallet={connectWallet}
                onWalletConnected={handleWalletConnected}
                displaySocialLogin={displaySocialLogin}
                previewStatus={previewStatus}
                setPreviewStatus={setPreviewStatus}
                docLink={docLink}
                onGoogleLogin={handleSocialLoginWithCleanup(props.onGoogleLogin)}
                onXLogin={handleSocialLoginWithCleanup(props.onXLogin)}
                onTelegramLogin={handleSocialLoginWithCleanup(props.onTelegramLogin)}
                onDiscordLogin={handleSocialLoginWithCleanup(props.onDiscordLogin)}
              />
            )}
          </AtomBox>
        </AtomBox>
      </ModalWrapper>
    </ModalV2>
  )
}
