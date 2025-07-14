import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'
import { getCurrencyAddress } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchFarmPools } from 'state/farmsV4/state/farmPools/fetcher'
import { usePoolAprUpdater } from 'state/farmsV4/state/poolApr/hooks'
import { PoolInfo } from 'state/farmsV4/state/type'

interface UseMiniPoolsDataParams {
  chains: FarmV4SupportedChainId[]
  protocols?: Protocol[]
  searchQuery?: string
}

interface UseMiniPoolsDataReturn {
  pools: PoolInfo[]
  isLoading: boolean
  error: Error | null
  totalPools: number
}

const DEFAULT_PROTOCOLS = [Protocol.InfinityCLAMM, Protocol.InfinityBIN, Protocol.V3, Protocol.V2, Protocol.STABLE]

export const useMiniPoolsData = ({
  chains,
  protocols,
  searchQuery,
}: UseMiniPoolsDataParams): UseMiniPoolsDataReturn => {
  // Update APR data in background
  usePoolAprUpdater()

  // Fetch pools data
  const {
    data: pools = [],
    isLoading,
    error,
  } = useQuery<PoolInfo[], Error>({
    queryKey: ['miniPoolsData', chains, protocols || DEFAULT_PROTOCOLS],
    queryFn: async (): Promise<PoolInfo[]> => {
      try {
        const poolsData = await fetchFarmPools({
          protocols: protocols || DEFAULT_PROTOCOLS,
          chainId: chains,
        })

        // Filter out any invalid pools and sort by TVL desc by default
        return (poolsData || [])
          .filter((pool) => {
            return Boolean(pool && pool.chainId && pool.lpAddress && pool.token0 && pool.token1 && pool.protocol)
          })
          .sort((a, b) => {
            const tvlA = parseFloat(a.tvlUsd || '0')
            const tvlB = parseFloat(b.tvlUsd || '0')
            return tvlB - tvlA
          })
      } catch (err) {
        console.error('Error fetching pools:', err)
        throw err instanceof Error ? err : new Error('Failed to fetch pools')
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Filter pools based on search query
  const filteredPools = useMemo((): PoolInfo[] => {
    if (!searchQuery || searchQuery.trim() === '') {
      return pools
    }

    const query = searchQuery.toLowerCase().trim()

    return pools.filter((pool: PoolInfo) => {
      try {
        // Search by token symbols
        const token0Symbol = pool.token0?.symbol?.toLowerCase() || ''
        const token1Symbol = pool.token1?.symbol?.toLowerCase() || ''
        if (token0Symbol.includes(query) || token1Symbol.includes(query)) {
          return true
        }

        // Search by token addresses
        try {
          const token0Address = getCurrencyAddress(pool.token0)?.toLowerCase() || ''
          const token1Address = getCurrencyAddress(pool.token1)?.toLowerCase() || ''
          if (token0Address.includes(query) || token1Address.includes(query)) {
            return true
          }
        } catch {
          // Ignore errors when getting currency addresses
        }

        // Search by pool address
        const poolAddress = pool.lpAddress?.toLowerCase() || ''
        if (poolAddress.includes(query)) {
          return true
        }

        // Search by pool type
        const poolType = pool.protocol?.toLowerCase() || ''
        if (poolType.includes(query)) {
          return true
        }

        return false
      } catch (filterError) {
        console.warn('Error filtering pool:', pool, filterError)
        return false
      }
    })
  }, [pools, searchQuery])

  // Limit to top 100 pools for performance
  const topPools = useMemo((): PoolInfo[] => {
    return filteredPools.slice(0, 100)
  }, [filteredPools])

  return {
    pools: topPools,
    isLoading,
    error: error || null,
    totalPools: filteredPools.length,
  }
}
