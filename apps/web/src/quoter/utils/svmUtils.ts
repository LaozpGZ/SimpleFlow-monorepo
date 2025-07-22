import { TradeType } from '@pancakeswap/swap-sdk-core'
import { QuoteQuery } from '../quoter.types'

// Solana types imported from the Solana app
type SwapType = 'exactIn' | 'exactOut'

interface QuoteRequest {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
  swapType: SwapType
}

// SOL native mint address
const SOL_MINT = '11111111111111111111111111111111'

export function translateQuoteQueryToSVMRequest(query: QuoteQuery): QuoteRequest {
  if (!query.baseCurrency || !query.currency || !query.amount) {
    throw new Error('Invalid QuoteQuery: missing required fields')
  }

  // Convert Currency to mint address (base58 string)
  const inputMint = query.baseCurrency.isNative ? SOL_MINT : query.baseCurrency.wrapped.address

  const outputMint = query.currency.isNative ? SOL_MINT : query.currency.wrapped.address

  // Convert TradeType to SwapType
  const swapType: SwapType = query.tradeType === TradeType.EXACT_INPUT ? 'exactIn' : 'exactOut'

  // Convert slippage to basis points (default to 0.5% if not provided)
  const slippageBps = Math.round((query.slippage || 0.005) * 10000)

  return {
    inputMint,
    outputMint,
    amount: query.amount.quotient.toString(),
    slippageBps,
    swapType,
  }
}
