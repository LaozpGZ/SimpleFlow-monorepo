import { usePrivy } from '@privy-io/react-auth'
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { type WagmiProviderProps } from 'wagmi'

const lastWalletRecoveryAtom = atomWithStorage('lastWalletRecovery', 0)

export function WagmiWithPrivyProvider({ children, ...props }: PropsWithChildren<WagmiProviderProps>) {
  const { authenticated, ready, user, createWallet, setWalletRecovery, enrollInMfa } = usePrivy()
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
    if (
      ready &&
      authenticated &&
      user?.wallet?.address &&
      user?.smartWallet?.address &&
      attemptedWalletCreation.current === false
    ) {
      handleWalletRecovery()
    }
  }, [ready, authenticated, user?.wallet])

  useEffect(() => {
    const createWalletWithUserManagedRecovery = async () => {
      if (ready && authenticated && !user?.wallet && !attemptedWalletCreation.current) {
        attemptedWalletCreation.current = true
        console.log('Creating wallet for authenticated user without wallet')
        try {
          await createWallet()
          console.log('Wallet created successfully')
          // Set lastRecovery to current time when wallet is created
          // This prevents immediate wallet recovery call and sets the timer for next week
          const now = Date.now()
          setLastRecovery(now)
          console.log('Last recovery time set to:', new Date(now).toISOString())
        } catch (error) {
          console.error('Failed to create wallet:', error)
          // Reset flag to allow retry
          attemptedWalletCreation.current = false
        }
      }
    }
    createWalletWithUserManagedRecovery()
  }, [ready, user, authenticated, createWallet, setLastRecovery])

  return <PrivyWagmiProvider {...props}>{children}</PrivyWagmiProvider>
}
