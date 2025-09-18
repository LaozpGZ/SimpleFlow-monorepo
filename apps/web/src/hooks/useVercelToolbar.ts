import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { decrypt } from '@vercel/flags'

import { isVercelToolbarEnabled, shouldInjectVercelToolbar } from 'utils/vercelToolbar'
import { useSetExperimentalFeatures, type FeatureFlags } from './useExperimentalFeatureEnabled'

export function useShouldInjectVercelToolbar() {
  const [shouldInject] = useState(shouldInjectVercelToolbar())
  return shouldInject
}

export function useVercelToolbarEnabled() {
  const [enabled] = useState(isVercelToolbarEnabled())
  return enabled
}

export function useVercelFeatureFlagOverrides() {
  const setFlags = useSetExperimentalFeatures()
  useEffect(() => {
    const handleFlagOverrides = async () => {
      try {
        const overrideCookie = Cookies.get('vercel-flag-overrides')
        if (!overrideCookie) {
          return
        }

        let flagOverrides: Record<string, any> | undefined

        // Check if the cookie value looks like an encrypted JWE token
        if (overrideCookie.startsWith('eyJ')) {
          // Try to decrypt the JWE token
          try {
            flagOverrides = await decrypt(overrideCookie)
          } catch (decryptError) {
            console.warn('Failed to decrypt Vercel flag overrides, trying plaintext parse:', decryptError)
            // If decryption fails, try parsing as plaintext JSON
            flagOverrides = JSON.parse(overrideCookie)
          }
        } else {
          // If it doesn't look like a JWE token, try parsing as plaintext JSON
          flagOverrides = JSON.parse(overrideCookie)
        }

        if (flagOverrides) {
          setFlags((prev: FeatureFlags) => ({
            ...prev,
            ...flagOverrides,
          }))
        }
      } catch (error) {
        // If all parsing attempts fail, the cookie might be invalid or corrupted
        console.warn('Failed to parse Vercel feature flag overrides:', error)
        // Clear the invalid cookie to prevent repeated errors
        Cookies.remove('vercel-flag-overrides')
      }
    }

    handleFlagOverrides()
  }, [setFlags])
}
