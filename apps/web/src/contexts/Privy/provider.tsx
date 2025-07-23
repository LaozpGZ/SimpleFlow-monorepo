import { usePrivy } from '@privy-io/react-auth'
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { type WagmiProviderProps } from 'wagmi'

const lastWalletRecoveryAtom = atomWithStorage('lastWalletRecovery', 0)

export function WagmiWithPrivyProvider({ children, ...props }: PropsWithChildren<WagmiProviderProps>) {
  const { authenticated, ready, user, createWallet, setWalletRecovery, logout: privyLogout, login } = usePrivy()
  const [lastRecovery, setLastRecovery] = useAtom(lastWalletRecoveryAtom)
  const attemptedWalletCreation = useRef(false)

  const handleWalletRecovery = useCallback(() => {
    if (authenticated && ready && user?.wallet?.recoveryMethod === 'privy' && user?.smartWallet) {
      const now = Date.now()
      const oneWeek = 7 * 24 * 60 * 60 * 1000

      if (now - lastRecovery > oneWeek) {
        setWalletRecovery()
        setLastRecovery(now)
      }
    }
  }, [ready, user, authenticated, lastRecovery, setWalletRecovery])

  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address && user?.smartWallet?.address) {
      console.log('Wallet recovery for authenticated user called!@!!?!?!?!?')
      handleWalletRecovery()
    }
  }, [ready, authenticated, user?.wallet])

  useEffect(() => {
    const createWalletWithUserManagedRecovery = async () => {
      if (ready && authenticated && user?.wallet === undefined && attemptedWalletCreation.current === false) {
        attemptedWalletCreation.current = true
        console.log('Creating wallet for authenticated user without wallet')
        try {
          await createWallet()
          console.log('Wallet created successfully')
        } catch (error) {
          console.error('Failed to create wallet, retriggering auth lifecycle:', error)

          try {
            console.log('Attempting to retrigger Privy authentication...')

            // Clear only Privy-related localStorage items
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
              console.log('Cleared Privy localStorage:', key)
            })

            // Import Firebase auth context to retrigger token
            const { retriggerFirebaseAuth } = await import('./firebase')
            await retriggerFirebaseAuth()
            console.log('Firebase auth retriggered')
          } catch (logoutError) {
            console.error('Failed to retrigger auth:', logoutError)
          }

          // Reset flag to allow retry after re-authentication
          attemptedWalletCreation.current = false
        }
      }
    }
    createWalletWithUserManagedRecovery()
  }, [ready, user, authenticated, createWallet, setLastRecovery])

  return <PrivyWagmiProvider {...props}>{children}</PrivyWagmiProvider>
}
