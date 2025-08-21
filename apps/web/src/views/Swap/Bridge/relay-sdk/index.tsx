// Main exports for Relay SDK - using specific exports to avoid conflicts

// Client exports
export { RelayClient, relayClient } from './client'
export type { RelayClientConfig } from './client'

// Type exports
export type {
  RelayQuoteRequest,
  RelayQuoteResponse,
  RelayError,
  RelayErrorResponse,
  BridgeAdapterResponse,
  BridgeTransactionData,
  RelayTradeType,
  RelayCurrency,
  RelayAmount,
  RelayStep,
  RelayFees,
  RelayDetails,
} from './types'

// Constants exports
export { RELAY_API_ENDPOINT, RELAY_ENDPOINTS, DEFAULT_CONFIG, TRADE_TYPES, PROTOCOL_VERSIONS } from './constants'

// Utils exports
export { validateQuoteRequest, createRelayError, formatRequestParams, isErrorResponse, sleep } from './utils'

// Adapter exports
export { adaptRelayQuoteToBridge } from './adapter'
