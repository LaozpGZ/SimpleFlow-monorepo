import { atom } from 'jotai'
import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { PCS_LIMIT_ORDER_POOLS_URL } from '../constants'
import { SupportedPoolListItem } from '../types'

export const supportedPoolsListAtom = atomWithAsyncRetry<Promise<SupportedPoolListItem[]>>({
  asyncFn: async () => {
    const response = await fetch(PCS_LIMIT_ORDER_POOLS_URL)
    if (!response.ok) throw new Error('Unable to fetch supported pools for PCS Limit Order')
    return response.json()
  },
  delayMs: 2000,
  maxRetries: 5,
  errorReportKey: 'pcs-limit-order-fetch-supported-pools-error',
  // TODO: Add fallback to few pools like BNB-CAKE from FE side
})

/**
 * Map an input token to its supported output tokens
 */
export const tokensMapAtom = atom(async (get) => {
  const pools = await get(supportedPoolsListAtom)

  const tokenMap: Record<string, string[]> = {}
  pools.forEach((pool) => {
    if (!tokenMap[pool.currency0]) tokenMap[pool.currency0] = []
    if (!tokenMap[pool.currency1]) tokenMap[pool.currency1] = []

    tokenMap[pool.currency0].push(pool.currency1)
    tokenMap[pool.currency1].push(pool.currency0)
  })

  return tokenMap
})
