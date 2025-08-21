// Relay API configuration
export const RELAY_API_ENDPOINT = 'https://api.relay.link'

// API endpoints
export const RELAY_ENDPOINTS = {
  QUOTE: '/quote',
  CHAINS: '/chains',
  EXECUTION_STATUS: '/execution/status',
  REQUESTS: '/requests',
  TOKEN_PRICE: '/token/price',
  CURRENCIES: '/currencies',
  EXECUTE_GASLESS: '/execute/gasless',
  SWAP_MULTI_INPUT: '/swap/multi-input',
  TRANSACTIONS_INDEX: '/transactions/index',
  TRANSACTIONS_SINGLE: '/transactions/single',
} as const

// Default configuration
export const DEFAULT_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// Trade types
export const TRADE_TYPES = {
  EXACT_INPUT: 'EXACT_INPUT',
  EXACT_OUTPUT: 'EXACT_OUTPUT',
} as const

// Protocol versions
export const PROTOCOL_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
} as const
