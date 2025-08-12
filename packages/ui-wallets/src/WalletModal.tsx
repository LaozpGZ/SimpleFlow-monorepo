import { usePreloadImages, useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import {
  AtomBox,
  AutoColumn,
  AutoRow,
  Button,
  Card,
  CardBody,
  CloseIcon,
  Column,
  FlexGap,
  Grid,
  Heading,
  IconButton,
  Image,
  LinkExternal,
  ModalV2,
  ModalWrapper,
  MoreHorizontalIcon,
  Row,
  RowBetween,
  ShieldCheckIcon,
  Text,
  Toggle,
  useMatchBreakpoints,
  WarningIcon,
} from '@pancakeswap/uikit'
import { useAtom } from 'jotai'
import styled from 'styled-components'
import { lazy, MouseEvent, PropsWithChildren, Suspense, useCallback, useMemo, useState } from 'react'
import { isMobile as isMobileDevice } from 'react-device-detect'
import {
  desktopWalletSelectionClass,
  fullSizeModalWrapperClass,
  modalWrapperClass,
  scrollbarClass,
  walletIconClass,
} from './WalletModal.css'
import {
  errorAtom,
  lastUsedEvmWalletNameAtom,
  previouslyUsedEvmWalletsAtom,
  selectedEvmWalletAtom,
  selectedSolanaWalletAtom,
} from './atom'
import SocialLoginButton from './components/SocialLoginButton'
import { WalletSelectSection, WalletSelectItem } from './components/WalletSelectSection'
import { ConnectData, LinkOfDevice, WalletConfigV2, WalletConfigV3, WalletModalV2Props } from './types'
import { ASSET_CDN } from './config/url'
import { getWalletsConfig, TOP_WALLETS_ID_CONFIG } from './config/wallets'
import { EvmConnectorNames, SolanaConnectorNames } from './config/connectorNames'
import { MoreWalletSection } from './components/MoreWalletSection'

const StepIntro = lazy(() => import('./components/Intro'))

const Qrcode = lazy(() => import('./components/QRCode'))

const SocialLoginModal = lazy(() => import('./components/SocialLoginModal'))

export class WalletConnectorNotFoundError extends Error {}

export class WalletSwitchChainError extends Error {}

// @deprecated use useSelectedEvmWallet or useSelectedSolanaWallet instead
// TODO @ChefJerry, remove this function after all usages are migrated to useSelectedEvmWallet or useSelectedSolanaWallet
export function useSelectedWallet() {
  // return useAtom<[WalletConfigV2<unknown> | null, WalletConfigV2<unknown> | null]>(selectedWalletAtom)
  return useSelectedEvmWallet()
}

export function useSelectedEvmWallet<T = unknown>() {
  // @ts-ignore
  return useAtom<WalletConfigV2<T> | null>(selectedEvmWalletAtom)
}

export function useSelectedSolanaWallet<T = unknown>() {
  // @ts-ignore
  return useAtom<WalletConfigV2<T> | null>(selectedSolanaWalletAtom)
}

type TabContainerProps = PropsWithChildren<{
  fullSize?: boolean
  onDismiss?: () => void
}>

const TabContainer = ({ children, fullSize = true, onDismiss }: TabContainerProps) => {
  const { isMobile } = useMatchBreakpoints()

  return (
    <AtomBox position="relative" zIndex="modal" className={fullSize ? fullSizeModalWrapperClass : modalWrapperClass}>
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
        {isMobile ? (
          <Row mb="16px" gap="16px">
            <IconButton
              mr="-6px"
              variant="text"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                onDismiss?.()
              }}
              aria-label="Close the dialog"
            >
              <CloseIcon color="textSubtle" />
            </IconButton>
          </Row>
        ) : null}
        {children}
      </AtomBox>
    </AtomBox>
  )
}

const MOBILE_DEFAULT_DISPLAY_COUNT = 8

function MobileModal<T>({
  wallets,
  topWallets,
  previouslyUsedWallets,
  connectWallet,
  mevDocLink,
  onOpenSocialLoginModal,
}: Pick<WalletModalV2Props<T>, 'wallets' | 'topWallets' | 'docLink' | 'docText' | 'mevDocLink'> & {
  connectWallet: (wallet: WalletConfigV2<T>) => void
  previouslyUsedWallets: WalletConfigV2<T>[]
  onOpenSocialLoginModal: () => void
}) {
  const [selected] = useSelectedWallet()
  const [[evmError, solanaError]] = useAtom(errorAtom)
  // TODO @ChefJerry, display evmError and solanaError separately
  const error = evmError || solanaError

  const installedWallets: WalletConfigV2<T>[] = useMemo(
    () => [...wallets, ...topWallets, ...previouslyUsedWallets].filter((w) => w.installed),
    [wallets, topWallets, previouslyUsedWallets],
  )
  const filterFn = useCallback(
    (w: WalletConfigV2<T>) => {
      return isMobileDevice
        ? installedWallets.length
          ? w.installed
          : w.installed !== false || w.deepLink
        : w.installed !== false || (!w.installed && (w.guide || w.downloadLink || w.qrCode))
    },
    [installedWallets.length],
  )

  // const installedWallets: WalletConfigV2<T>[] = wallets.filter((w) => w.installed)
  const walletsToShow: WalletConfigV2<T>[] = wallets.filter(filterFn)

  const topWalletsToShow: WalletConfigV2<T>[] = topWallets.filter(filterFn)
  const previouslyUsedWalletsToShow: WalletConfigV2<T>[] = previouslyUsedWallets.filter(filterFn)

  return (
    <AtomBox width="100%">
      {error ? (
        <AtomBox
          display="flex"
          flexDirection="column"
          alignItems="center"
          style={{ gap: '24px' }}
          textAlign="center"
          p="24px"
        >
          {selected && typeof selected.icon === 'string' && <Image src={selected.icon} width={108} height={108} />}
          <div style={{ maxWidth: '246px' }}>
            <ErrorMessage message={error} />
          </div>
        </AtomBox>
      ) : null}
      <AtomBox display="flex" flexDirection="column" gap="16px" justifyContent="space-between">
        <SocialLoginButton onClick={onOpenSocialLoginModal} assetCdn={ASSET_CDN} style={{ marginBottom: '8px' }} />

        <WalletSelect
          style={{ height: `calc(100vh - 200px)` }}
          displayCount="all"
          wallets={walletsToShow}
          topWallets={topWalletsToShow}
          previouslyUsedWallets={previouslyUsedWalletsToShow}
          onClick={(wallet) => {
            connectWallet(wallet)
            if (wallet.deepLink && wallet.installed === false) {
              window.open(wallet.deepLink, '_blank', 'noopener noreferrer')
            }
          }}
        />
        {mevDocLink ? <MEVSection mevDocLink={mevDocLink} /> : null}
      </AtomBox>
    </AtomBox>
  )
}

function WalletSelect<T>({
  wallets,
  topWallets,
  previouslyUsedWallets,
  onClick,
  displayCount = 9,
  style = {},
}: {
  wallets: WalletConfigV2<T>[]
  topWallets: WalletConfigV2<T>[]
  previouslyUsedWallets: WalletConfigV2<T>[]
  onClick: (wallet: WalletConfigV2<T>) => void
  displayCount?: number | 'all'
  style?: React.CSSProperties
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [showMore, setShowMore] = useState(false)
  const walletDisplayCount = useMemo(
    () => (displayCount === 'all' ? wallets.length : wallets.length > displayCount ? displayCount - 1 : displayCount),
    [displayCount, wallets.length],
  )
  const walletsToShow = useMemo(
    () => (showMore ? wallets : wallets.slice(0, walletDisplayCount)),
    [showMore, wallets, walletDisplayCount],
  )
  const sections: { label: string; items: WalletConfigV2<T>[]; isMore?: boolean }[] = useMemo(
    () => [
      { label: t('Previously used'), items: previouslyUsedWallets },
      { label: t('Top Wallets'), items: topWallets },
      // { label: t('More Wallets'), items: walletsToShow, isMore: true },
    ],
    [t, walletsToShow, topWallets, previouslyUsedWallets],
  )
  return (
    <Column
      overflowY="auto"
      overflowX="hidden"
      gap="16px"
      style={{ paddingRight: '16px', marginRight: '-24px', ...style }}
      className={scrollbarClass}
    >
      {sections.map(({ label, items }) =>
        items.length > 0 ? (
          <WalletSelectSection key={label} label={label}>
            {items.map((wallet) => (
              <WalletSelectItem key={wallet.id} wallet={wallet as WalletConfigV3<T>} onClick={onClick} />
            ))}
          </WalletSelectSection>
        ) : null,
      )}
      <MoreWalletSection onClick={onClick} wallets={walletsToShow as WalletConfigV3<T>[]} />
    </Column>
  )
}

function sortWallets<T>(wallets: WalletConfigV2<T>[], lastUsedWalletName: string | null) {
  const sorted = [...wallets].sort((a, b) => {
    if (a.installed === b.installed) return 0
    return a.installed === true ? -1 : 1
  })

  if (!lastUsedWalletName) {
    return sorted
  }
  const foundLastUsedWallet = wallets.find((w) => w.title === lastUsedWalletName)
  if (!foundLastUsedWallet) return sorted
  return [foundLastUsedWallet, ...sorted.filter((w) => w.id !== foundLastUsedWallet.id)]
}

const MEVSection = ({ mevDocLink }: { mevDocLink: string }) => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  return (
    <Row
      color="textSubtle"
      fontSize="12px"
      gap="4px"
      width="100%"
      padding="8px"
      justifyContent="center"
      alignItems="center"
      style={{ borderRadius: '16px', background: isDark ? '#18171A' : theme.colors.background }}
    >
      <ShieldCheckIcon width={17} height={17} color={theme.colors.positive60} />
      {t('Wallets with MEV Protection')}
      <LinkExternal showExternalIcon={false} color="primary60" href={mevDocLink} fontSize="12px" fontWeight="400">
        {t('Learn More')}
      </LinkExternal>
    </Row>
  )
}

function DesktopModal<T>({
  wallets: wallets_,
  topWallets: topWallets_,
  previouslyUsedWallets,
  connectWallet,
  onWalletConnected,
  docLink,
  docText,
  mevDocLink,
  onOpenSocialLoginModal,
}: Pick<WalletModalV2Props<T>, 'wallets' | 'topWallets' | 'docLink' | 'docText' | 'mevDocLink'> & {
  connectWallet: (wallet: WalletConfigV2<T>) => void
  onWalletConnected: (wallet: WalletConfigV2<T>, connectData?: ConnectData) => void
  previouslyUsedWallets: WalletConfigV2<T>[]
  onOpenSocialLoginModal: () => void
}) {
  const wallets: WalletConfigV2<T>[] = useMemo(
    () =>
      wallets_.filter((w) => {
        return w.installed !== false || (!w.installed && (w.guide || w.downloadLink || w.qrCode))
      }),
    [wallets_],
  )

  const topWallets: WalletConfigV2<T>[] = useMemo(
    () =>
      topWallets_.filter((w) => {
        return w.installed !== false || (!w.installed && (w.guide || w.downloadLink || w.qrCode))
      }),
    [topWallets_],
  )

  const preWallets: WalletConfigV2<T>[] = useMemo(
    () =>
      previouslyUsedWallets.filter((w) => {
        return w.installed !== false || (!w.installed && (w.guide || w.downloadLink || w.qrCode))
      }),
    [previouslyUsedWallets],
  )

  const [selected] = useSelectedWallet()
  const [[evmError, solanaError]] = useAtom(errorAtom)
  const error = evmError || solanaError
  const [qrCode, setQrCode] = useState<string | undefined>(undefined)
  const { t } = useTranslation()

  const onWalletSelected = useCallback(
    (w: WalletConfigV2<T>) => {
      connectWallet(w)
      setQrCode(undefined)
      if (w.qrCode) {
        w.qrCode(() => onWalletConnected(w)).then(
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
    <Grid gridTemplateColumns="1fr 1fr">
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

        <SocialLoginButton onClick={onOpenSocialLoginModal} assetCdn={ASSET_CDN} />

        <WalletSelect
          wallets={wallets}
          topWallets={topWallets}
          previouslyUsedWallets={preWallets}
          displayCount="all"
          onClick={onWalletSelected}
        />
        {/* {mevDocLink ? <MEVSection mevDocLink={mevDocLink} /> : null} */}
      </AtomBox>
      <AtomBox
        flex={1}
        px="16px"
        display={{
          xs: 'none',
          sm: 'flex',
        }}
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <AtomBox
          display="flex"
          flexDirection="column"
          alignItems="center"
          style={{ gap: '12px' }}
          textAlign="center"
          width="100%"
        >
          {!selected && <Intro docLink={docLink} />}
          {selected && selected.installed !== false && (
            <>
              {typeof selected.icon === 'string' && <Image src={selected.icon} width={108} height={108} />}
              <Heading as="h1" fontSize="20px" color="secondary">
                {t('Opening')} {selected.title}
              </Heading>
              {error ? (
                <ErrorContent message={error} onRetry={() => connectWallet(selected)} />
              ) : (
                <Text>{t('Please confirm in %wallet%', { wallet: selected.title })}</Text>
              )}
            </>
          )}
          {selected && selected.installed === false && <NotInstalled qrCode={qrCode} wallet={selected} />}
        </AtomBox>
      </AtomBox>
    </Grid>
  )
}

export function WalletModalV2<T = EvmConnectorNames | SolanaConnectorNames>(props: WalletModalV2Props<T>) {
  const {
    wallets: walletsTemp1,
    topWallets: topWalletsTemp,
    login,
    docLink,
    docText,
    onWalletConnectCallBack,
    fullSize,
    mevDocLink,
    ...rest
  } = props
  const wallets_ = getWalletsConfig()
  const topWallets_ = TOP_WALLETS_ID_CONFIG.MultiChain.map((id) => wallets_.find((w) => w.id === id))

  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false)

  const { isMobile } = useMatchBreakpoints()
  // TODO @ChefJerry, add previouslyUsedSolanaWalletsAtom support
  const [previouslyUsedEvmWalletsId] = useAtom(previouslyUsedEvmWalletsAtom)
  const previouslyUsedEvmWallets = useMemo(
    () =>
      previouslyUsedEvmWalletsId
        .map((id) => wallets_.find((w) => w.id === id))
        .filter<WalletConfigV3<EvmConnectorNames | SolanaConnectorNames>>(
          (w): w is WalletConfigV3<EvmConnectorNames | SolanaConnectorNames> => Boolean(w),
        ),
    [wallets_, previouslyUsedEvmWalletsId],
  )

  const topWallets = useMemo(
    () => topWallets_.filter((w) => !previouslyUsedEvmWalletsId.includes(w.id)),
    [previouslyUsedEvmWalletsId, topWallets_],
  )

  const wallets = useMemo(
    () =>
      sortWallets(
        wallets_.filter((i) => !topWallets.some((t) => t.id === i.id) && !previouslyUsedEvmWalletsId.includes(i.id)),
        null,
      ),
    [wallets_, topWallets, previouslyUsedEvmWalletsId],
  )

  // TODO @ChefJerry, add previouslyUsedSolanaWalletsAtom support
  const [, setSelectedEvmWallet] = useSelectedEvmWallet()
  const [, setLastUsedEvmWallet] = useAtom(lastUsedEvmWalletNameAtom)
  const [, setError] = useAtom(errorAtom)
  const { t } = useTranslation()

  const imageSources = useMemo(
    () =>
      wallets
        .map((w) => w.icon)
        .filter((icon) => typeof icon === 'string')
        .concat('https://cdn.pancakeswap.com/wallets/wallet_intro.png') as string[],
    [wallets],
  )

  usePreloadImages(imageSources.slice(0, MOBILE_DEFAULT_DISPLAY_COUNT))

  const handleWalletConnected = useCallback(
    (wallet: WalletConfigV2<T>, connectData?: ConnectData) => {
      setLastUsedEvmWallet(wallet.id)
      try {
        onWalletConnectCallBack?.(wallet.title, connectData?.accounts?.[0])
      } catch (e) {
        console.error(wallet.title, e)
      }
    },
    [onWalletConnectCallBack, setLastUsedEvmWallet],
  )

  const connectWallet = useCallback(
    (wallet: WalletConfigV2<T>) => {
      setSelectedEvmWallet(wallet)
      // TODO @ChefJerry, set evmError and solanaError separately
      setError(['', ''])
      if (wallet.installed !== false) {
        login(wallet.connectorId)
          .then((v) => {
            if (v) {
              handleWalletConnected(wallet, v)
            }
          })
          .catch((err) => {
            if (err instanceof WalletConnectorNotFoundError) {
              setError([t('no provider found'), ''])
            } else if (err instanceof WalletSwitchChainError) {
              setError([err.message, ''])
            } else {
              setError([t('Error connecting, please authorize wallet to access.'), ''])
            }
          })
      }
    },
    [handleWalletConnected, login, setError, setSelectedEvmWallet, t],
  )

  const mobileContainerStyle: React.CSSProperties = isMobile ? { height: '100%', borderRadius: 0 } : {}

  const handleOpenSocialLoginModal = () => {
    setIsSocialLoginModalOpen(true)
    // Keep the main modal open to maintain BodyLock
  }

  const handleCloseSocialLoginModal = () => {
    setIsSocialLoginModalOpen(false)
    // Main modal content will automatically show again due to conditional display: none
    // This maintains the BodyLock properly
  }

  const handleBackToWeb3Wallet = () => {
    // Close social login modal to return to wallet modal
    setIsSocialLoginModalOpen(false)
  }

  // Wrap social login callbacks to ensure proper modal cleanup
  const handleSocialLoginWithCleanup = (originalCallback?: () => void) => {
    return () => {
      // Close both modals when social login is initiated
      setIsSocialLoginModalOpen(false)
      props.onDismiss?.()

      // Execute the original callback
      originalCallback?.()
    }
  }

  return (
    <>
      <Suspense>
        <SocialLoginModal
          isOpen={isSocialLoginModalOpen}
          onDismiss={handleCloseSocialLoginModal}
          onGoogleLogin={handleSocialLoginWithCleanup(props.onGoogleLogin)}
          onXLogin={handleSocialLoginWithCleanup(props.onXLogin)}
          onTelegramLogin={handleSocialLoginWithCleanup(props.onTelegramLogin)}
          onDiscordLogin={handleSocialLoginWithCleanup(props.onDiscordLogin)}
          onBackToWeb3Wallet={handleBackToWeb3Wallet}
        />
      </Suspense>
      <ModalV2 closeOnOverlayClick disableOutsidePointerEvents={false} {...rest}>
        <ModalWrapper
          onDismiss={props.onDismiss}
          containerStyle={{ border: 'none', ...mobileContainerStyle }}
          style={{
            overflow: 'visible',
            border: 'none',
            ...mobileContainerStyle,
            ...(isSocialLoginModalOpen ? { display: 'none' } : {}),
          }}
        >
          <AtomBox position="relative">
            <TabContainer fullSize={fullSize} onDismiss={props.onDismiss}>
              {isMobile ? (
                <MobileModal
                  mevDocLink={mevDocLink}
                  connectWallet={connectWallet}
                  topWallets={topWallets as WalletConfigV3<T>[]}
                  previouslyUsedWallets={previouslyUsedEvmWallets as WalletConfigV2<T>[]}
                  wallets={wallets as WalletConfigV2<T>[]}
                  docLink={docLink}
                  docText={docText}
                  onOpenSocialLoginModal={handleOpenSocialLoginModal}
                />
              ) : (
                <DesktopModal
                  mevDocLink={mevDocLink}
                  connectWallet={connectWallet}
                  onWalletConnected={handleWalletConnected}
                  topWallets={topWallets as WalletConfigV3<T>[]}
                  previouslyUsedWallets={previouslyUsedEvmWallets as WalletConfigV2<T>[]}
                  wallets={wallets as WalletConfigV2<T>[]}
                  docLink={docLink}
                  docText={docText}
                  onOpenSocialLoginModal={handleOpenSocialLoginModal}
                />
              )}
            </TabContainer>
          </AtomBox>
        </ModalWrapper>
      </ModalV2>
    </>
  )
}

const StyledIntroCard = styled(Card)`
  width: 100%;
`

const Intro = ({ docLink }: { docLink: string }) => {
  const { t } = useTranslation()
  return (
    <>
      <Image src={`${ASSET_CDN}/web/wallet-ui/intro.png`} width={150} height={228.72} />
      <StyledIntroCard>
        <CardBody p="16px">
          <Text textAlign="left" color="textSubtle" fontSize="12px">
            {t('Manage and store your private keys and assets securely.')}
          </Text>

          <AutoRow gap="8px" mt="4px">
            <Button as="a" color="backgroundAlt" variant="text" href={docLink} scale="xs" p="0">
              {t('How to connect')}
            </Button>
            <Text color="disabled" fontSize="12px">
              |
            </Text>
            <Button
              as="a"
              color="backgroundAlt"
              variant="text"
              href="https://pancakeswap.finance/terms-of-service"
              scale="xs"
              p="0"
            >
              {t('Disclaimer')}
            </Button>
          </AutoRow>
        </CardBody>
      </StyledIntroCard>
    </>
  )
}

const NotInstalled = ({ wallet, qrCode }: { wallet: WalletConfigV2; qrCode?: string }) => {
  const { t } = useTranslation()
  return (
    <>
      <Heading as="h1" fontSize="20px" color="secondary">
        {t('%wallet% is not installed', { wallet: wallet.title })}
      </Heading>
      {qrCode && (
        <Suspense>
          <AtomBox overflow="hidden" borderRadius="card" style={{ width: '288px', height: '288px' }}>
            <Qrcode url={qrCode} image={typeof wallet.icon === 'string' ? wallet.icon : undefined} />
          </AtomBox>
        </Suspense>
      )}
      {!qrCode && !wallet.isNotExtension && (
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
    </>
  )
}

const ErrorMessage = ({ message }: { message: string }) => (
  <Text bold color="failure">
    <WarningIcon width="16px" color="failure" style={{ verticalAlign: 'middle' }} /> {message}
  </Text>
)

const ErrorContent = ({ onRetry, message }: { onRetry: () => void; message: string }) => {
  const { t } = useTranslation()
  return (
    <>
      <ErrorMessage message={message} />
      <Button variant="subtle" onClick={onRetry}>
        {t('Retry')}
      </Button>
    </>
  )
}

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
