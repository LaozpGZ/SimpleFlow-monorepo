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
  console.log('[PrivyWalletAddress] Hook initialized')
  const { address: wagmiAddress, connector } = useAccount()
  const { client: smartWalletClient } = useSmartWallets()
  const { ready, authenticated, user } = usePrivy()
  const connectors = useConnectors()
  const { isSmartWalletReady, isSettingUp, shouldUseAAWallet, hasSetupFailed } = useEmbeddedSmartAccountConnectorV2()

  const [finalAddress, setFinalAddress] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [addressType, setAddressType] = useState<'embedded' | 'smart' | null>(null)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  // Track loading time to prevent infinite loading
  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now())
      console.log('[PrivyWalletAddress] Loading started at:', new Date().toISOString())
    } else if (!isLoading && loadingStartTime) {
      const loadingDuration = (Date.now() - loadingStartTime) / 1000
      console.log(`[PrivyWalletAddress] Loading completed after ${loadingDuration.toFixed(2)} seconds`)
      setLoadingStartTime(null)
    }
  }, [isLoading, loadingStartTime])

  // Global timeout to prevent infinite loading (10 seconds)
  useEffect(() => {
    if (loadingStartTime) {
      const timeoutId = setTimeout(() => {
        const loadingDuration = (Date.now() - loadingStartTime) / 1000
        console.error(`[PrivyWalletAddress] ⚠️ Loading timeout after ${loadingDuration.toFixed(2)} seconds!`)
        console.error('[PrivyWalletAddress] Forcing error state to prevent infinite loading')

        // Force stop loading and show error state
        setIsLoading(false)
        setFinalAddress(undefined)
        setAddressType(null)
      }, 10000) // 10 seconds global timeout

      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [loadingStartTime])

  useEffect(() => {
    const determineAddress = async () => {
      console.log('[PrivyWalletAddress] Determining address...', {
        ready,
        authenticated,
        hasUser: !!user,
        hasWallet: !!user?.wallet,
        wagmiAddress,
        shouldUseAAWallet,
        isSmartWalletReady,
        isSettingUp,
        hasSetupFailed,
        currentConnectorId: connector?.id,
        timestamp: new Date().toISOString(),
      })

      // HIGHEST PRIORITY: If we have AA wallet connected with address, show it immediately
      if (connector?.id === 'io.privy.smart_wallet' && wagmiAddress) {
        console.log('[PrivyWalletAddress] ✅ AA wallet connected with address! Showing immediately', { wagmiAddress })
        setFinalAddress(wagmiAddress)
        setAddressType('smart')
        setIsLoading(false) // Force stop loading
        return // Exit early, don't check anything else
      }

      // If Privy is not ready or user is not authenticated, keep loading state
      if (!ready || !authenticated) {
        console.log('[PrivyWalletAddress] ⏳ Privy not ready or not authenticated')
        setIsLoading(true)
        setFinalAddress(undefined)
        setAddressType(null)
        return
      }

      // If AA wallet is disabled via URL param, use embedded wallet directly
      if (!shouldUseAAWallet) {
        if (user?.wallet && wagmiAddress) {
          console.log('[PrivyWalletAddress] ✅ Using embedded wallet (AA disabled)', { wagmiAddress })
          setFinalAddress(wagmiAddress)
          setAddressType('embedded')
          setIsLoading(false)
        } else if (user?.wallet) {
          // Has wallet but address not ready yet
          console.log('[PrivyWalletAddress] ⏳ Has wallet but address not ready')
          setIsLoading(true)
        } else {
          // No wallet
          console.log('[PrivyWalletAddress] ⚠️ No wallet found')
          setFinalAddress(undefined)
          setAddressType(null)
          setIsLoading(false)
        }
        return
      }

      // If smart wallet connector is being set up, wait for completion
      if (isSettingUp) {
        console.log('[PrivyWalletAddress] ⏳ Smart wallet is being set up...')
        setIsLoading(true)
        return
      }

      // If smart wallet is not ready yet, wait
      if (!isSmartWalletReady) {
        console.log('[PrivyWalletAddress] ⏳ Smart wallet not ready yet')
        setIsLoading(true)
        return
      }

      // Only use smart wallet - no fallback to embedded wallet
      const smartAccountConnector = connectors.find((c) => c.id === 'io.privy.smart_wallet')
      console.log('[PrivyWalletAddress] Smart account connector check:', {
        hasConnector: !!smartAccountConnector,
        currentConnectorId: connector?.id,
        wagmiAddress,
      })

      if (smartAccountConnector) {
        // Smart wallet exists but not yet connected (we already handled the connected case above)
        // Keep waiting for connection
        console.warn('[PrivyWalletAddress] ⚠️ Smart wallet exists but not connected, waiting...', {
          connectorId: connector?.id,
          hasAddress: !!wagmiAddress,
        })
        setIsLoading(true)
      } else if (user?.wallet) {
        // User has wallet but no smart wallet connector available
        // Keep loading state to force smart wallet setup
        console.warn('[PrivyWalletAddress] ⚠️ User has wallet but no smart wallet connector, waiting for setup...')
        setIsLoading(true)
      } else {
        // No wallet at all
        console.log('[PrivyWalletAddress] ⚠️ No wallet at all')
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
