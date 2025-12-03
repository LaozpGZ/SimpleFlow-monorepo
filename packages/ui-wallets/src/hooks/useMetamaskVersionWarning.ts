import { useEffect, useState } from 'react'
import { useConnections, useConnectorClient } from 'wagmi'

/**
 * Metamask version < 13.3.0 has an issue that it can't connect to Solana and EVM at the same time.
 * This hook will check Metamask version and return true if it's less than 13.3.0.
 */

function isOutdatedVersion(current: string, minimum: string) {
  const a = current.split('.').map(Number)
  const b = minimum.split('.').map(Number)

  // Ensure major.minor.patch format
  while (a.length < 3) a.push(0)
  while (b.length < 3) b.push(0)

  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return true
    if (a[i] > b[i]) return false
  }

  return false
}

export const useMetamaskVersionWarning = () => {
  const connections = useConnections()
  const metaMask = connections.find((c) => c.connector.rdns?.includes?.('io.metamask'))?.connector
  const { data: walletClient } = useConnectorClient({ connector: metaMask })

  const [shouldShowMetamaskVersionWarning, toggleMetamaskVersionWarning] = useState<boolean>(false)

  useEffect(() => {
    walletClient?.request({ method: 'web3_clientVersion' }).then((clientVersion) => {
      // extract version
      const version =
        /MetaMask\/v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)/i.exec(clientVersion)?.[1] ?? null

      if (version && isOutdatedVersion(version, '13.3.0')) {
        toggleMetamaskVersionWarning(true)
      } else {
        toggleMetamaskVersionWarning(false)
      }
    })
  }, [walletClient])

  return shouldShowMetamaskVersionWarning
}
