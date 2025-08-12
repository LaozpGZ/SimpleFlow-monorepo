import { getBestSolanaTrade } from '@pancakeswap/solana-router-sdk'
import { solanaTokens } from '@pancakeswap/tokens'
import { useQuery } from '@tanstack/react-query'
import { TradeType, SPLToken, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

export function useDirectBestSolanaTrade(params: { missingMints: string[]; tokenMap: Map<string, SPLToken> }) {
  const { missingMints, tokenMap } = params
  const { data, isLoading } = useQuery({
    queryKey: ['svm-fallback-prices', missingMints.slice().sort().join(',')],
    enabled: missingMints.length > 0,
    queryFn: async () => {
      const { usdc } = solanaTokens
      const usdcDecimals = usdc.decimals
      const tasks = missingMints
        .map(async (mint) => {
          const inputCurrency = tokenMap.get(mint.toLowerCase())

          if (!inputCurrency) return undefined

          const inputRaw = new BigNumber(10).pow(inputCurrency.decimals).toFixed(0)

          try {
            const trade = await getBestSolanaTrade({
              inputCurrency,
              outputCurrency: usdc,
              amount: UnifiedCurrencyAmount.fromRawAmount(inputCurrency, inputRaw),
              tradeType: TradeType.EXACT_INPUT,
            })
            const outRaw = trade?.outputAmount?.quotient?.toString?.() ?? trade?.outputAmount?.quotient ?? '0'
            const priceInUsdc = new BigNumber(outRaw).div(new BigNumber(10).pow(usdcDecimals)).toNumber()

            return { mint: mint.toLowerCase(), price: priceInUsdc }
          } catch (error) {
            return undefined
          }
        })
        .filter((t) => t !== undefined)
      const results = await Promise.allSettled(tasks)
      const map: Record<string, number> = {}
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value && Number.isFinite(r.value.price)) {
          map[r.value.mint] = r.value.price
        }
      }
      return map
    },
  })

  return useMemo(
    () => ({ fallbackPriceMap: (data as Record<string, number>) || {}, isFallbackLoading: isLoading }),
    [data, isLoading],
  )
}
