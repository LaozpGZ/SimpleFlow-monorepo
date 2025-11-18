import { useTranslation } from '@pancakeswap/localization'
import { MultichainWalletModal } from '@pancakeswap/ui-wallets'
import { createQrCode, getDocLink } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'

import { ChainId } from '@pancakeswap/chains'
import { useFirebaseAuth } from 'wallet/Privy/firebase'
import { useCallback, useMemo } from 'react'
import { logGTMWalletConnectedEvent } from 'utils/customGTMEventTracking'
import { useConnect } from 'wagmi'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { getWalletsConfig, getTopWalletsConfig } from '@pancakeswap/ui-wallets/src/config/wallets'
import { WalletIds } from '@pancakeswap/ui-wallets/src/config/walletIds'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletFilterValue, useWalletFilterEffect } from '@pancakeswap/ui-wallets/src/state/hooks'

const WalletModalManager: React.FC<{ isOpen: boolean; onDismiss?: () => void }> = ({ isOpen, onDismiss }) => {
  const { login } = useAuth()
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()

  const docLink = useMemo(() => getDocLink(code), [code])

  const handleWalletConnect = useCallback(
    (connectedChainId: number | undefined, name?: string, address?: string) => {
      logGTMWalletConnectedEvent(connectedChainId ?? chainId, name, address)
    },
    [chainId],
  )

  const { loginWithGoogle, loginWithX, loginWithDiscord, loginWithTelegram } = useFirebaseAuth()

  const createEvmQrCode = useCallback(() => {
    return createQrCode(chainId || ChainId.BSC, connectAsync)
  }, [chainId, connectAsync])

  const { wallets: solanaWallets } = useWallet()
  useWalletFilterEffect({ evmAddress: evmAccount ?? undefined, solanaAddress: solanaAccount ?? undefined })
  const walletFilter = useWalletFilterValue()

  const wallets = useMemo(
    () => getWalletsConfig({ walletFilter, createEvmQrCode, solanaWalletAdapters: solanaWallets }),
    [walletFilter, createEvmQrCode, solanaWallets],
  )

  // Show Metamask, OKX and WalletConnect as top wallets when connected to Monad
  const topWallets = useMemo(() => {
    if (chainId === ChainId.MONAD_MAINNET) {
      return wallets.filter(
        (wallet) =>
          wallet.id === WalletIds.Metamask || wallet.id === WalletIds.Okx || wallet.id === WalletIds.Walletconnect,
      )
    }
    return getTopWalletsConfig(wallets, walletFilter)
  }, [chainId, wallets, walletFilter])

  return (
    <MultichainWalletModal
      evmAddress={evmAccount}
      solanaAddress={solanaAccount ?? undefined}
      docText={t('Learn How to Connect')}
      docLink={docLink}
      isOpen={isOpen}
      evmLogin={login}
      createEvmQrCode={createEvmQrCode}
      onDismiss={onDismiss}
      onWalletConnectCallBack={handleWalletConnect}
      onGoogleLogin={loginWithGoogle}
      onXLogin={loginWithX}
      onTelegramLogin={loginWithTelegram}
      onDiscordLogin={loginWithDiscord}
      topWallets={topWallets}
    />
  )
}

export default WalletModalManager
