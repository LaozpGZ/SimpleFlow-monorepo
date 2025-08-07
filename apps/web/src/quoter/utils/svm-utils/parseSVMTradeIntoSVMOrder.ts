import { type SVMOrder, OrderType, SVMTrade } from '@pancakeswap/price-api-sdk'
import { PoolType, Route, RouteType, SVMPool } from '@pancakeswap/smart-router'
import type { SolRouterTrade, RouterPlan } from '@pancakeswap/solana-router-sdk'
import {
  Currency,
  CurrencyAmount,
  Percent,
  TradeType,
  UnifiedCurrencyAmount,
  SPLToken,
  SPLNativeCurrency,
} from '@pancakeswap/swap-sdk-core'
import { SVMQuoteQuery } from 'quoter/quoter.types'

// Extended type to support both SPLToken and SPLNative currencies
type ExtendedSolRouterTrade = Omit<SolRouterTrade, 'inputAmount' | 'outputAmount'> & {
  inputAmount: UnifiedCurrencyAmount<SPLToken>
  outputAmount: UnifiedCurrencyAmount<SPLToken>
}

function createMockCurrency(address: string, chainId: number, programId: string) {
  return new SPLToken({
    address,
    chainId,
    programId,
    decimals: 0,
    symbol: 'MOCK_INFO',
    name: 'MOCK_INFO',
    logoURI: '',
  })
}

export function parseRoutePlansToRoutes(svmTrade: ExtendedSolRouterTrade): Route[] {
  const routes: Route[] = []
  let currentGroup: typeof svmTrade.routes = []

  for (let i = 0; i < svmTrade.routes.length; i++) {
    const routerPlan = svmTrade.routes[i]

    // Detect clear split-then-converge pattern for the specific convergence case
    const isConvergencePattern = detectConvergencePattern(svmTrade.routes, i)

    // A plan with percent < 100 indicates the start of a new route
    // If we have a currentGroup and encounter a plan with percent < 100,
    // we need to finish the current route first
    if (routerPlan.percent < 100 && currentGroup.length > 0) {
      // Finish the current route first
      const finishedRoute = createRoute(currentGroup, svmTrade)
      routes.push(finishedRoute)
      currentGroup = []
    }

    currentGroup.push(routerPlan)

    // End route if:
    // 1. This is the last plan, OR
    // 2. Next plan has percent < 100 (starts new split), OR
    // 3. We detect a convergence pattern where next plan should be separate
    const isLastPlan = i === svmTrade.routes.length - 1
    const nextPlan = isLastPlan ? null : svmTrade.routes[i + 1]

    const isEndOfRoute = isLastPlan || (nextPlan && nextPlan.percent < 100) || isConvergencePattern

    if (isEndOfRoute) {
      const route = createRoute(currentGroup, svmTrade)
      routes.push(route)
      currentGroup = []
    }
  }

  return routes
}

function detectConvergencePattern(plans: RouterPlan[], currentIndex: number): boolean {
  // TOKEN_1 → SOL (100%) | SOL → USDC (84%) | SOL → USDC (16%) | USDC → TOKEN_2 (100%)
  // Where the last plan converges the outputs from multiple split routes

  const currentPlan = plans[currentIndex]
  const nextPlan = currentIndex + 1 < plans.length ? plans[currentIndex + 1] : null

  // Pattern:
  // 1. Current plan has percent < 100 (split plan)
  // 2. Next plan has percent = 100 (convergence plan)
  // 3. There are multiple split plans that output to the same token as convergence input
  if (currentPlan.percent < 100 && nextPlan && nextPlan.percent === 100) {
    // Count how many recent plans output the same token that the next plan takes as input
    let convergingPlans = 0
    const convergenceInputMint = nextPlan.swapInfo.inputMint

    // Look at the last few plans (including current) to see if multiple output the convergence input
    for (let j = Math.max(0, currentIndex - 1); j <= currentIndex; j++) {
      if (plans[j].percent < 100 && plans[j].swapInfo.outputMint === convergenceInputMint) {
        convergingPlans++
      }
    }

    // If multiple split plans output to the same token that the next plan consumes, it's convergence
    return convergingPlans >= 2
  }

  return false
}

function createRoute(currentGroup: RouterPlan[], svmTrade: ExtendedSolRouterTrade): Route {
  // Process the current group into a single Route
  // TODO: need to update feeAmount. It's not correct.
  const pools = currentGroup.map((plan) => {
    const feeAmount = UnifiedCurrencyAmount.fromRawAmount(svmTrade.inputAmount.currency, plan.swapInfo.feeAmount)

    const pool: SVMPool = {
      type: PoolType.SVM,
      id: plan.swapInfo.ammKey.toString(),
      fee: plan.bps,
      feeAmount: feeAmount as UnifiedCurrencyAmount<SPLToken>,
    }

    return pool
  })

  // Build path: start with input currency, include all intermediate currencies, end with output currency
  // For multi-hop routes, path will be [inputCurrency, intermediate1, intermediate2, ..., outputCurrency]
  const path: Currency[] = []

  // Add the input currency (from the first plan)
  const firstPlan = currentGroup[0]
  const firstPlanInputMint = firstPlan.swapInfo.inputMint

  // Determine the actual input currency for this route group
  let routeInputCurrency: SPLToken
  if (firstPlanInputMint === svmTrade.inputAmount.currency.wrapped.address) {
    routeInputCurrency = svmTrade.inputAmount.currency
  } else if (firstPlanInputMint === svmTrade.outputAmount.currency.wrapped.address) {
    routeInputCurrency = svmTrade.outputAmount.currency
  } else {
    // Create currency for route input token
    routeInputCurrency = createMockCurrency(
      firstPlanInputMint,
      svmTrade.inputAmount.currency.chainId,
      svmTrade.inputAmount.currency.programId,
    )
  }

  path.push(routeInputCurrency as Currency)

  // Add intermediate currencies (outputMint of each plan except the last one becomes an intermediate currency)
  for (let j = 0; j < currentGroup.length - 1; j++) {
    const plan = currentGroup[j]
    const outputMintAddress = plan.swapInfo.outputMint

    // Find the currency for this outputMint
    let intermediateCurrency: SPLToken | SPLNativeCurrency
    if (outputMintAddress === svmTrade.inputAmount.currency.wrapped.address) {
      intermediateCurrency = svmTrade.inputAmount.currency
    } else if (outputMintAddress === svmTrade.outputAmount.currency.wrapped.address) {
      intermediateCurrency = svmTrade.outputAmount.currency
    } else {
      // For intermediate tokens that don't match input/output currencies,
      // create a proper SPLToken instance
      intermediateCurrency = createMockCurrency(
        outputMintAddress,
        svmTrade.inputAmount.currency.chainId,
        svmTrade.inputAmount.currency.programId,
      )
    }

    // NOTE: cast to Currency to avoid type error
    // Fix it later
    path.push(intermediateCurrency as Currency)
  }

  // Determine final output currency based on last plan in group
  const lastPlan = currentGroup[currentGroup.length - 1]
  const finalOutputMintAddress = lastPlan.swapInfo.outputMint

  let finalOutputCurrency: SPLToken
  if (finalOutputMintAddress === svmTrade.inputAmount.currency.wrapped.address) {
    finalOutputCurrency = svmTrade.inputAmount.currency
  } else if (finalOutputMintAddress === svmTrade.outputAmount.currency.wrapped.address) {
    finalOutputCurrency = svmTrade.outputAmount.currency
  } else {
    // Create currency for final output token
    finalOutputCurrency = createMockCurrency(
      finalOutputMintAddress,
      svmTrade.inputAmount.currency.chainId,
      svmTrade.inputAmount.currency.programId,
    )
  }

  // Add the final output currency
  path.push(finalOutputCurrency as Currency)

  const inputAmount = UnifiedCurrencyAmount.fromRawAmount(routeInputCurrency, firstPlan.swapInfo.inAmount)
  const outputAmount = UnifiedCurrencyAmount.fromRawAmount(finalOutputCurrency, lastPlan.swapInfo.outAmount)

  return {
    type: RouteType.SVM,
    pools,
    path,
    // NOTE: it's dangerous to cast UnifiedCurrencyAmount to CurrencyAmount
    // but can't add UnifiedCurrencyAmount to Route[] becuase it's only for EVM
    // Need to find a better way to handle this
    inputAmount: inputAmount as CurrencyAmount<Currency>,
    outputAmount: outputAmount as CurrencyAmount<Currency>,
    percent: firstPlan.percent, // Use percent from first plan in group
  }
}

/**
 * SVM Trade to SVM Order mapping
 * SolRouterTrade → SVMOrder
 * ├── tradeType (from query.tradeType)
 * ├── inputAmount ✓ (direct copy)
 * ├── outputAmount ✓ (direct copy)
 * ├── routes: RouterPlan[] → Route[] (convert each RouterPlan with grouping)
 * |───────|Group RouterPlans until outputMint matches final outputAmount address
 * |───────|RouterPlan.swapInfo.ammKey → SVMPool.id
 * |───────|RouterPlan.swapInfo.feeAmount → SVMPool.feeAmount
 * |───────|RouterPlan.percent → Route.percent (from first plan in group)
 * |───────|RouterPlan.swapInfo.inAmount → Route.inputAmount (from first plan)
 * |───────|RouterPlan.swapInfo.outAmount → Route.outputAmount (from last plan)
 * ├── priceImpactPct → priceImpactPct ✓ (direct copy)
 * ├── transaction ✓ (direct copy)
 * ├── maximumAmountIn → maximumAmountIn ✓ (direct copy)
 * ├── minimumAmountOut → minimumAmountOut ✓ (direct copy)
 * └── + quoteQueryHash (from query.hash)
 */
export function parseSVMTradeIntoSVMOrder(svmTrade: ExtendedSolRouterTrade, query: SVMQuoteQuery): SVMOrder<TradeType> {
  // Convert RouterPlan[] to Route[] with grouping logic
  const routes: Route[] = parseRoutePlansToRoutes(svmTrade)

  const PCT_MULTIPLIER = 1_000_000

  // Truncate decimal part (e.g. 123.232 -> 123)
  const priceNumber = Math.trunc(Number(svmTrade.priceImpactPct) * PCT_MULTIPLIER)

  // Create SVMTrade
  const svmTradeData: SVMTrade<TradeType> = {
    tradeType: query.tradeType || svmTrade.tradeType,
    inputAmount: svmTrade.inputAmount,
    outputAmount: svmTrade.outputAmount,
    priceImpactPct: priceNumber > 0 ? new Percent(priceNumber, PCT_MULTIPLIER) : new Percent(0, PCT_MULTIPLIER / 100),
    routes,
    requestId: svmTrade.requestId,
    quoteQueryHash: query.hash,
    transaction: svmTrade.transaction,
    maximumAmountIn: UnifiedCurrencyAmount.fromRawAmount(svmTrade.inputAmount.currency, svmTrade.otherAmountThreshold),
    minimumAmountOut: UnifiedCurrencyAmount.fromRawAmount(
      svmTrade.outputAmount.currency,
      svmTrade.otherAmountThreshold,
    ),
  }

  // Create SVMOrder
  return {
    type: OrderType.PCS_SVM,
    trade: svmTradeData,
  }
}
