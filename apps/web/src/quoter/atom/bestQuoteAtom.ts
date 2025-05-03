import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { UnsafeCurrency } from 'config/constants/types'
import { getIsWrapping } from 'hooks/useWrapCallback'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import first from 'lodash/first'
import { isBetterQuoteTrade } from 'quoter/utils/getBetterQuote'
import { isEqualQuoteQuery, PoolHashHelper } from 'quoter/utils/PoolHashHelper'
import { logGTMQuoteQueryEvent } from 'utils/customGTMEventTracking'
import { InterfaceOrder } from 'views/Swap/utils'
import { NoValidRouteError, QuoteQuery, StrategyQuery } from '../quoter.types'
import { activeQuoteHashAtom } from './abortControlAtoms'
import { emptyLoadable, errorLoadable, Loadable, pendingLoadable, valueLoadable } from './atomWithLoadable'
import { placeholderAtom } from './placeholderAtom'
import { getRoutingStrategy, StrategyRoute, updateStrategy } from './routingStrategy'

type StrategyQueryParams = {
  baseCurrency: UnsafeCurrency
  quoteCurrency: UnsafeCurrency
}

export type EnhancedQuoteQuery = Omit<QuoteQuery, 'baseCurrency' | 'currency' | 'amount'> & {
  baseCurrency?: Currency | null | Currency[]
  currency?: Currency | null | Currency[]
  amount?: CurrencyAmount<Currency> | CurrencyAmount<Currency>[]
}

const bestQuoteWithoutHashAtom = atomFamily((_option: EnhancedQuoteQuery) => {
  const strategyQuery: (params: StrategyQueryParams) => StrategyQuery = ({ baseCurrency, quoteCurrency }) => ({
    baseCurrency: baseCurrency || undefined,
    quoteCurrency: quoteCurrency || undefined,
    v2Swap: _option.v2Swap,
    v3Swap: _option.v3Swap,
    infinitySwap: _option.infinitySwap,
    chainId: baseCurrency?.chainId,
    maxHops: _option.maxHops,
    maxSplits: _option.maxSplits,
  })

  const baseCurrencies = Array.isArray(_option.baseCurrency) ? _option.baseCurrency : [_option.baseCurrency]
  const quotesCurrencies = Array.isArray(_option.currency) ? _option.currency : [_option.currency]

  const isBaseArray = baseCurrencies.length > quotesCurrencies.length

  const listCurrencies = isBaseArray ? baseCurrencies : quotesCurrencies

  const strategyHashes = listCurrencies.map((currency) => {
    const params = isBaseArray
      ? {
          baseCurrency: currency,
          quoteCurrency: first(quotesCurrencies),
        }
      : {
          baseCurrency: first(baseCurrencies),
          quoteCurrency: currency,
        }

    return PoolHashHelper.hashStrategyQuery(strategyQuery(params))
  })

  return atom((get) => {
    function executeRoutes(routes: StrategyRoute[], option: QuoteQuery, index: number) {
      try {
        const quotes = routes.map((route) =>
          get(
            route.query({
              ...option,
              ...route.overrides,
              currency: Array.isArray(option.currency) ? option.currency[index] : option.currency,
              baseCurrency: Array.isArray(option.baseCurrency) ? option.baseCurrency[index] : option.baseCurrency,
              amount: isBaseArray ? option.amount?.[index] : option.amount,
              placeholderHash: strategyHashes[index],
              hash: `${option.hash}-${strategyHashes[index]}`,
            }),
          ),
        )
        const anyLoading = quotes.some((x) => x?.loading)

        const best = findBestQuote(...quotes)

        if (!best) {
          if (anyLoading) {
            return pendingLoadable<InterfaceOrder | undefined>()
          }
          return undefined
        }
        const [bestQuote, bestIndex] = best

        if (bestQuote) {
          if (!anyLoading) {
            updateStrategy(strategyHashes[index], routes[bestIndex])
            return valueLoadable(bestQuote)
          }
          return pendingLoadable<InterfaceOrder | undefined>(bestQuote)
        }
        return emptyLoadable<InterfaceOrder | undefined>()
      } catch (ex) {
        console.warn(`[quote]`, ex)
        return emptyLoadable<InterfaceOrder | undefined>()
      }
    }

    // No active quote hash means some new quoter has started
    // This quoter query is outdated
    const activeQuoteHash = get(activeQuoteHashAtom)
    if (!activeQuoteHash) {
      return pendingLoadable<InterfaceOrder | undefined>()
    }

    const option: QuoteQuery = {
      enabled: true,
      type: 'quoter',
      tradeType: TradeType.EXACT_INPUT,
      ..._option,
    } as QuoteQuery

    const quotes: Loadable<InterfaceOrder | undefined>[] = []

    try {
      for (const [index, strategyHash] of strategyHashes.entries()) {
        const baseCurrency = isBaseArray ? option.baseCurrency?.[index] : option.baseCurrency
        const currencyB = (isBaseArray ? first(quotesCurrencies) : quotesCurrencies[index]) || undefined
        const amount = isBaseArray ? option.amount?.[index] : option.amount

        const isWrapping = getIsWrapping(
          isBaseArray ? option.amount?.[index] : option.amount,
          currencyB,
          currencyB?.chainId,
        )
        if (isWrapping || !option.enabled) {
          return emptyLoadable<InterfaceOrder | undefined>()
        }
        if (!baseCurrency || !currencyB) {
          return emptyLoadable<InterfaceOrder | undefined>()
        }
        if (baseCurrency?.equals(currencyB)) {
          return emptyLoadable<InterfaceOrder | undefined>()
        }
        if (!amount?.quotient) {
          return emptyLoadable<InterfaceOrder | undefined>()
        }

        if (!logMap.has(option.hash)) {
          logGTMQuoteQueryEvent('start', {
            chain: baseCurrency.chainId,
            currencyA: baseCurrency,
            currencyB,
            type: option.tradeType || TradeType.EXACT_INPUT,
          })
          logMap.set(option.hash, Date.now())
        }

        const strategy = getRoutingStrategy(strategyHash)

        for (const routes of strategy) {
          const quote = executeRoutes(routes, option, index)

          if (quote) {
            const time = logMap.get(option.hash) || Date.now()
            logGTMQuoteQueryEvent('succ', {
              chain: baseCurrency.chainId,
              currencyA: baseCurrency,
              currencyB,
              type: option.tradeType || TradeType.EXACT_INPUT,
              time: Date.now() - time,
            })
            quotes.push(quote)

            break
          }
        } // return errorLoadable<InterfaceOrder | undefined>(new NoValidRouteError())
      }

      if (quotes.length > 0) {
        return quotes
      }

      throw new NoValidRouteError()
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.warn(`[quote]`, ex)

      listCurrencies.map((currency) => {
        logGTMQuoteQueryEvent('fail', {
          chain: isBaseArray ? currency?.chainId : first(baseCurrencies)?.chainId,
          currencyA: (isBaseArray ? currency : first(baseCurrencies)) || undefined,
          currencyB: (isBaseArray ? first(quotesCurrencies) : currency) || undefined,
          type: option.tradeType || TradeType.EXACT_INPUT,
        })

        return undefined
      })
      return errorLoadable<InterfaceOrder[] | undefined>(ex)
    }
  })
}, isEqualQuoteQuery)

export const bestQuoteAtom = atomFamily((_option: EnhancedQuoteQuery) => {
  return atom((get) => {
    const quotesResult = get(bestQuoteWithoutHashAtom(_option as QuoteQuery))

    let result: Loadable<InterfaceOrder | (InterfaceOrder | undefined)[] | undefined> & {
      hash: string
      placeholderHash: string | undefined
    }

    if (Array.isArray(quotesResult)) {
      const hasOneResult = quotesResult.length === 1

      const hasTrade = hasOneResult ? quotesResult[0].data?.trade : quotesResult.every((x) => x.data?.trade)

      const placeHolder = _option.placeholderHash ? get(placeholderAtom(_option.placeholderHash)) : undefined

      const data =
        hasTrade && placeHolder ? placeHolder : hasOneResult ? quotesResult[0].data : quotesResult.map((x) => x.data)

      const loading =
        hasTrade && placeHolder
          ? !placeHolder
          : hasOneResult
          ? quotesResult[0].loading
          : quotesResult.every((x) => x.loading)

      result = {
        data,
        hash: _option.hash,
        placeholderHash: _option.placeholderHash,
        loading,
        error: quotesResult.find((x) => x.error)?.error,
      }
    } else {
      // if not array, it means single result
      result = {
        ...quotesResult,
        hash: _option.hash,
        placeholderHash: _option.placeholderHash,
        error: quotesResult.error,
      }
    }

    return result
  })
}, isEqualQuoteQuery)

function findBestQuote(...args: Loadable<InterfaceOrder | undefined>[]): [InterfaceOrder, number] | undefined {
  const fulfilledValues = args.filter((x) => x.data).map((x) => x.data)

  let bestOrder: InterfaceOrder | undefined
  let idx = -1
  for (let i = 0; i < fulfilledValues.length; i++) {
    const order = fulfilledValues[i]
    if (!bestOrder) {
      bestOrder = order
      idx = i
      continue
    }
    if (!order?.trade) continue
    if (isBetterQuoteTrade(bestOrder.trade, order.trade)) {
      bestOrder = order
      idx = i
    }
  }
  return bestOrder ? [bestOrder, idx] : undefined
}
