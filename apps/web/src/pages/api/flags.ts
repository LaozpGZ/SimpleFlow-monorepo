import { flag } from 'flags/next'
import { EXPERIMENTAL_FEATURES, EXPERIMENTAL_FEATURE_CONFIGS } from 'config/experimentalFeatures'

// Helper function to get feature config by feature key
const getFeatureConfig = (feature: EXPERIMENTAL_FEATURES) => {
  return EXPERIMENTAL_FEATURE_CONFIGS.find((config) => config.feature === feature)
}

// Helper function to generate deterministic result for a user for a given feature
// This uses the same logic as the original ab-test-middleware
const getFeatureAccess = async (userIdentifier: string, feature: EXPERIMENTAL_FEATURES): Promise<boolean> => {
  const config = getFeatureConfig(feature)
  if (!config) return false

  // Check whitelist first
  if (config.whitelist.includes(userIdentifier)) return true

  // Use deterministic hashing based on user identifier and feature
  const msgBuffer = new TextEncoder().encode(`${userIdentifier}-${feature}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const bufferArray = new Uint8Array(hashBuffer)
  const lastByte = bufferArray[bufferArray.length - 1]

  return lastByte <= config.percentage * 0xff
}

// Helper function to extract user identifier from request
const getUserIdentifier = (request: any): string => {
  // Try different ways to get user identifier
  return (
    request?.clientId ||
    request?.cookies?.get?.('clientId')?.value ||
    request?.headers?.get?.('x-forwarded-for') ||
    request?.headers?.get?.('x-real-ip') ||
    request?.ip ||
    'anonymous'
  )
}

// Web Notifications Feature Flag
const webNotificationsFlag = flag({
  key: EXPERIMENTAL_FEATURES.WebNotifications,
  async decide(request) {
    const userIdentifier = getUserIdentifier(request)
    return getFeatureAccess(userIdentifier, EXPERIMENTAL_FEATURES.WebNotifications)
  },
})

// Speed Quote Feature Flag
const speedQuoteFlag = flag({
  key: EXPERIMENTAL_FEATURES.SpeedQuote,
  async decide(request) {
    const userIdentifier = getUserIdentifier(request)
    return getFeatureAccess(userIdentifier, EXPERIMENTAL_FEATURES.SpeedQuote)
  },
})

// Price API Feature Flag
const priceAPIFlag = flag({
  key: EXPERIMENTAL_FEATURES.PriceAPI,
  async decide(request) {
    const userIdentifier = getUserIdentifier(request)
    return getFeatureAccess(userIdentifier, EXPERIMENTAL_FEATURES.PriceAPI)
  },
})

// PCSX Feature Flag
const pcsxFlag = flag({
  key: EXPERIMENTAL_FEATURES.PCSX,
  async decide(request) {
    const userIdentifier = getUserIdentifier(request)
    return getFeatureAccess(userIdentifier, EXPERIMENTAL_FEATURES.PCSX)
  },
})

// Optimized AMM Trade Feature Flag
const optimizedAmmTradeFlag = flag({
  key: EXPERIMENTAL_FEATURES.OPTIMIZED_AMM_TRADE,
  async decide(request) {
    const userIdentifier = getUserIdentifier(request)
    return getFeatureAccess(userIdentifier, EXPERIMENTAL_FEATURES.OPTIMIZED_AMM_TRADE)
  },
})

export default {
  [EXPERIMENTAL_FEATURES.WebNotifications]: webNotificationsFlag,
  [EXPERIMENTAL_FEATURES.SpeedQuote]: speedQuoteFlag,
  [EXPERIMENTAL_FEATURES.PriceAPI]: priceAPIFlag,
  [EXPERIMENTAL_FEATURES.PCSX]: pcsxFlag,
  [EXPERIMENTAL_FEATURES.OPTIMIZED_AMM_TRADE]: optimizedAmmTradeFlag,
}
