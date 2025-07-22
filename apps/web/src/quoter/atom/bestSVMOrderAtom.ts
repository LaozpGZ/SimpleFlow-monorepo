import { NonEVMChainId } from '@pancakeswap/chains'
import { withTimeout } from '@pancakeswap/utils/withTimeout'
import { atomFamily } from 'jotai/utils'
import { QUOTE_TIMEOUT } from 'quoter/consts'
import { quoteTraceAtom } from 'quoter/perf/quoteTracker'
import type { InterfaceOrder } from 'views/Swap/utils'
import type { QuoteQuery } from '../quoter.types'
import { parseSVMQuoteResponse } from '../utils/svmResponseParser'
import { translateQuoteQueryToSVMRequest } from '../utils/svmUtils'
import { atomWithLoadable } from './atomWithLoadable'

const SVM_QUOTER_ENDPOINT = 'https://sol-quoter-api-dev-pcs-svihc.ondigitalocean.app/api/quote'

export const bestSVMOrderAtom = atomFamily((_option: QuoteQuery) => {
  return atomWithLoadable(async (get) => {
    const { enabled, baseCurrency, currency, amount } = _option

    // Early validation
    if (!enabled || !baseCurrency || !currency || !amount) {
      return undefined
    }

    // Only process Solana chain
    if (baseCurrency.chainId !== NonEVMChainId.SOLANA) {
      return undefined
    }

    const controller = new AbortController()
    const perf = get(quoteTraceAtom(_option))
    perf.tracker.track('start')

    try {
      const query = withTimeout(
        async () => {
          // Translate QuoteQuery to SVM request format
          const requestBody = translateQuoteQueryToSVMRequest(_option)

          // Fetch quote from SVM quoter service
          const response = await fetch(SVM_QUOTER_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(`SVM quoter API error: ${response.statusText}`)
          }

          const responseJson = await response.json()

          if (!responseJson.success) {
            throw new Error(responseJson.msg || 'SVM quoter request failed')
          }

          // Parse response to SVM order format
          const svmOrder = parseSVMQuoteResponse(responseJson.data, _option)

          perf.tracker.success(svmOrder)
          return svmOrder as InterfaceOrder
        },
        {
          ms: QUOTE_TIMEOUT,
          abort: () => {
            controller.abort()
          },
        },
      )

      return await query
    } catch (error) {
      perf.tracker.fail(error)
      throw error
    } finally {
      perf.tracker.report()
    }
  })
})
