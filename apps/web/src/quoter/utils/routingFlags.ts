import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'

interface RoutingFlags {
  edgePool: boolean
}

export const getRoutingSettings = cacheByLRU(
  async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_PROOF_API}/cms-config/routing-flag.json`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch routing settings: ${response.statusText}`)
      }
      return (await response.json()) as RoutingFlags
    } catch {
      return {
        edgePool: false,
      }
    }
  },
  {
    ttl: 300_000, // 5 minutes, enough to cover 1 session
  },
)
