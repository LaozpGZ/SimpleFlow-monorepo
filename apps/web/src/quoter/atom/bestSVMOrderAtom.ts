import { NonEVMChainId } from '@pancakeswap/chains'
import { OrderType } from '@pancakeswap/price-api-sdk'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { withTimeout } from '@pancakeswap/utils/withTimeout'
import { atomFamily } from 'jotai/utils'
import { QUOTE_TIMEOUT } from 'quoter/consts'
import { translateQuoteQueryToSVMRequest } from 'quoter/utils/svm-utils/translateQuoteQueryToSVMRequest'
import { type InterfaceOrder, isSVMOrder } from 'views/Swap/utils'
import type { QuoteQuery } from '../quoter.types'
import { parseSVMQuoteResponse } from '../utils/svm-utils/svmResponseParser'
import { atomWithLoadable } from './atomWithLoadable'

const SVM_QUOTER_ENDPOINT = process.env.NEXT_PUBLIC_SVM_QUOTER_ENDPOINT || ''

export const bestSVMOrderAtom = atomFamily(
  (_option: QuoteQuery) => {
    return atomWithLoadable(async () => {
      const { enabled, baseCurrency, currency, amount } = _option

      console.log('start bestSVMOrderAtom')

      // Early validation
      if (!enabled || !baseCurrency || !currency || !amount) {
        return undefined
      }

      // Only process Solana chain
      if (baseCurrency.chainId !== NonEVMChainId.SOLANA) {
        return undefined
      }

      console.log('bestSVMOrderAtom options:', _option)

      const controller = new AbortController()
      // const perf = get(quoteTraceAtom(_option))
      // perf.tracker.track('start')

      try {
        const query = withTimeout(
          async () => {
            if (!SVM_QUOTER_ENDPOINT) {
              throw new Error('SVM quoter endpoint is not set')
            }

            // Translate QuoteQuery to SVM request format
            const requestBody = translateQuoteQueryToSVMRequest(_option)

            console.log('requestBody', requestBody)

            // Fetch quote from SVM quoter service
            const response = await fetch(`${SVM_QUOTER_ENDPOINT}/quote`, {
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

            console.log('responseJson', responseJson)

            if (!responseJson.success) {
              throw new Error(responseJson.msg || 'SVM quoter request failed')
            }

            // Parse response to SVM order format
            const svmOrder = parseSVMQuoteResponse(responseJson.data, _option)

            //   perf.tracker.success(svmOrder)
            return svmOrder
          },
          {
            ms: QUOTE_TIMEOUT,
            abort: () => {
              controller.abort()
            },
          },
        )

        let bestOrder: InterfaceOrder | undefined

        const result = await query()

        console.log('result', result)

        // if result.type is SVMOrder, can safely cast to InterfaceOrder
        if (result?.type === OrderType.PCS_SVM && isSVMOrder(result as unknown as InterfaceOrder)) {
          bestOrder = result
        }

        if (!bestOrder) {
          return Loadable.Nothing<InterfaceOrder>()
        }

        return Loadable.Just<InterfaceOrder>(bestOrder)
      } catch (error) {
        console.log('error', error)

        return Loadable.Fail<InterfaceOrder>(error)
        //   perf.tracker.fail(error)
      } finally {
        //   perf.tracker.report()
      }
    })
  },
  (a, b) =>
    a.baseCurrency?.wrapped?.address === b.baseCurrency?.wrapped?.address &&
    a.currency?.wrapped?.address === b.currency?.wrapped?.address &&
    a.amount?.toExact() === b.amount?.toExact(),
)
