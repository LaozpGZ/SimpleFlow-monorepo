import { isInBinance } from '@binance/w3w-utils'
<<<<<<<< HEAD:apps/web/src/wallet/WalletProvider.tsx
import { useSyncWalletState } from 'hooks/useAccountActiveChain'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { createW3WWagmiConfig, createWagmiConfig } from 'utils/wagmi'
========
import { usePrivy } from '@privy-io/react-auth'
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
import { W3WConfigProvider } from 'contexts/W3WConfigContext'
>>>>>>>> 39933d1d3 (rebase develop):apps/web/src/contexts/Privy/provider.tsx
import { useAtom } from 'jotai'
import { usePrivy } from '@privy-io/react-auth'
import { atomWithStorage } from 'jotai/utils'
<<<<<<<< HEAD:apps/web/src/wallet/WalletProvider.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
import { SOLANA_SUPPORTED_PATH } from './solana.config'
import { W3WConfigProvider } from './W3WConfigContext'

interface WalletProviderProps {
  reconnectOnMount?: boolean
  children?: React.ReactNode
}

export const eip6963Providers: any[] = []
========
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createW3WWagmiConfig, createWagmiConfig } from 'utils/wagmi'
import { type WagmiProviderProps } from 'wagmi'
import { SOLANA_SUPPORTED_PATH } from 'wallet/solana.config'
import { eip6963Providers } from 'wallet/WalletProvider'
>>>>>>>> 39933d1d3 (rebase develop):apps/web/src/contexts/Privy/provider.tsx

const walletRecoveryRecordsAtom = atomWithStorage<Record<string, number>>('pcs:socialLogin:walletRecoveryRecords', {})

<<<<<<<< HEAD:apps/web/src/wallet/WalletProvider.tsx
const SolanaProviders = dynamic(() => import('./SolanaProvider').then((m) => m.SolanaProvider), { ssr: false })

const usePrivyProvider = () => {
========
const SolanaProviders = dynamic(() => import('wallet/SolanaProvider').then((m) => m.SolanaProvider), { ssr: false })

export function WagmiWithPrivyProvider({ children }: PropsWithChildren) {
>>>>>>>> 39933d1d3 (rebase develop):apps/web/src/contexts/Privy/provider.tsx
  const { authenticated, ready, user, createWallet, setWalletRecovery, logout: privyLogout, login } = usePrivy()
  const [recoveryRecords, setRecoveryRecords] = useAtom(walletRecoveryRecordsAtom)
  const router = useRouter()
  const attemptedWalletCreation = useRef(false)
  const wagmiConfig = useMemo(
    () => (typeof window !== 'undefined' && isInBinance() ? createW3WWagmiConfig() : createWagmiConfig()),
    [],
  )
  const eip6963Ready = useEip6963Provider()

  const handleWalletRecovery = useCallback(() => {
    const smartWalletAddress = user?.smartWallet?.address
    const lastRecoveryForThisWallet = smartWalletAddress ? recoveryRecords[smartWalletAddress] || 0 : 0

    if (authenticated && ready && user?.wallet?.recoveryMethod === 'privy' && user?.smartWallet && smartWalletAddress) {
      const now = Date.now()
      const oneWeek = 7 * 24 * 60 * 60 * 1000
      const timeSinceLastRecovery = now - lastRecoveryForThisWallet
      const shouldTriggerRecovery = timeSinceLastRecovery > oneWeek

      if (shouldTriggerRecovery) {
        setWalletRecovery()

        // Update recovery record for this specific wallet address
        setRecoveryRecords((prev) => ({
          ...prev,
          [smartWalletAddress]: now,
        }))
      }
    }
  }, [ready, user, authenticated, recoveryRecords])

  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address && user?.smartWallet?.address) {
      handleWalletRecovery()
    }
  }, [ready, authenticated, user?.wallet])

  useEffect(() => {
    const createWalletWithUserManagedRecovery = async () => {
      if (ready && authenticated && user?.wallet === undefined && attemptedWalletCreation.current === false) {
        attemptedWalletCreation.current = true
        try {
          await createWallet()
        } catch (error) {
          console.error('Failed to create wallet, retriggering auth lifecycle:', error)
          try {
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.startsWith('privy:')) {
                // @ts-ignore
                keysToRemove.push(key)
              }
            }
            keysToRemove.forEach((key) => {
              localStorage.removeItem(key)
            })

            const { retriggerFirebaseAuth } = await import('contexts/Privy/firebase')
            await retriggerFirebaseAuth()
          } catch (logoutError) {
            console.error('Failed to retrigger auth:', logoutError)
          }
          attemptedWalletCreation.current = false
        }
      }
    }
    createWalletWithUserManagedRecovery()
  }, [ready, user, authenticated, createWallet])
<<<<<<<< HEAD:apps/web/src/wallet/WalletProvider.tsx
}

export const WalletProvider = (props: WalletProviderProps) => {
  const { children } = props
  const [ready, setReady] = useState(false)
  const router = useRouter()
  usePrivyProvider()
  const wagmiConfig = useMemo(
    () => (typeof window !== 'undefined' && isInBinance() ? createW3WWagmiConfig() : createWagmiConfig()),
    [ready],
  )

========

  if (!eip6963Ready) {
    return null
  }

  const needSolanaProvider = SOLANA_SUPPORTED_PATH.includes(router.pathname)
  return (
    <PrivyWagmiProvider config={wagmiConfig} reconnectOnMount>
      <W3WConfigProvider value={isInBinance()}>
        {needSolanaProvider ? <SolanaProviders>{children}</SolanaProviders> : children}
      </W3WConfigProvider>
    </PrivyWagmiProvider>
  )
}

const useEip6963Provider = () => {
  const [ready, setReady] = useState(false)
>>>>>>>> 39933d1d3 (rebase develop):apps/web/src/contexts/Privy/provider.tsx
  useEffect(() => {
    window.addEventListener('eip6963:announceProvider', (event: any) => {
      const { provider } = event.detail
      eip6963Providers.push(provider)
    })
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    setTimeout(() => {
      setReady(true)
    })
  }, [])
<<<<<<<< HEAD:apps/web/src/wallet/WalletProvider.tsx
  if (!ready) {
    return null // or a loading spinner
  }

  const needSolanaProvider = SOLANA_SUPPORTED_PATH.includes(router.pathname)

  return (
    <PrivyWagmiProvider reconnectOnMount config={wagmiConfig}>
      <W3WConfigProvider value={isInBinance()}>
        <Sync />
        {needSolanaProvider ? <SolanaProviders>{children}</SolanaProviders> : children}
      </W3WConfigProvider>
    </PrivyWagmiProvider>
  )
}

const Sync = () => {
  useSyncWalletState()
  return null
========
  return ready
>>>>>>>> 39933d1d3 (rebase develop):apps/web/src/contexts/Privy/provider.tsx
}
