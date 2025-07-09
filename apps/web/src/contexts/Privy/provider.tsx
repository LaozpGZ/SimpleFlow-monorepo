import { usePrivy } from '@privy-io/react-auth'
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { PropsWithChildren, useEffect } from 'react'
import { type WagmiProviderProps } from 'wagmi'

const lastWalletRecoveryAtom = atomWithStorage('lastWalletRecovery', 0)

export function WagmiWithPrivyProvider({ children, ...props }: PropsWithChildren<WagmiProviderProps>) {
  const { authenticated, ready, user, createWallet, setWalletRecovery, enrollInMfa } = usePrivy()
  const [lastRecovery, setLastRecovery] = useAtom(lastWalletRecoveryAtom)

  useEffect(() => {
    if (ready && authenticated && !user?.wallet) {
      createWallet()
    }

    // if (user?.wallet?.recoveryMethod === 'privy') {
    //   const now = Date.now()
    //   const oneWeek = 7 * 24 * 60 * 60 * 1000

    //   if (now - lastRecovery > oneWeek) {
    //     setWalletRecovery()
    //     setLastRecovery(now)
    //   }
    // }
    // if (user?.mfaMethods?.length === 0) {
    //   enrollInMfa(true)
    // }
  }, [ready, user, authenticated, lastRecovery, setLastRecovery])

  return <PrivyWagmiProvider {...props}>{children}</PrivyWagmiProvider>
}
