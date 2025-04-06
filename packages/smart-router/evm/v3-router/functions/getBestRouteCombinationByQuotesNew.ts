/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChainId } from '@pancakeswap/chains'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import mapValues from 'lodash/mapValues.js'

import { RemoteLogger } from '@pancakeswap/utils/RemoteLogger'
import { usdGasTokensByChain } from '../../constants'
import { BestRoutes, L1ToL2GasCosts, RouteWithQuote } from '../types'
import { getPoolAddress } from '../utils'
import { poolInfoStr } from '../utils/remoteLogs'
import { split4Percents } from '../utils/split4Percents'

interface Config {
  minSplits?: number
  maxSplits?: number
}

export function getBestRouteCombinationByQuotesNew(
  amount: CurrencyAmount<Currency>,
  quoteCurrency: Currency,
  routesWithQuote: RouteWithQuote[],
  tradeType: TradeType,
  config: Config,
  quoteId?: string,
): BestRoutes | null {
  const maxSplits = config.maxSplits || 4
  const minSplits = config.minSplits ?? 0
  if (maxSplits > 4) {
    throw new Error('maxSplits should be less than or equal to 4')
  }

  const logger = RemoteLogger.getLogger(quoteId)
  // eslint-disable-next-line
  const chainId: ChainId = amount.currency.chainId
  // const now = Date.now()

  // Build a map of percentage of the input to list of valid quotes.
  // Quotes can be null for a variety of reasons (not enough liquidity etc), so we drop them here too.
  const percentToQuotes: { [percent: number]: RouteWithQuote[] } = {}
  for (const routeWithQuote of routesWithQuote) {
    if (!percentToQuotes[routeWithQuote.percent]) {
      percentToQuotes[routeWithQuote.percent] = []
    }
    percentToQuotes[routeWithQuote.percent]!.push(routeWithQuote)
  }

  Object.keys(percentToQuotes).forEach((key) => {
    const _key = parseInt(key)
    const list = percentToQuotes[parseInt(key)]
    list.sort((a, b) => Number(b.quoteAdjustedForGas.quotient - a.quoteAdjustedForGas.quotient))
    const oneHops = list.filter((x) => x.pools.length === 1)
    const others = list.filter((x) => x.pools.length > 1)
    percentToQuotes[_key] = [...oneHops, ...others.slice(0, 3)] // prune the search range.
  })

  logger.debug('--- percentToQuotes ---')
  logger.debugJson(
    mapValues(percentToQuotes, (x) => {
      return x.map((y) => {
        return {
          pools: y.pools.map((pool) => poolInfoStr(pool)),
          quoteAdjustedForGas: y.quoteAdjustedForGas.info(),
        }
      })
    }),
    2,
  )
  logger.debug('--- END percentToQuotes ---')

  for (let i = Math.max(minSplits, 1); i <= maxSplits; i++) {
    const splits = split4Percents.filter((x) => x.length === i)
    logger.debug(`try splits candidates=${splits.length}, minSplit=${minSplits}, maxSplit=${maxSplits}`)
    logger.debugJson(splits, 2)
    const candidateRoutes = splits
      .map((percents) => {
        return [
          ...findPossibleRoutesByPercents(percentToQuotes, percents, { usedPools: new Set(), routes: [] }, quoteId),
        ]
      })
      .flat()
    logger.debug(`candidates=${candidateRoutes.length}`)

    const weightedCandidates = candidateRoutes.map(scoreResult)
    if (weightedCandidates.length === 0) {
      throw new Error('No valid routes found')
    }
    weightedCandidates.sort((a, b) => Number(b.weight - a.weight))
    const bestResult = weightedCandidates[0]
    const swapRoute = computeSwapGasAdjustedQuotes(bestResult.data, chainId, tradeType)

    // Due to potential loss of precision when taking percentages of the input it is possible that the sum of the amounts of each
    // route of our optimal quote may not add up exactly to exactIn or exactOut.
    //
    // We check this here, and if there is a mismatch
    // add the missing amount to a random route. The missing amount size should be neglible so the quote should still be highly accurate.
    const { routes: routeAmounts } = swapRoute
    const totalAmount = routeAmounts.reduce(
      (total, routeAmount) => total.add(routeAmount.amount),
      CurrencyAmount.fromRawAmount(routeAmounts[0]!.amount.currency, 0),
    )

    const missingAmount = amount.subtract(totalAmount)
    if (missingAmount.greaterThan(0)) {
      logger.debug(
        `Optimal route's amounts did not equal exactIn/exactOut total. Adding missing amount to last route in array. missingAmount=${missingAmount.quotient.toString()}`,
      )

      routeAmounts[routeAmounts.length - 1]!.amount = routeAmounts[routeAmounts.length - 1]!.amount.add(missingAmount)
    }

    const { routes, quote: quoteAmount, estimatedGasUsed, estimatedGasUsedUSD } = swapRoute
    const quote = CurrencyAmount.fromRawAmount(quoteCurrency, quoteAmount.quotient)
    const isExactIn = tradeType === TradeType.EXACT_INPUT
    return {
      routes: routes.map(({ type, amount: routeAmount, quote: routeQuoteAmount, pools, path, percent }) => {
        const routeQuote = CurrencyAmount.fromRawAmount(quoteCurrency, routeQuoteAmount.quotient)
        return {
          percent,
          type,
          pools,
          path,
          inputAmount: isExactIn ? routeAmount : routeQuote,
          outputAmount: isExactIn ? routeQuote : routeAmount,
        }
      }),
      gasEstimate: estimatedGasUsed,
      gasEstimateInUSD: estimatedGasUsedUSD,
      inputAmount: isExactIn ? amount : quote,
      outputAmount: isExactIn ? quote : amount,
    }
  }
  throw new Error('No valid routes found')
}

function computeSwapGasAdjustedQuotes(
  bestSwap: RouteWithQuote[],
  chainId: ChainId,
  tradeType: TradeType,
  gasCostsL1ToL2?: L1ToL2GasCosts,
) {
  const quoteGasAdjusted = sumFn(bestSwap.map((route) => route.quoteAdjustedForGas))

  const estimatedGasUsed = bestSwap.reduce((sum, route) => sum + route.gasEstimate, 0n)

  const usdToken = usdGasTokensByChain[chainId]?.[0]
  if (!usdToken) {
    throw new Error(`No USD token for computing gas costs on chain ${chainId}`)
  }
  const usdTokenDecimals = usdToken.decimals

  const gasCostsL1 = gasCostsL1ToL2 ?? {
    gasUsedL1: 0n,
    gasCostL1USD: CurrencyAmount.fromRawAmount(usdToken, 0),
    gasCostL1QuoteToken: CurrencyAmount.fromRawAmount(bestSwap[0].quote.currency, 0),
  }

  const estimatedGasUsedUSDs = bestSwap.map((route) => {
    const decimalsDiff = usdTokenDecimals - route.gasCostInUSD.currency.decimals
    if (decimalsDiff >= 0) {
      return CurrencyAmount.fromRawAmount(usdToken, route.gasCostInUSD.quotient * 10n ** BigInt(decimalsDiff))
    }
    return CurrencyAmount.fromRawAmount(usdToken, route.gasCostInUSD.quotient / 10n ** BigInt(-decimalsDiff))
  })

  let estimatedGasUsedUSD = sumFn(estimatedGasUsedUSDs)

  if (!estimatedGasUsedUSD.currency.equals(gasCostsL1.gasCostL1USD.currency)) {
    const decimalsDiff = usdTokenDecimals - gasCostsL1.gasCostL1USD.currency.decimals
    estimatedGasUsedUSD = estimatedGasUsedUSD.add(
      CurrencyAmount.fromRawAmount(usdToken, gasCostsL1.gasCostL1USD.quotient * 10n ** BigInt(decimalsDiff)),
    )
  } else {
    estimatedGasUsedUSD = estimatedGasUsedUSD.add(gasCostsL1.gasCostL1USD)
  }

  const estimatedGasUsedQuoteToken = sumFn(bestSwap.map((route) => route.gasCostInToken)).add(
    gasCostsL1.gasCostL1QuoteToken,
  )

  const quote = sumFn(bestSwap.map((route) => route.quote))

  const adjustedQuoteGas =
    tradeType === TradeType.EXACT_INPUT
      ? quoteGasAdjusted.subtract(gasCostsL1.gasCostL1QuoteToken)
      : quoteGasAdjusted.add(gasCostsL1.gasCostL1QuoteToken)

  const sortedRoutes = [...bestSwap].sort((a, b) => {
    if (b.amount.greaterThan(a.amount)) return 1
    if (a.amount.greaterThan(b.amount)) return -1
    return 0
  })

  return {
    quote,
    quoteGasAdjusted: adjustedQuoteGas,
    estimatedGasUsed,
    estimatedGasUsedUSD,
    estimatedGasUsedQuoteToken,
    routes: sortedRoutes,
  }
}

interface Weighted<T> {
  data: T
  weight: bigint
}
interface FindRouteResult {
  usedPools: Set<string>
  routes: RouteWithQuote[]
}

function sumFn(currencyAmounts: CurrencyAmount<Currency>[]): CurrencyAmount<Currency> {
  let sum = currencyAmounts[0]!
  for (let i = 1; i < currencyAmounts.length; i++) {
    sum = sum.add(currencyAmounts[i]!)
  }
  return sum
}

function scoreResult(result: FindRouteResult): Weighted<RouteWithQuote[]> {
  const { routes } = result
  const totalQuote = sumFn(routes.map((route) => route.quoteAdjustedForGas)) // assume totalQuote.quotient is bigint

  return {
    weight: totalQuote.quotient,
    data: routes,
  }
}

function* findPossibleRoutesByPercents(
  percentToQuotes: { [percent: number]: RouteWithQuote[] },
  percents: number[],
  state: FindRouteResult = { usedPools: new Set(), routes: [] },
  quoteId?: string,
): Generator<FindRouteResult, void, unknown> {
  const index = state.routes.length
  if (index === percents.length) {
    yield state
    return
  }
  const percent = percents[index]
  const routes = percentToQuotes[percent]
  if (!routes || routes.length === 0) {
    return
  }

  for (const route of routes) {
    const hasPoolUsed = route.pools.some((pool) => {
      const poolAddress = getPoolAddress(pool)
      return state.usedPools.has(poolAddress)
    })
    if (hasPoolUsed) {
      continue
    }
    yield* findPossibleRoutesByPercents(
      percentToQuotes,
      percents,
      {
        usedPools: new Set([...state.usedPools, ...route.pools.map(getPoolAddress)]),
        routes: [...state.routes, route],
      },
      quoteId,
    )
  }
}

function* take<T>(iterable: Iterable<T>, count: number): Generator<T> {
  let i = 0
  for (const item of iterable) {
    if (i++ >= count) break
    yield item
  }
}
