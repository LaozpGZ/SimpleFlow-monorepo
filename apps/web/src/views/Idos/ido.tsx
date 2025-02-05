import type { Transport } from '@wagmi/core'
import { PUBLIC_NODES } from 'config/nodes'
import { useMemo } from 'react'
import { CLIENT_CONFIG } from 'utils/viem'
import { binanceWeb3WalletConnector, chains, injectedConnector, walletConnectConnector } from 'utils/wagmi'
import { createConfig, custom, fallback, http, WagmiProvider } from 'wagmi'
import CurrentIfo from './CurrentIfo'
import { useCurrentIDOConfig } from './hooks/ido/useCurrentIDOConfig'

const transports = chains.reduce((ts, chain) => {
  let httpStrings: string[] | readonly string[] = []

  httpStrings = PUBLIC_NODES[chain.id] ? PUBLIC_NODES[chain.id] : []

  const injectedTransport =
    typeof window !== 'undefined' && window.ethereum ? custom(window.ethereum as any) : undefined

  const allTransports = [injectedTransport, ...httpStrings.map((t: any) => http(t))].filter(Boolean) as Transport[]

  if (ts) {
    // eslint-disable-next-line no-param-reassign
    ts[chain.id] = fallback(allTransports)
    return ts
  }

  return {
    [chain.id]: fallback(allTransports),
  }
}, {} as Record<number, Transport>)

const createWagmiConfig = () => {
  return createConfig({
    chains,
    ssr: true,
    syncConnectedChain: true,
    transports,
    ...CLIENT_CONFIG,
    connectors: [injectedConnector, walletConnectConnector, binanceWeb3WalletConnector()],
  })
}

const Ido = () => {
  const currentIdoConfig = useCurrentIDOConfig()
  const wagmiConfig = useMemo(() => createWagmiConfig(), [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <CurrentIfo idoConfig={currentIdoConfig} />
    </WagmiProvider>
  )
}

export default Ido
