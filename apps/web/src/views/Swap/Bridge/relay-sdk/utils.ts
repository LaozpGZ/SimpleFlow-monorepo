import { RelayQuoteRequest, RelayError } from './types'

/**
 * Validates required parameters for quote request
 */
export function validateQuoteRequest(params: RelayQuoteRequest): void {
  const required = [
    'user',
    'originChainId',
    'destinationChainId',
    'originCurrency',
    'destinationCurrency',
    'amount',
    'tradeType',
  ] as const

  for (const field of required) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      throw new Error(`Missing required parameter: ${field}`)
    }
  }

  // Validate trade type
  if (!['EXACT_INPUT', 'EXACT_OUTPUT'].includes(params.tradeType)) {
    throw new Error('Invalid tradeType. Must be EXACT_INPUT or EXACT_OUTPUT')
  }

  // Validate chain IDs are numbers
  if (typeof params.originChainId !== 'number' || typeof params.destinationChainId !== 'number') {
    throw new Error('Chain IDs must be numbers')
  }

  // Validate amount is a valid number string
  if (!/^\d+$/.test(params.amount)) {
    throw new Error('Amount must be a valid number string')
  }
}

/**
 * Creates a standardized error from API response
 */
export function createRelayError(message: string, code?: string, details?: any): RelayError {
  return {
    message,
    code,
    details,
  }
}

/**
 * Formats parameters for API request by removing undefined values
 */
export function formatRequestParams(params: RelayQuoteRequest): Record<string, any> {
  const formatted: Record<string, any> = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formatted[key] = value
    }
  })

  return formatted
}

/**
 * Checks if response is an error response
 */
export function isErrorResponse(response: any): response is { error: RelayError } {
  return response && typeof response === 'object' && 'error' in response
}

/**
 * Sleep utility for retry logic
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
