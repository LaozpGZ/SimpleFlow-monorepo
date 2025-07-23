import { SOLMint } from '@pancakeswap/sdk'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import type { QuoteQuery } from '../../quoter.types'
import { SVMSwapType } from './types'

interface QuoteRequest {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
  swapType: SwapType
}

export function translateQuoteQueryToSVMRequest(query: QuoteQuery): QuoteRequest {
  if (!query.baseCurrency || !query.currency || !query.amount) {
    throw new Error('Invalid QuoteQuery: missing required fields')
  }

  if (!query.slippage) {
    throw new Error('Invalid QuoteQuery: slippage must be greater than 0')
  }

  // Convert Currency to mint address (base58 string)
  const inputMint = query.baseCurrency.isNative ? SOLMint.toBase58() : query.baseCurrency.wrapped.address

  const outputMint = query.currency.isNative ? SOLMint.toBase58() : query.currency.wrapped.address

  // Convert TradeType to SwapType
  const swapType = query.tradeType === TradeType.EXACT_INPUT ? SVMSwapType.EXACT_IN : SVMSwapType.EXACT_OUT

  // Philip TODO: Confirm formula
  const slippageBps = Math.round(query.slippage * 10000)

  return {
    inputMint,
    outputMint,
    amount: query.amount.quotient.toString(),
    slippageBps,
    swapType,
  }
}
