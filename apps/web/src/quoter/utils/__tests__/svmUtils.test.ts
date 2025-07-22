import { CurrencyAmount, Token } from '@pancakeswap/sdk'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { QuoteQuery } from '../../quoter.types'
import { translateQuoteQueryToSVMRequest } from '../svmUtils'

// Mock currencies for testing
const MOCK_SOL = {
  chainId: 101,
  decimals: 9,
  symbol: 'SOL',
  name: 'Solana',
  isNative: true,
  isToken: false,
  wrapped: {
    address: '11111111111111111111111111111111',
  },
} as any

const MOCK_USDC = new Token(
  101, // Solana chainId
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint address on Solana
  6,
  'USDC',
  'USD Coin',
)

describe('svmUtils', () => {
  describe('translateQuoteQueryToSVMRequest', () => {
    it('should translate QuoteQuery with native SOL input to SVM request', () => {
      const amount = CurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000') // 1 SOL
      const query: QuoteQuery = {
        baseCurrency: MOCK_SOL,
        currency: MOCK_USDC,
        amount,
        tradeType: TradeType.EXACT_INPUT,
        slippage: 0.01, // 1%
        enabled: true,
        hash: 'test-hash',
      }

      const result = translateQuoteQueryToSVMRequest(query)

      expect(result).toEqual({
        inputMint: '11111111111111111111111111111111', // SOL native mint
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint
        amount: '1000000000',
        slippageBps: 100, // 1% = 100 bps
        swapType: 'exactIn',
      })
    })

    it('should translate QuoteQuery with token input to SVM request', () => {
      const amount = CurrencyAmount.fromRawAmount(MOCK_USDC, '1000000') // 1 USDC
      const query: QuoteQuery = {
        baseCurrency: MOCK_USDC,
        currency: MOCK_SOL,
        amount,
        tradeType: TradeType.EXACT_INPUT,
        slippage: 0.005, // 0.5%
        enabled: true,
        hash: 'test-hash',
      }

      const result = translateQuoteQueryToSVMRequest(query)

      expect(result).toEqual({
        inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint
        outputMint: '11111111111111111111111111111111', // SOL native mint
        amount: '1000000',
        slippageBps: 50, // 0.5% = 50 bps
        swapType: 'exactIn',
      })
    })

    it('should handle EXACT_OUTPUT trade type', () => {
      const amount = CurrencyAmount.fromRawAmount(MOCK_USDC, '1000000')
      const query: QuoteQuery = {
        baseCurrency: MOCK_USDC,
        currency: MOCK_SOL,
        amount,
        tradeType: TradeType.EXACT_OUTPUT,
        slippage: 0.01,
        enabled: true,
        hash: 'test-hash',
      }

      const result = translateQuoteQueryToSVMRequest(query)

      expect(result.swapType).toBe('exactOut')
    })

    it('should use default slippage when not provided', () => {
      const amount = CurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000')
      const query: QuoteQuery = {
        baseCurrency: MOCK_SOL,
        currency: MOCK_USDC,
        amount,
        tradeType: TradeType.EXACT_INPUT,
        enabled: true,
        hash: 'test-hash',
        // slippage not provided
      }

      const result = translateQuoteQueryToSVMRequest(query)

      expect(result.slippageBps).toBe(50) // 0.5% default = 50 bps
    })

    it('should throw error for missing baseCurrency', () => {
      const amount = CurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000')
      const query: QuoteQuery = {
        baseCurrency: undefined as any,
        currency: MOCK_USDC,
        amount,
        tradeType: TradeType.EXACT_INPUT,
        enabled: true,
        hash: 'test-hash',
      }

      expect(() => translateQuoteQueryToSVMRequest(query)).toThrow('Invalid QuoteQuery: missing required fields')
    })

    it('should throw error for missing currency', () => {
      const amount = CurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000')
      const query: QuoteQuery = {
        baseCurrency: MOCK_SOL,
        currency: undefined as any,
        amount,
        tradeType: TradeType.EXACT_INPUT,
        enabled: true,
        hash: 'test-hash',
      }

      expect(() => translateQuoteQueryToSVMRequest(query)).toThrow('Invalid QuoteQuery: missing required fields')
    })

    it('should throw error for missing amount', () => {
      const query: QuoteQuery = {
        baseCurrency: MOCK_SOL,
        currency: MOCK_USDC,
        amount: undefined as any,
        tradeType: TradeType.EXACT_INPUT,
        enabled: true,
        hash: 'test-hash',
      }

      expect(() => translateQuoteQueryToSVMRequest(query)).toThrow('Invalid QuoteQuery: missing required fields')
    })
  })
})
