import { useTranslation } from '@pancakeswap/localization'
import { WalletModalV2 } from '@pancakeswap/ui-wallets'
import { createWallets, getDocLink, TOP_WALLET_MAP } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'

import { ChainId } from '@pancakeswap/chains'
import { useMemo } from 'react'
import { logGTMWalletConnectEvent } from 'utils/customGTMEventTracking'
import { useConnect } from 'wagmi'

const WalletModalManager: React.FC<{ isOpen: boolean; onDismiss?: () => void }> = ({ isOpen, onDismiss }) => {
  const { login } = useAuth()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()

  const docLink = useMemo(() => getDocLink(code), [code])

  const wallets = useMemo(() => createWallets(chainId || ChainId.BSC, connectAsync), [chainId, connectAsync])
  const topWallets = useMemo(
    () => TOP_WALLET_MAP[chainId].map((id) => wallets.find((w) => w.id === id)),
    [wallets, chainId],
  )

  return (
    <WalletModalV2
      docText={t('Learn How to Connect')}
      docLink={docLink}
      isOpen={isOpen}
      wallets={wallets}
      topWallets={topWallets}
      login={login}
      onDismiss={onDismiss}
      onWalletConnectCallBack={logGTMWalletConnectEvent}
    />
  )
}

export default WalletModalManager
