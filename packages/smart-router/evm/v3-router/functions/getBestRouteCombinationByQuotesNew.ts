/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChainId } from '@pancakeswap/chains'
import { Currency, CurrencyAmount, Fraction, TradeType } from '@pancakeswap/sdk'

import { RemoteLogger } from '@pancakeswap/utils/RemoteLogger'
import { keccak256 } from 'viem'
import { usdGasTokensByChain } from '../../constants'
import { BestRoutes, L1ToL2GasCosts, RouteWithQuote } from '../types'
import { getPoolAddress } from '../utils'
import { poolInfoStr } from '../utils/remoteLogs'

interface Config {
  minSplits?: number
  maxSplits?: number
}

function hashRouteWithQuote(route: RouteWithQuote): string {
  const { pools, percent } = route
  const poolStr = pools.map((pool) => getPoolAddress(pool)).join('-')
  return keccak256(`0x${poolStr}`)
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
  const { routes: sorted, routeDict: dict } = sortByWeights(routesWithQuote)
  const logger = RemoteLogger.getLogger(quoteId)
  // Fill user's order by better price router first
  let percent = 0
  logger.debug(`sorted routes: ${sorted.length}, start fill order`)
  const bestRoutes: RouteWithQuote[] = []
  for (let i = 0; i < sorted.length && percent < 100; i++) {
    const route = sorted[i]
    percent += route.percent
    logger.debug(`filled: ${percent}%, with ${route.pools.map(poolInfoStr).join('->')}`)
    bestRoutes.push(route)
  }

  if (percent < 100) {
    logger.debug('no route found because percent < 100')
    throw new Error('No valid routes found')
  }

  if (percent > 100) {
    const last = bestRoutes[bestRoutes.length - 1]
    const left = last.percent - (percent - 100)
    const last2 = dict[`${left}-${hashRouteWithQuote(last)}`]
    if (!last2) {
      logger.debug(`no route found because cannot fill last ${left}%`)
      throw new Error('No valid routes found')
    }
    bestRoutes[bestRoutes.length - 1] = last2
  }

  // eslint-disable-next-line
  const chainId: ChainId = amount.currency.chainId
  // const now = Date.now()

  logger.debug('--- END percentToQuotes ---')

  const swapRoute = computeSwapGasAdjustedQuotes(bestRoutes, chainId, tradeType)

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

function weight(a: RouteWithQuote) {
  const input = a.amount.quotient
  const quote = a.quoteAdjustedForGas.quotient
  return new Fraction(quote, input)
}

function sortByWeights(routes: RouteWithQuote[]) {
  const largerRoutes: Record<string, RouteWithQuote> = {}
  const dict: Record<string, RouteWithQuote> = {}
  for (const route of routes) {
    const hash = hashRouteWithQuote(route)
    const item = largerRoutes[hash]
    dict[`${route.percent}-${hash}`] = route
    if (!item) {
      largerRoutes[hash] = route
      continue
    }
    if (route.percent > item.percent) {
      largerRoutes[hash] = route
    }
  }

  const uniqRoutes = Object.values(largerRoutes)
  uniqRoutes.sort((a, b) => {
    const weightA = weight(a)
    const weightB = weight(b)
    if (weightA.lessThan(weightB)) {
      return 1
    }
    if (weightA.greaterThan(weightB)) {
      return -1
    }
    return 0
  })

  return {
    routes: uniqRoutes,
    routeDict: dict,
  }
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

function sumFn(currencyAmounts: CurrencyAmount<Currency>[]): CurrencyAmount<Currency> {
  let sum = currencyAmounts[0]!
  for (let i = 1; i < currencyAmounts.length; i++) {
    sum = sum.add(currencyAmounts[i]!)
  }
  return sum
}
