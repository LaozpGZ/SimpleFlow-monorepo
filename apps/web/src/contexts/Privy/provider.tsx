import { isInBinance } from '@binance/w3w-utils'
import { usePrivy } from '@privy-io/react-auth'
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
import { W3WConfigProvider } from 'contexts/W3WConfigContext'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createW3WWagmiConfig, createWagmiConfig } from 'utils/wagmi'
import { type WagmiProviderProps } from 'wagmi'
import { SOLANA_SUPPORTED_PATH } from 'wallet/solana.config'
import { eip6963Providers } from 'wallet/WalletProvider'

// Store recovery times per smart wallet address
const walletRecoveryRecordsAtom = atomWithStorage<Record<string, number>>('pcs:socialLogin:walletRecoveryRecords', {})

const SolanaProviders = dynamic(() => import('wallet/SolanaProvider').then((m) => m.SolanaProvider), { ssr: false })

export function WagmiWithPrivyProvider({ children }: PropsWithChildren) {
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

            const { retriggerFirebaseAuth } = await import('./firebase')
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
  return ready
}
