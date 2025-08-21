import { RelayQuoteRequest, RelayQuoteResponse } from './types'
import { RELAY_API_ENDPOINT, RELAY_ENDPOINTS, DEFAULT_CONFIG } from './constants'
import { validateQuoteRequest, createRelayError, formatRequestParams, isErrorResponse, sleep } from './utils'

export interface RelayClientConfig {
  apiEndpoint?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

export class RelayClient {
  private apiEndpoint: string

  private timeout: number

  private retryAttempts: number

  private retryDelay: number

  constructor(config: RelayClientConfig = {}) {
    this.apiEndpoint = config.apiEndpoint || RELAY_API_ENDPOINT
    this.timeout = config.timeout || DEFAULT_CONFIG.TIMEOUT
    this.retryAttempts = config.retryAttempts || DEFAULT_CONFIG.RETRY_ATTEMPTS
    this.retryDelay = config.retryDelay || DEFAULT_CONFIG.RETRY_DELAY
  }

  /**
   * Get a quote from the Relay API
   */
  async getQuote(params: RelayQuoteRequest): Promise<RelayQuoteResponse> {
    try {
      // Validate request parameters
      validateQuoteRequest(params)

      // Format request parameters
      const requestBody = formatRequestParams(params)

      // Make API request with retry logic
      const response = await this.makeRequestWithRetry(`${this.apiEndpoint}${RELAY_ENDPOINTS.QUOTE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      // Parse response
      const data = await response.json()

      // Check for API error response
      if (isErrorResponse(data)) {
        throw createRelayError(data.error.message, data.error.code, data.error.details)
      }

      // Validate response structure
      if (!RelayClient.isValidQuoteResponse(data)) {
        throw createRelayError('Invalid response format from Relay API')
      }

      return data as RelayQuoteResponse
    } catch (error) {
      console.error('RelayClient getQuote error:', error)

      if (error instanceof Error) {
        throw error
      }

      throw createRelayError('Unexpected error occurred while fetching quote')
    }
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  private async makeRequestWithRetry(url: string, options: RequestInit, attempt = 1): Promise<Response> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        let errorData: any

        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }

        throw createRelayError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status.toString(),
          errorData,
        )
      }

      return response
    } catch (error) {
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = createRelayError('Request timeout')

        if (attempt < this.retryAttempts) {
          console.warn(`Request timeout, retrying... (${attempt}/${this.retryAttempts})`)
          await sleep(this.retryDelay * attempt)
          return this.makeRequestWithRetry(url, options, attempt + 1)
        }

        throw timeoutError
      }

      // Handle network errors with retry
      if (
        error instanceof Error &&
        (error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('Failed to fetch'))
      ) {
        if (attempt < this.retryAttempts) {
          console.warn(`Network error, retrying... (${attempt}/${this.retryAttempts})`)
          await sleep(this.retryDelay * attempt)
          return this.makeRequestWithRetry(url, options, attempt + 1)
        }
      }

      throw error
    }
  }

  /**
   * Basic validation of quote response structure
   */
  private static isValidQuoteResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.steps) &&
      data.fees &&
      typeof data.fees === 'object' &&
      data.details &&
      typeof data.details === 'object'
    )
  }
}

// Export a default instance for convenience
export const relayClient = new RelayClient()
