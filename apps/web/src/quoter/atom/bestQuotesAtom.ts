import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { NoValidRouteError, QuoteQuery } from 'quoter/quoter.types'
import { logGTMQuoteQueryEvent } from 'utils/customGTMEventTracking'
import { InterfaceOrder } from 'views/Swap/utils'
import { Loadable, errorLoadable } from './atomWithLoadable'
import { bestQuoteAtom } from './bestQuoteAtom'

// Type definition for multi-currency support
export type MultiCurrencyQuoteQuery = Omit<QuoteQuery, 'baseCurrency' | 'currency' | 'amount'> & {
  baseCurrency?: Currency | null | Currency[]
  currency?: Currency | null | Currency[]
  amount?: CurrencyAmount<Currency> | CurrencyAmount<Currency>[]
}

// Map to track quote request timestamps for analytics
const quoteTimestampMap = new Map<string, number>()

/**
 * Creates individual quote requests for each currency pair and processes the results
 */
export const bestMultiCurrencyQuoteAtom = atomFamily((options: MultiCurrencyQuoteQuery) => {
  return atom((get) => {
    // Normalize inputs to arrays
    const baseTokens = Array.isArray(options.baseCurrency) ? options.baseCurrency : [options.baseCurrency]
    const quoteTokens = Array.isArray(options.currency) ? options.currency : [options.currency]
    const tokenAmounts = Array.isArray(options.amount) ? options.amount : [options.amount]

    // Determine which array to iterate over
    const isPrimaryBaseToken = baseTokens.length >= quoteTokens.length
    const primaryArray = isPrimaryBaseToken ? baseTokens : quoteTokens
    const primaryCount = primaryArray.length

    // Tracking state across all quotes
    const quoteResults: (Loadable<InterfaceOrder | undefined> & { hash?: string })[] = []
    let isLoadingAny = false
    let aggregatedError: Error | undefined

    try {
      // Process each currency pair
      for (let i = 0; i < primaryCount; i++) {
        // Select appropriate tokens and amount for this iteration
        const baseToken = isPrimaryBaseToken ? baseTokens[i] : baseTokens[0]
        const quoteToken = isPrimaryBaseToken ? quoteTokens[0] : quoteTokens[i]
        const tokenAmount = isPrimaryBaseToken ? tokenAmounts[i] : tokenAmounts[0]

        // Skip invalid pairs
        if (!isValidCurrencyPair(baseToken, quoteToken, tokenAmount)) {
          continue
        }

        // At this point we've validated the tokens are not null/undefined
        const validBaseToken = baseToken as Currency
        const validQuoteToken = quoteToken as Currency
        const validAmount = tokenAmount as CurrencyAmount<Currency>

        // Create unique hash for this currency pair
        const pairIdentifier = `${options.hash}-${validBaseToken.symbol}-${validQuoteToken.symbol}`

        // Track analytics
        trackQuoteStart(pairIdentifier, validBaseToken, validQuoteToken, options.tradeType)

        // Create and execute individual quote request
        const singleQuoteResult = executeSingleQuote(get, {
          ...options,
          baseCurrency: validBaseToken,
          currency: validQuoteToken,
          amount: validAmount,
          hash: pairIdentifier,
        })

        if (singleQuoteResult) {
          // Store result
          quoteResults.push({ ...singleQuoteResult, hash: pairIdentifier })

          // Update tracking state
          isLoadingAny = isLoadingAny || singleQuoteResult.loading
          if (singleQuoteResult.error) aggregatedError = singleQuoteResult.error

          // Track successful quotes
          if (singleQuoteResult.data && !singleQuoteResult.loading) {
            trackQuoteSuccess(pairIdentifier, validBaseToken, validQuoteToken, options.tradeType)
          }
        }
      }

      return processResults(quoteResults, isLoadingAny, aggregatedError, options.hash)
    } catch (error) {
      console.warn('[multi-currency-quote]', error)

      // Track failures for all pairs
      trackAllFailures(primaryArray, isPrimaryBaseToken, baseTokens, quoteTokens, options.tradeType)

      return errorLoadable<InterfaceOrder[] | undefined>(error)
    }
  })
})

/**
 * Validates if a currency pair is valid for quoting
 */
function isValidCurrencyPair(
  baseToken?: Currency | null,
  quoteToken?: Currency | null,
  amount?: CurrencyAmount<Currency>,
): boolean {
  if (!baseToken || !quoteToken || !amount?.quotient) {
    return false
  }

  if (baseToken.equals(quoteToken)) {
    return false
  }

  return true
}

/**
 * Executes a quote request for a single currency pair
 */
function executeSingleQuote(get: any, quoteOptions: QuoteQuery): Loadable<InterfaceOrder | undefined> {
  return get(bestQuoteAtom(quoteOptions))
}

/**
 * Processes the combined results from all quote requests
 */
function processResults(
  quoteResults: (Loadable<InterfaceOrder | undefined> & { hash?: string })[],
  isLoadingAny: boolean,
  aggregatedError: Error | undefined,
  mainHash?: string,
) {
  // No valid quotes found
  if (quoteResults.length === 0) {
    return errorLoadable<InterfaceOrder[] | undefined>(new NoValidRouteError())
  }

  // Single quote case - maintain backward compatibility
  if (quoteResults.length === 1) {
    return {
      ...quoteResults[0],
      loading: isLoadingAny,
      error: aggregatedError,
    }
  }

  // Multiple quotes case
  return {
    data: quoteResults.map((result) => result.data),
    loading: isLoadingAny,
    error: aggregatedError,
    hash: mainHash,
  }
}

/**
 * Tracks the start of a quote request for analytics
 */
function trackQuoteStart(quoteId: string, baseToken: Currency, quoteToken: Currency, tradeType?: TradeType) {
  if (!quoteTimestampMap.has(quoteId)) {
    logGTMQuoteQueryEvent('start', {
      chain: baseToken.chainId,
      currencyA: baseToken,
      currencyB: quoteToken,
      type: tradeType || TradeType.EXACT_INPUT,
    })
    quoteTimestampMap.set(quoteId, Date.now())
  }
}

/**
 * Tracks successful quote completion for analytics
 */
function trackQuoteSuccess(quoteId: string, baseToken: Currency, quoteToken: Currency, tradeType?: TradeType) {
  const startTime = quoteTimestampMap.get(quoteId) || Date.now()
  logGTMQuoteQueryEvent('succ', {
    chain: baseToken.chainId,
    currencyA: baseToken,
    currencyB: quoteToken,
    type: tradeType || TradeType.EXACT_INPUT,
    time: Date.now() - startTime,
  })
}

/**
 * Tracks failures for all currency pairs
 */
function trackAllFailures(
  primaryArray: (Currency | null | undefined)[],
  isPrimaryBaseToken: boolean,
  baseTokens: (Currency | null | undefined)[],
  quoteTokens: (Currency | null | undefined)[],
  tradeType?: TradeType,
) {
  for (let i = 0; i < primaryArray.length; i++) {
    const baseToken = isPrimaryBaseToken ? baseTokens[i] : baseTokens[0]
    const quoteToken = isPrimaryBaseToken ? quoteTokens[0] : quoteTokens[i]

    logGTMQuoteQueryEvent('fail', {
      chain: baseToken?.chainId,
      currencyA: baseToken || undefined,
      currencyB: quoteToken || undefined,
      type: tradeType || TradeType.EXACT_INPUT,
    })
  }
}
