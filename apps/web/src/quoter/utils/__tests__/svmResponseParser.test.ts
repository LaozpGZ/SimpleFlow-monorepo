import { OrderType } from '@pancakeswap/price-api-sdk'
import { CurrencyAmount, Token } from '@pancakeswap/sdk'
import { PoolType, RouteType } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { QuoteQuery } from '../../quoter.types'
import { parseSVMQuoteResponse } from '../svmResponseParser'

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

describe('svmResponseParser', () => {
  describe('parseSVMQuoteResponse', () => {
    const mockQuoteQuery: QuoteQuery = {
      baseCurrency: MOCK_SOL,
      currency: MOCK_USDC,
      amount: CurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000'), // 1 SOL
      tradeType: TradeType.EXACT_INPUT,
      slippage: 0.01,
      enabled: true,
      hash: 'test-hash',
    }

    const mockQuoteResponseData = {
      swapType: 'exactIn' as const,
      inputMint: '11111111111111111111111111111111',
      inputAmount: '1000000000',
      outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      outputAmount: '150000000', // 150 USDC
      slippageBps: 100,
      priceImpactPct: 0.5,
      routePlan: [
        {
          poolId: 'pool-1',
          inputMint: '11111111111111111111111111111111',
          outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          feeMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          feeRate: 0.003,
          feeAmount: '450000', // 0.45 USDC
          splitPercent: 60,
          routeIndex: 0,
        },
        {
          poolId: 'pool-2',
          inputMint: '11111111111111111111111111111111',
          outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          feeMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          feeRate: 0.001,
          feeAmount: '150000', // 0.15 USDC
          splitPercent: 40,
          routeIndex: 1,
        },
      ],
      routeStats: {
        numSubRoutes: 2,
        totalHops: 2,
        avgHopsPerRoute: 1,
      },
    }

    it('should parse SVM quote response to SVMOrder correctly', () => {
      const result = parseSVMQuoteResponse(mockQuoteResponseData, mockQuoteQuery)

      expect(result.type).toBe(OrderType.PCS_SVM)
      expect(result.trade).toBeDefined()
      expect(result.trade.tradeType).toBe(TradeType.EXACT_INPUT)
      expect(result.trade.inputAmount.quotient.toString()).toBe('1000000000')
      expect(result.trade.outputAmount.quotient.toString()).toBe('150000000')
      expect(result.trade.priceImpact).toBeNull()
      expect(result.trade.quoteQueryHash).toBe('test-hash')
      expect(result.trade.routeStats).toEqual({
        numSubRoutes: 2,
        totalHops: 2,
        avgHopsPerRoute: 1,
      })
    })

    it('should create correct SVM routes from route plan', () => {
      const result = parseSVMQuoteResponse(mockQuoteResponseData, mockQuoteQuery)

      expect(result.trade.routes).toHaveLength(2)

      // Check first route
      const route1 = result.trade.routes[0]
      expect(route1.type).toBe(RouteType.SVM)
      expect(route1.routeIndex).toBe(0)
      expect(route1.percent).toBe(60)
      expect(route1.pools).toHaveLength(1)
      expect(route1.pools[0].type).toBe(PoolType.SVM)
      expect(route1.pools[0].id).toBe('pool-1')
      expect(route1.pools[0].feeAmount).toBe('450000')
      expect(route1.pools[0].feeRate).toBe(0.003)

      // Check second route
      const route2 = result.trade.routes[1]
      expect(route2.type).toBe(RouteType.SVM)
      expect(route2.routeIndex).toBe(1)
      expect(route2.percent).toBe(40)
      expect(route2.pools).toHaveLength(1)
      expect(route2.pools[0].type).toBe(PoolType.SVM)
      expect(route2.pools[0].id).toBe('pool-2')
      expect(route2.pools[0].feeAmount).toBe('150000')
      expect(route2.pools[0].feeRate).toBe(0.001)
    })

    it('should handle complex route plan with multiple pools per route', () => {
      const complexResponseData = {
        ...mockQuoteResponseData,
        routePlan: [
          {
            poolId: 'pool-1',
            inputMint: '11111111111111111111111111111111',
            outputMint: 'intermediate-token',
            feeMint: 'intermediate-token',
            feeRate: 0.003,
            feeAmount: '300000',
            splitPercent: 100,
            routeIndex: 0,
          },
          {
            poolId: 'pool-2',
            inputMint: 'intermediate-token',
            outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            feeMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            feeRate: 0.001,
            feeAmount: '150000',
            splitPercent: 100,
            routeIndex: 0,
          },
        ],
      }

      const result = parseSVMQuoteResponse(complexResponseData, mockQuoteQuery)

      expect(result.trade.routes).toHaveLength(1)

      const route = result.trade.routes[0]
      expect(route.pools).toHaveLength(2)
      expect(route.pools[0].id).toBe('pool-1')
      expect(route.pools[1].id).toBe('pool-2')
    })

    it('should handle EXACT_OUTPUT trade type', () => {
      const exactOutQuery = {
        ...mockQuoteQuery,
        tradeType: TradeType.EXACT_OUTPUT,
      }

      const result = parseSVMQuoteResponse(mockQuoteResponseData, exactOutQuery)

      expect(result.trade.tradeType).toBe(TradeType.EXACT_OUTPUT)
    })

    it('should throw error for missing baseCurrency', () => {
      const invalidQuery = {
        ...mockQuoteQuery,
        baseCurrency: undefined as any,
      }

      expect(() => parseSVMQuoteResponse(mockQuoteResponseData, invalidQuery)).toThrow(
        'Invalid QuoteQuery for SVM response parsing',
      )
    })

    it('should throw error for missing currency', () => {
      const invalidQuery = {
        ...mockQuoteQuery,
        currency: undefined as any,
      }

      expect(() => parseSVMQuoteResponse(mockQuoteResponseData, invalidQuery)).toThrow(
        'Invalid QuoteQuery for SVM response parsing',
      )
    })

    it('should throw error for missing amount', () => {
      const invalidQuery = {
        ...mockQuoteQuery,
        amount: undefined as any,
      }

      expect(() => parseSVMQuoteResponse(mockQuoteResponseData, invalidQuery)).toThrow(
        'Invalid QuoteQuery for SVM response parsing',
      )
    })

    it('should use default trade type when not provided', () => {
      const queryWithoutTradeType = {
        ...mockQuoteQuery,
        tradeType: undefined as any,
      }

      const result = parseSVMQuoteResponse(mockQuoteResponseData, queryWithoutTradeType)

      expect(result.trade.tradeType).toBe(TradeType.EXACT_INPUT)
    })
  })
})
