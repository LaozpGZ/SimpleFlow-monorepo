import { AtomBox, Image } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { isMobile as isMobileDevice } from 'react-device-detect'
import { EvmConnectorNames, SolanaConnectorNames } from '../../config/connectorNames'
import { ASSET_CDN } from '../../config/url'
import { errorEvmAtom, errorSolanaAtom } from '../../state/atom'
import { useSelectedWallet } from '../../state/hooks'
import { WalletAdaptedNetwork, WalletConfigV3 } from '../../types'
import { ErrorMessage } from '../ErrorMessage'
import SocialLoginButton from '../SocialLoginButton'
import { WalletSelect } from '../WalletSelect/WalletSelect'
import { MultichainWalletModalProps } from './types'

export function MobileModal<T>({
  wallets,
  topWallets,
  previouslyUsedWallets,
  connectWallet,
  displaySocialLogin,
}: Pick<MultichainWalletModalProps, 'wallets' | 'topWallets'> & {
  connectWallet: (wallet: WalletConfigV3, network: WalletAdaptedNetwork) => void
  previouslyUsedWallets: [WalletConfigV3<EvmConnectorNames>[], WalletConfigV3<SolanaConnectorNames>[]]
  displaySocialLogin: () => void
}) {
  const selected = useSelectedWallet()
  const evmError = useAtomValue(errorEvmAtom)
  const solanaError = useAtomValue(errorSolanaAtom)
  // TODO @ChefJerry, display evmError and solanaError separately
  const error = evmError || solanaError

  const installedWallets: WalletConfigV3[] = useMemo(
    () =>
      [
        ...(wallets ?? []),
        ...(topWallets ?? []),
        ...(previouslyUsedWallets?.[0] ?? []),
        ...(previouslyUsedWallets?.[1] ?? []),
      ].filter((w) => w.installed),
    [wallets, topWallets, previouslyUsedWallets],
  )
  const filterFn = useCallback(
    (w: WalletConfigV3) => {
      return isMobileDevice
        ? installedWallets.length
          ? w.installed
          : w.installed !== false || w.deepLink
        : w.installed !== false || (!w.installed && (w.guide || w.downloadLink || w.qrCode))
    },
    [installedWallets.length],
  )

  const walletsToShow: WalletConfigV3[] = wallets?.filter(filterFn) ?? []
  const topWalletsToShow: WalletConfigV3[] = topWallets?.filter(filterFn) ?? []

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
        <SocialLoginButton onClick={displaySocialLogin} assetCdn={ASSET_CDN} style={{ marginBottom: '8px' }} />

        <WalletSelect
          style={{ height: `calc(100vh - 200px)` }}
          wallets={walletsToShow}
          topWallets={topWalletsToShow}
          previouslyUsedWallets={previouslyUsedWallets}
          onClick={(wallet, network) => {
            connectWallet(wallet, network)
            if (wallet.deepLink && wallet.installed === false) {
              window.open(wallet.deepLink, '_blank', 'noopener noreferrer')
            }
          }}
        />
      </AtomBox>
    </AtomBox>
  )
}
