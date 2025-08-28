import { usePrivy } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
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
  const { isSmartWalletReady, isSettingUp, shouldUseAAWallet, hasSetupFailed } = useEmbeddedSmartAccountConnectorV2()

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

      // If AA wallet is disabled via URL param, use embedded wallet directly
      if (!shouldUseAAWallet) {
        if (user?.wallet && wagmiAddress) {
          setFinalAddress(wagmiAddress)
          setAddressType('embedded')
          setIsLoading(false)
        } else if (user?.wallet) {
          // Has wallet but address not ready yet
          setIsLoading(true)
        } else {
          // No wallet
          setFinalAddress(undefined)
          setAddressType(null)
          setIsLoading(false)
        }
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

      // Only use smart wallet - no fallback to embedded wallet
      const smartAccountConnector = connectors.find((c) => c.id === 'io.privy.smart_wallet')

      if (smartAccountConnector) {
        if (connector?.id === 'io.privy.smart_wallet' && wagmiAddress) {
          // Successfully connected to smart wallet
          setFinalAddress(wagmiAddress)
          setAddressType('smart')
          setIsLoading(false)
        } else {
          // Smart wallet exists but not yet connected, keep waiting
          // No timeout - force users to wait for AA wallet
          setIsLoading(true)
        }
      } else if (user?.wallet) {
        // User has wallet but no smart wallet connector available
        // Keep loading state to force smart wallet setup
        setIsLoading(true)
      } else {
        // No wallet at all
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
    shouldUseAAWallet,
  ])

  return {
    address: finalAddress as Address | undefined,
    isLoading,
    addressType,
    // Additional status information
    hasSmartWallet: !!smartWalletClient,
    isSmartWalletReady,
    isSettingUp,
    hasSetupFailed,
  }
}
