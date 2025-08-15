import { useTranslation } from '@pancakeswap/localization'
import {
  LegacyWalletModal,
  LegacyWalletConfig,
  MultichainWalletModal,
  SolanaConnectorNames,
} from '@pancakeswap/ui-wallets'
import { ConnectorNames, createQrCode, createWallets, getDocLink, mevDocLink, TOP_WALLET_MAP } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'

import { ChainId } from '@pancakeswap/chains'
import { useFirebaseAuth } from 'wallet/Privy/firebase'
import { useCallback, useMemo } from 'react'
import { logGTMWalletConnectedEvent } from 'utils/customGTMEventTracking'
import { useConnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletName } from '@solana/wallet-adapter-base'
import useAccountActiveChain from 'hooks/useAccountActiveChain'

const WalletModalManager: React.FC<{ isOpen: boolean; onDismiss?: () => void }> = ({ isOpen, onDismiss }) => {
  const { login } = useAuth()
  const { select } = useWallet()
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()

  const docLink = useMemo(() => getDocLink(code), [code])

  const wallets = useMemo(() => createWallets(chainId || ChainId.BSC, connectAsync), [chainId, connectAsync])
  const topWallets = useMemo(
    () =>
      TOP_WALLET_MAP[chainId]
        ? TOP_WALLET_MAP[chainId]
            .map((id) => wallets.find((w) => w.id === id))
            .filter<LegacyWalletConfig<ConnectorNames>>((w): w is LegacyWalletConfig<ConnectorNames> => Boolean(w))
        : [],
    [wallets, chainId],
  )

  const handleWalletConnect = useCallback(
    (name?: string, address?: string) => {
      logGTMWalletConnectedEvent(chainId, name, address)
    },
    [chainId],
  )

  const { loginWithGoogle, loginWithX, isLoading, loginWithDiscord, loginWithTelegram } = useFirebaseAuth()

  const createEvmQrCode = useCallback(() => {
    return createQrCode(chainId || ChainId.BSC, connectAsync)
  }, [chainId, connectAsync])

  const solanaLogin = useCallback(
    (walletName: WalletName) => {
      return select(walletName)
    },
    [select],
  )

  return (
    <MultichainWalletModal
      evmAddress={evmAccount}
      solanaAddress={solanaAccount ?? undefined}
      docText={t('Learn How to Connect')}
      docLink={docLink}
      isOpen={isOpen}
      evmLogin={login}
      createEvmQrCode={createEvmQrCode}
      solanaLogin={solanaLogin}
      onDismiss={onDismiss}
      onWalletConnectCallBack={handleWalletConnect}
      onGoogleLogin={loginWithGoogle}
      onXLogin={loginWithX}
      onTelegramLogin={loginWithTelegram}
      onDiscordLogin={loginWithDiscord}
    />
  )
}

export default WalletModalManager
