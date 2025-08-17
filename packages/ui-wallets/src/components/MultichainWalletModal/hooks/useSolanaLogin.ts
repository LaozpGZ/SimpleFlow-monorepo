import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import { errorSolanaAtom } from '../../../state/atom'

export const useSolanaLogin = () => {
  const { select, connected, publicKey } = useWallet()
  const solanaWalletError = useAtomValue(errorSolanaAtom)

  const promiseRef = useRef<{
    promise: Promise<string>
    resolve: (address: string) => void
    reject: (error: string) => void
  } | null>(null)

  useEffect(() => {
    if (solanaWalletError && promiseRef.current) {
      promiseRef.current.reject(solanaWalletError)
      promiseRef.current = null
    } else if (connected && publicKey && promiseRef.current) {
      promiseRef.current.resolve(publicKey.toBase58())
      promiseRef.current = null
    }
  }, [solanaWalletError, connected, publicKey])

  const solanaLogin = useCallback(async (walletName: WalletName) => {
    const { promise, resolve, reject } = Promise.withResolvers<string>()

    promiseRef.current = { promise, resolve, reject }

    select(walletName)

    return promise
  }, [])

  return solanaLogin
}
