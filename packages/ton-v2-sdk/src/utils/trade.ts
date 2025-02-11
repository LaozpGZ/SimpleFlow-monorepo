import invariant from 'tiny-invariant'
import { Percent, TradeType } from '@pancakeswap/swap-sdk-core'
import { ONE_HUNDRED_PERCENT, ZERO_PERCENT } from '@pancakeswap/swap-sdk-evm'
import { Currency, Price } from '../constants'
import { CurrencyAmount } from '../constants/CurrencyAmount'
import { Route } from './route'
import { Pair } from '../types'
import { getOutputAmount } from './amount'

interface BestTradeOptions {
  // how many results to return
  maxNumResults?: number
  // the maximum number of hops a trade should contain
  maxHops?: number
}

interface TradeOutputType {
  inputAmount: CurrencyAmount<Currency> | undefined
  outputAmount: CurrencyAmount<Currency> | undefined
}

export class Trade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
  /**
   * The route of the trade, i.e. which pairs the trade goes through and the input/output currencies.
   */
  public readonly route: Route<TInput, TOutput>

  /**
   * The type of the trade, either exact in or exact out.
   */
  public readonly tradeType: TTradeType

  /**
   * The input amount for the trade assuming no slippage.
   */
  public readonly inputAmount: CurrencyAmount<TInput>

  /**
   * The output amount for the trade assuming no slippage.
   */
  public readonly outputAmount: CurrencyAmount<TOutput>

  /**
   * The price expressed in terms of output amount/input amount.
   */
  public readonly executionPrice: Price<TInput, TOutput>

  /**
   * The percent difference between the mid price before the trade and the trade execution price.
   */
  public readonly priceImpact: Percent

  constructor(
    route: Route<TInput, TOutput>,
    amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>,
    tradeType: TTradeType,
  ) {
    this.route = route
    this.tradeType = tradeType

    const tokenAmounts: CurrencyAmount<Currency>[] = new Array(route.path.length)
    if (tradeType === TradeType.EXACT_INPUT) {
      invariant(amount.currency.equals(route.input), 'INPUT')
      tokenAmounts[0] = amount.wrapped
      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i]
        const [outputAmount] = getOutputAmount(tokenAmounts[i], pair)
        tokenAmounts[i + 1] = outputAmount
      }
      this.inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator)
      this.outputAmount = CurrencyAmount.fromFractionalAmount(
        route.output,
        tokenAmounts[tokenAmounts.length - 1].numerator,
        tokenAmounts[tokenAmounts.length - 1].denominator,
      )
    } else {
      invariant(amount.currency.equals(route.output), 'OUTPUT')
      tokenAmounts[tokenAmounts.length - 1] = amount.wrapped
      for (let i = route.path.length - 1; i > 0; i--) {
        const pair = route.pairs[i - 1]
        const [inputAmount] = getOutputAmount(tokenAmounts[i], pair)
        tokenAmounts[i - 1] = inputAmount
      }
      this.inputAmount = CurrencyAmount.fromFractionalAmount(
        route.input,
        tokenAmounts[0].numerator,
        tokenAmounts[0].denominator,
      )
      this.outputAmount = CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator)
    }

    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.quotient,
      this.outputAmount.quotient,
    )
    // calculate price impact := (exactQuote - outputAmount) / exactQuote
    const quotedOutputAmount = route.midPrice.quote(this.inputAmount)
    const priceImpact = quotedOutputAmount.subtract(this.outputAmount).divide(quotedOutputAmount)
    this.priceImpact = new Percent(priceImpact.numerator, priceImpact.denominator)
  }
}

export const bestTradeExactOut = <TInput extends Currency, TOutput extends Currency>(
  pairs: Pair[],
  currencyIn: TInput,
  currencyAmountOut: CurrencyAmount<TOutput>,
  { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
  // used in recursion.
  currentPairs: Pair[] = [],
  nextAmountOut: CurrencyAmount<Currency> = currencyAmountOut,
  bestTrades: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] = [],
): TradeOutputType => {
  return {
    inputAmount: currencyAmountOut,
    outputAmount: currencyAmountOut,
  }
}

export const bestTradeExactIn = <TInput extends Currency, TOutput extends Currency>(
  pairs: Pair[],
  currencyOut: TInput,
  currencyAmountIn: CurrencyAmount<TOutput>,
  { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
  // used in recursion.
  currentPairs: Pair[] = [],
  nextAmountOut: CurrencyAmount<Currency> = currencyAmountIn,
  bestTrades: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] = [],
): TradeOutputType => {
  return {
    inputAmount: currencyAmountIn,
    outputAmount: currencyAmountIn,
  }
}

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export const isTradeBetter = (
  tradeA: Trade<Currency, Currency, TradeType> | undefined | null,
  tradeB: Trade<Currency, Currency, TradeType> | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT,
): boolean | undefined => {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency)
  ) {
    throw new Error('Trades are not comparable')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  }
  return tradeA.executionPrice.asFraction
    .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
    .lessThan(tradeB.executionPrice)
}
