import { usePrivy } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useEffect, useState } from 'react'
import { useAccount, useConnectors } from 'wagmi'
import { useEmbeddedSmartAccountConnectorV2 } from './usePrivySmartAccountConnector'

/**
 * Unified hook for managing Privy wallet address display
 * Prevents flickering between embedded wallet and smart wallet addresses
 */
export const usePrivyWalletAddress = () => {
  const { address: wagmiAddress, connector } = useAccount()
  const { client: smartWalletClient } = useSmartWallets()
  const { ready, authenticated, user } = usePrivy()
  const connectors = useConnectors()
  const { isSmartWalletReady, isSettingUp } = useEmbeddedSmartAccountConnectorV2()

  const [finalAddress, setFinalAddress] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [addressType, setAddressType] = useState<'embedded' | 'smart' | null>(null)

  useEffect(() => {
    const determineAddress = async () => {
      // If Privy is not ready or user is not authenticated, keep loading state
      if (!ready || !authenticated) {
        setIsLoading(true)
        setFinalAddress(undefined)
        setAddressType(null)
        return
      }

      // If smart wallet connector is being set up, wait for completion
      if (isSettingUp) {
        setIsLoading(true)
        return
      }

      // If smart wallet is not ready yet, wait
      if (!isSmartWalletReady) {
        setIsLoading(true)
        return
      }

      // Check if smart account connector exists
      const smartAccountConnector = connectors.find((c) => c.id === 'io.privy.smart_wallet')

      if (smartAccountConnector && connector?.id === 'io.privy.smart_wallet') {
        // Use smart wallet address
        if (wagmiAddress) {
          setFinalAddress(wagmiAddress)
          setAddressType('smart')
          setIsLoading(false)
        }
      } else if (user?.wallet && wagmiAddress) {
        // Use embedded wallet address
        setFinalAddress(wagmiAddress)
        setAddressType('embedded')
        setIsLoading(false)
      } else if (user?.wallet) {
        // Has embedded wallet but wagmi address is not ready yet
        setIsLoading(true)
      } else {
        // No wallet
        setFinalAddress(undefined)
        setAddressType(null)
        setIsLoading(false)
      }
    }

    determineAddress()
  }, [
    ready,
    authenticated,
    user,
    smartWalletClient,
    wagmiAddress,
    connector,
    connectors,
    isSmartWalletReady,
    isSettingUp,
  ])

  return {
    address: finalAddress,
    isLoading,
    addressType,
    // Additional status information
    hasSmartWallet: !!smartWalletClient,
    isSmartWalletReady,
    isSettingUp,
  }
}
