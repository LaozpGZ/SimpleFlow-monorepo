import { ChainId, isTestnetChainId } from '@pancakeswap/chains'
import { FarmV4SupportedChainId, Protocol, supportedChainIdV4 } from '@pancakeswap/farms'
import { getCurrencyAddress, Native, ZERO_ADDRESS } from '@pancakeswap/sdk'
import { SmartRouter } from '@pancakeswap/smart-router'
import { TokenInfo } from '@pancakeswap/token-lists'
import uniqBy from '@pancakeswap/utils/uniqBy'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtomValue } from 'jotai'
import keyBy from 'lodash/keyBy'
import qs from 'qs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  batchGetCakeApr,
  batchGetLpAprData,
  batchGetMerklAprData,
  fillOnchainPoolData,
} from 'state/farmsV4/search/batchFarmDataFiller'
import { FarmInfo, farmToPoolInfo, SerializedFarmInfo } from 'state/farmsV4/search/farm.util'
import { farmFilters } from 'state/farmsV4/search/filters'
import { usePoolAprUpdater } from 'state/farmsV4/state/poolApr/hooks'
import { PoolInfo } from 'state/farmsV4/state/type'
import { listsAtom } from 'state/lists/lists'
import { userShowTestnetAtom } from 'state/user/hooks/useUserShowTestnet'

interface UseMiniPoolsDataParams {
  chains: FarmV4SupportedChainId[]
  protocols?: Protocol[]
  searchQuery?: string
  page?: number
  pageSize?: number
}

interface UseMiniPoolsDataReturn {
  pools: PoolInfo[]
  isLoading: boolean
  error: Error | null
  totalPools: number
  hasNextPage: boolean
  currentPage: number
  resetPagination: () => void
}

const DEFAULT_PROTOCOLS = [Protocol.InfinityCLAMM, Protocol.InfinityBIN, Protocol.V3, Protocol.V2, Protocol.STABLE]
const DEFAULT_PAGE_SIZE = 20

// Farm list fetching functions (same as main universal farms)
async function fetchFarmList({
  extend = false,
  protocols,
  address,
  chains,
}: {
  extend?: boolean
  protocols?: Protocol[]
  address?: string
  chains?: ChainId[]
}) {
  const queryStr = qs.stringify({
    extend: extend ? 1 : undefined,
    protocols: protocols ? protocols.join(',') : undefined,
    address,
    chains: chains?.join(','),
  })
  const api = `${process.env.NEXT_PUBLIC_EDGE_ENDPOINT || ''}/api/farm/list?${queryStr}`
  const response = await fetch(api, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch farms: ${response.statusText}`)
  }
  const resp = (await response.json()) as {
    data: SerializedFarmInfo[]
    lastUpdated: number
  }
  return resp.data
}

const IS_ADDRESS_REG = /^0x[a-fA-F0-9]{40,64}$/

export const useMiniPoolsData = ({
  chains,
  protocols,
  searchQuery,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseMiniPoolsDataParams): UseMiniPoolsDataReturn => {
  // Update APR data in background
  usePoolAprUpdater()

  // Get atoms (same as main universal farms)
  const useShowTestnet = useAtomValue(userShowTestnetAtom)
  const { tokensMap, symbolsMap } = useAtomValue(tokensMapAtom)

  // Committed data state - this represents the stable data we show to users
  const [committedPools, setCommittedPools] = useState<PoolInfo[]>([])
  const [committedPage, setCommittedPage] = useState<number>(1)

  // Store previous query parameters to detect filter changes
  const previousQueryRef = useRef<string>('')

  // Generate query signature for detecting filter changes
  const querySignature = useMemo(() => {
    return JSON.stringify({
      chains: chains.sort(),
      protocols: protocols?.sort(),
      searchQuery: searchQuery?.trim(),
    })
  }, [chains, protocols, searchQuery])

  // Filter chains for testnet
  const filteredChains = useMemo(() => {
    return chains.filter((chain) => {
      if (isTestnetChainId(chain) && !useShowTestnet) {
        return false
      }
      return true
    })
  }, [chains, useShowTestnet])

  // Fetch pools data using the same strategy as main universal farms
  const {
    data: allPools = [],
    isLoading,
    error,
    isFetching,
    dataUpdatedAt,
  } = useQuery<PoolInfo[], Error>({
    queryKey: ['miniPoolsDataEdge', filteredChains, protocols || DEFAULT_PROTOCOLS, searchQuery],
    queryFn: async (): Promise<PoolInfo[]> => {
      try {
        const targetProtocols = protocols || DEFAULT_PROTOCOLS

        // Start with base farm list (same as main universal farms)
        const lists = [await fetchFarmList({ extend: false, chains: filteredChains })]

        // Extension logic for keywords (same as main universal farms)
        if (searchQuery && searchQuery.trim()) {
          const keywords = searchQuery.trim()
          const prts = keywords
            .split(/(\s+|,|-|\/)/)
            .map((x) => x.trim())
            .filter((x) => x)
            .slice(0, 3) // max 3

          // Collect all extend promises for parallel execution
          const extendPromises: Promise<SerializedFarmInfo[]>[] = []

          // Extend by symbol search
          for (const prt of prts) {
            const relatedTokens = symbolsMap[prt.toLowerCase()]
            if (relatedTokens) {
              for (const token of relatedTokens) {
                if (supportedChainIdV4.includes(token.chainId)) {
                  if (token.address === ZERO_ADDRESS) {
                    const { wrapped } = Native.onChain(token.chainId)
                    extendPromises.push(
                      fetchFarmList({
                        extend: true,
                        protocols: targetProtocols,
                        chains: [token.chainId],
                        address: wrapped.address,
                      }),
                    )
                  }
                  extendPromises.push(
                    fetchFarmList({
                      extend: true,
                      protocols: targetProtocols,
                      chains: [token.chainId],
                      address: token.address,
                    }),
                  )
                }
              }
            }
          }

          // Extend by address search
          if (IS_ADDRESS_REG.test(keywords)) {
            for (const chainId of filteredChains) {
              extendPromises.push(
                fetchFarmList({
                  extend: true,
                  protocols: targetProtocols,
                  address: keywords,
                  chains: [chainId],
                }),
              )
            }
          }

          // Default extend for active chains
          for (const chainId of filteredChains) {
            extendPromises.push(
              fetchFarmList({
                extend: true,
                protocols: targetProtocols,
                chains: [chainId],
              }),
            )
          }

          // Execute all extend operations in parallel
          const extendResults = await Promise.allSettled(extendPromises)
          extendResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              lists.push(result.value)
            }
          })
        }

        // Process farms (same as main universal farms)
        const farms = uniqBy(lists.flat(), (item) => `${item.chainId}:${item.id}`.toLowerCase()).map((farm) => {
          const { chainId, vol24hUsd, ...rest } = farm
          const farmInfo = {
            chainId,
            tvlUsd: 0,
            ...rest,
            feeTierBase: 1e6,
            vol24hUsd,
            pool: SmartRouter.Transformer.parsePool(chainId, farm.pool),
          } as FarmInfo

          return farmInfo
        })

        // Apply filters (same as main universal farms)
        const filtered = farmFilters.search(
          farms
            .filter(farmFilters.chainFilter(filteredChains))
            .filter(farmFilters.protocolFilter(targetProtocols))
            .filter(filterTokens(tokensMap)),
          searchQuery || '',
        )

        // Sort by TVL descending as default
        const sorted = farmFilters.sortFunction(filtered, null, filteredChains[0])

        // Fill onchain data and enhance APR data (limited batch for performance)
        const batchSize = Math.min(sorted.length, 100) // Limit for mini component
        const sliced = sorted.slice(0, batchSize)
        const filled = await Promise.all(sliced.map(fillOnchainPoolData))
        const poolInfos = filled.map((x) => farmToPoolInfo(x))

        // Enhance with APR data (same as main universal farms)
        const [cakeAprs, lpAprs, merklAprs] = await Promise.allSettled([
          batchGetCakeApr(poolInfos.slice(0, 50)), // Limit batch size for mini
          batchGetLpAprData(poolInfos.slice(0, 50)),
          batchGetMerklAprData(poolInfos.slice(0, 50)),
        ])

        const aggCakeAprs = keyBy(cakeAprs.status === 'fulfilled' ? cakeAprs.value : [], (x) => x.id.toLowerCase())
        const aggLpAprs = keyBy(lpAprs.status === 'fulfilled' ? lpAprs.value : [], (x) => x.id.toLowerCase())
        const aggMerklAprs = keyBy(merklAprs.status === 'fulfilled' ? merklAprs.value : [], (x) => x.id.toLowerCase())

        const finalPools = poolInfos.map((poolInfo) => {
          const { farm, ...others } = poolInfo
          const id = `${farm?.chainId}:${farm?.lpAddress}`.toLowerCase()
          const cakeApr = aggCakeAprs[id]?.value || '0'
          const lpApr = `${aggLpAprs[id]?.value || farm?.apr24h || '0'}`
          const merklApr = aggMerklAprs[id]?.value || '0'

          return {
            ...others,
            farm: {
              ...farm,
              cakeApr,
              lpApr,
              merklApr,
            },
            lpApr,
          } as PoolInfo
        })

        return finalPools
      } catch (err) {
        console.error('Error fetching pools:', err)
        throw err instanceof Error ? err : new Error('Failed to fetch pools')
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: false, // Disable automatic refetching
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Detect filter changes and reset committed data
  useEffect(() => {
    if (previousQueryRef.current !== querySignature) {
      console.log('Filter change detected, resetting committed data')
      setCommittedPools([])
      setCommittedPage(1)
      previousQueryRef.current = querySignature
    }
  }, [querySignature])

  // Commit new data only when it's stable and larger than current
  useEffect(() => {
    if (!isLoading && !isFetching && allPools.length > 0) {
      const targetItems = page * pageSize
      const availableItems = Math.min(allPools.length, targetItems)
      const newData = allPools.slice(0, availableItems)

      // Only commit if we have more data than before, or if it's a fresh start
      if (newData.length >= committedPools.length || committedPools.length === 0) {
        console.log(`Committing data: ${committedPools.length} -> ${newData.length} items (page ${page})`)
        setCommittedPools(newData)
        setCommittedPage(page)
      } else {
        console.log(`Keeping committed data: ${committedPools.length} items (new data would be ${newData.length})`)
      }
    }
  }, [allPools, isLoading, isFetching, page, pageSize, committedPools.length, dataUpdatedAt])

  // Check if there are more pages based on committed data and fresh data
  const hasNextPage = useMemo((): boolean => {
    return allPools.length > committedPools.length || allPools.length > page * pageSize
  }, [allPools.length, committedPools.length, page, pageSize])

  // Reset function
  const resetPagination = useCallback(() => {
    console.log('Resetting pagination')
    setCommittedPools([])
    setCommittedPage(1)
  }, [])

  return {
    pools: committedPools,
    isLoading,
    error: error || null,
    totalPools: allPools.length,
    hasNextPage,
    currentPage: committedPage,
    resetPagination,
  }
}

// Filter tokens helper (same as main universal farms)
const filterTokens = (tokensMap: Record<string, TokenInfo>) => {
  return (farm: FarmInfo) => {
    const [token0, token1] = SmartRouter.getCurrenciesOfPool(farm.pool)
    if (!token0 || !token1) {
      return false
    }
    const key0 = `${token0.chainId}:${getCurrencyAddress(token0)}`.toLowerCase()
    const key1 = `${token0.chainId}:${getCurrencyAddress(token1)}`.toLowerCase()

    if (token0.isNative) {
      const keyWrapped = `${token0.chainId}:${token0.wrapped.address}`.toLowerCase()
      if (tokensMap[keyWrapped]) {
        return true
      }
    }
    if (token1.isNative) {
      const keyWrapped = `${token1.chainId}:${token1.wrapped.address}`.toLowerCase()
      if (tokensMap[keyWrapped]) {
        return true
      }
    }

    if (!tokensMap[key0] || !tokensMap[key1]) {
      return false
    }
    return true
  }
}

// Tokens map atom (same as main universal farms)
const tokensMapAtom = atom((get) => {
  const state = get(listsAtom)

  const nativeTokens = supportedChainIdV4
    .map((x) => Native.onChain(x))
    .map((native) => {
      return {
        chainId: native.chainId,
        address: ZERO_ADDRESS,
        symbol: native.symbol,
        name: native.name,
        decimals: native.decimals,
      } as TokenInfo
    })

  const records: Record<string, TokenInfo> = {}
  const symbols: Record<string, TokenInfo[]> = {}

  function addToSymbolsMap(token: TokenInfo, key?: string) {
    const symbolKey = key || token.symbol.toLowerCase()
    if (!symbols[symbolKey]) {
      symbols[symbolKey] = []
    }
    if (!symbols[symbolKey].find((x) => x.chainId === token.chainId && x.address === token.address)) {
      symbols[symbolKey].push(token)
    }
  }

  Object.keys(state.byUrl).forEach((url) => {
    const list = state.byUrl[url]
    if (list.current) {
      list.current.tokens.forEach((token) => {
        records[`${token.chainId}:${token.address}`.toLowerCase()] = token
        addToSymbolsMap(token)
      })
    }
  })

  for (const native of nativeTokens) {
    records[`${native.chainId}:${ZERO_ADDRESS}`.toLowerCase()] = native
    const { wrapped } = Native.onChain(native.chainId)
    addToSymbolsMap(native)
    addToSymbolsMap(native, wrapped.symbol.toLowerCase())
  }
  return {
    tokensMap: records,
    symbolsMap: symbols,
  }
})
