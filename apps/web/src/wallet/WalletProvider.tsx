import { isInBinance } from '@binance/w3w-utils'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { createW3WWagmiConfig, createWagmiConfig } from 'utils/wagmi'
import { WagmiProvider } from 'wagmi'
import { W3WConfigProvider } from 'contexts/W3WConfigContext'
import { SOLANA_SUPPORTED_PATH } from './solana.config'

interface WalletProviderProps {
  reconnectOnMount?: boolean
  children?: React.ReactNode
}

export const eip6963Providers: any[] = []

const SolanaProviders = dynamic(() => import('./SolanaProvider').then((m) => m.SolanaProvider), { ssr: false })

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

export const WalletProvider = (props: WalletProviderProps) => {
  const { children } = props
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const wagmiConfig = useMemo(
    () => (typeof window !== 'undefined' && isInBinance() ? createW3WWagmiConfig() : createWagmiConfig()),
    [],
  )

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

  if (!ready) {
    return null // or a loading spinner
  }

  const needSolanaProvider = SOLANA_SUPPORTED_PATH.includes(router.pathname)

  return (
    <WagmiProvider reconnectOnMount config={wagmiConfig}>
      <W3WConfigProvider value={isInBinance()}>
        {needSolanaProvider ? <SolanaProviders>{children}</SolanaProviders> : children}
      </W3WConfigProvider>
    </WagmiProvider>
  )
}
