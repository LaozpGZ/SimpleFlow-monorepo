import { useTranslation } from '@pancakeswap/localization'
import { AtomBox, FlexGap, Grid, Heading, Image, RowBetween, Text, Toggle } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { ASSET_CDN } from '../../config/url'
import { errorEvmAtom, errorSolanaAtom } from '../../state/atom'
import { useSelectedWallet } from '../../state/hooks'
import { ConnectData, WalletAdaptedNetwork, WalletConfigV3 } from '../../types'
import { ErrorContent } from '../ErrorContent'
import { PreviewSection, PreviewStatus } from '../PreviewSection'
import SocialLogin from '../SocialLogin'
import SocialLoginButton from '../SocialLoginButton'
import { desktopWalletSelectionClass } from '../WalletModal.css'
import { WalletChainSelect } from '../WalletSelect/WalletChainSelect'
import { WalletSelect } from '../WalletSelect/WalletSelect'
import { MultichainWalletModalProps } from './types'

export type DesktopModalProps = Pick<MultichainWalletModalProps, 'wallets' | 'topWallets' | 'docLink'> & {
  previouslyUsedWallets: [WalletConfigV3[], WalletConfigV3[]]
  connectWallet: (wallet: WalletConfigV3, network: WalletAdaptedNetwork) => void
  onWalletConnected: (wallet: WalletConfigV3, network: WalletAdaptedNetwork, connectData?: ConnectData) => void
  displaySocialLogin: () => void
  previewStatus: PreviewStatus
  setPreviewStatus: (section: PreviewStatus) => void
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
}

export const DesktopModal: React.FC<DesktopModalProps> = ({
  docLink,
  wallets: wallets_,
  topWallets: topWallets_,
  previouslyUsedWallets,
  connectWallet,
  onWalletConnected,
  displaySocialLogin,
  previewStatus,
  setPreviewStatus,
  onGoogleLogin,
  onXLogin,
  onTelegramLogin,
  onDiscordLogin,
}) => {
  const wallets: WalletConfigV3[] =
    wallets_?.filter((w) => {
      return w.installed !== false || (!w.installed && (w.guide || w.downloadLink || w.qrCode))
    }) ?? []

  const topWallets: WalletConfigV3[] =
    topWallets_?.filter((w) => {
      return w.installed !== false || (!w.installed && (w.guide || w.downloadLink || w.qrCode))
    }) ?? []

  const selected = useSelectedWallet()
  const evmError = useAtomValue(errorEvmAtom)
  const solanaError = useAtomValue(errorSolanaAtom)
  const error = evmError || solanaError
  const [qrCode, setQrCode] = useState<string | undefined>(undefined)
  const { t } = useTranslation()

  const [selectedMultiChainWallet, setSelectedMultiChainWallet] = useState<WalletConfigV3 | null>(null)

  const onWalletSelected = useCallback(
    (w: WalletConfigV3, network: WalletAdaptedNetwork) => {
      if (w.networks.length > 1) {
        setSelectedMultiChainWallet(w)
        setPreviewStatus(PreviewStatus.ChainSelect)
        return
      }
      connectWallet(w, network)
      setQrCode(undefined)
      if (w.qrCode) {
        w.qrCode(() => onWalletConnected(w, network)).then(
          (uri) => {
            setQrCode(uri)
          },
          () => {
            // do nothing.
          },
        )
      }
    },
    [connectWallet, onWalletConnected],
  )

  return (
    <Grid gridTemplateColumns="1fr 1fr" width="100%">
      <AtomBox
        display="flex"
        flexDirection="column"
        bg="backgroundAlt"
        px="16px"
        py="16px"
        pt="24px"
        zIndex="modal"
        borderRadius="card"
        className={desktopWalletSelectionClass}
        gap="1rem"
      >
        <RowBetween>
          <Heading color="color" as="h4">
            {t('Connect Wallet')}
          </Heading>
          <FlexGap gap="8px" alignItems="center" as="label" htmlFor="wallet-modal-network-toggle">
            <Text textTransform="uppercase" fontWeight="600" color="textSubtle" fontSize="12px">
              {t('Solana Only')}
            </Text>
            <Toggle scale="md" id="wallet-modal-network-toggle" />
          </FlexGap>
        </RowBetween>

        <SocialLoginButton onClick={displaySocialLogin} assetCdn={ASSET_CDN} />

        <WalletSelect
          wallets={wallets}
          topWallets={topWallets}
          previouslyUsedWallets={previouslyUsedWallets}
          displayCount="all"
          onClick={onWalletSelected}
        />
        {/* {mevDocLink ? <MEVSection mevDocLink={mevDocLink} /> : null} */}
      </AtomBox>
      <AtomBox
        flex={1}
        px="16px"
        py="56px"
        display={{
          xs: 'none',
          sm: 'flex',
        }}
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        {previewStatus === PreviewStatus.Intro && (
          <AtomBox
            display="flex"
            flexDirection="column"
            alignItems="center"
            style={{ gap: '12px' }}
            textAlign="center"
            width="100%"
          >
            {!selected && <PreviewSection.Intro docLink={docLink} />}
            {selected && selected.installed !== false && (
              <>
                {typeof selected.icon === 'string' && <Image src={selected.icon} width={108} height={108} />}
                <Heading as="h1" fontSize="20px" color="secondary">
                  {t('Opening')} {selected.title}
                </Heading>
                {error ? (
                  <ErrorContent message={error} onRetry={() => connectWallet(selected, selected.networks[0])} />
                ) : (
                  <Text>{t('Please confirm in %wallet%', { wallet: selected.title })}</Text>
                )}
              </>
            )}
            {/* {selected && selected.installed === false && <NotInstalled qrCode={qrCode} wallet={selected} />} */}
          </AtomBox>
        )}
        {previewStatus === PreviewStatus.NotInstalled && selected && (
          <PreviewSection.NotInstalled qrCode={qrCode} wallet={selected} />
        )}
        {previewStatus === PreviewStatus.SocialLogin && (
          <SocialLogin
            onGoogleLogin={onGoogleLogin}
            onXLogin={onXLogin}
            onTelegramLogin={onTelegramLogin}
            onDiscordLogin={onDiscordLogin}
          />
        )}
        {previewStatus === PreviewStatus.ChainSelect && <WalletChainSelect wallet={selectedMultiChainWallet} />}
      </AtomBox>
    </Grid>
  )
}
