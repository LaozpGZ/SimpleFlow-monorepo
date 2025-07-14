import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { PoolInfo } from 'state/farmsV4/state/type'
import { farmsSearchAtom, farmsSearchPagingAtom } from 'views/universalFarms/atom/farmsSearchAtom'

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

export const useMiniPoolsData = ({
  chains,
  protocols = DEFAULT_PROTOCOLS,
  searchQuery = '',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseMiniPoolsDataParams): UseMiniPoolsDataReturn => {
  // Create query object for Universal Farms
  const query: FarmQuery = useMemo(
    () => ({
      keywords: searchQuery,
      chains,
      protocols,
      sortBy: null, // Default sorting
      sortOrder: 0, // No specific sort order
      activeChainId: chains[0], // Use first chain as active
    }),
    [searchQuery, chains, protocols],
  )

  // Use existing Universal Farms atoms
  const farmSearchResult = useAtomValue(farmsSearchAtom(query))
  const setPaging = useSetAtom(farmsSearchPagingAtom(query))

  // Track local pagination state
  const [requestedPage, setRequestedPage] = useState(page)

  // Update pagination when page changes
  useEffect(() => {
    const targetPaging = Math.ceil((requestedPage * pageSize) / 20) - 1 // Universal Farms uses 20 items per page
    setPaging(targetPaging)
  }, [requestedPage, pageSize, setPaging])

  // Update local page when prop changes
  useEffect(() => {
    setRequestedPage(page)
  }, [page])

  // Extract data from the Universal Farms result
  const pools = useMemo(() => {
    const allPools = farmSearchResult.unwrapOr([])
    const startIndex = (requestedPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return allPools.slice(startIndex, endIndex)
  }, [farmSearchResult, requestedPage, pageSize])

  // Calculate loading and pagination state
  const isLoading = farmSearchResult.isPending()
  const allPools = farmSearchResult.unwrapOr([])
  const totalPools = allPools.length
  const hasNextPage = requestedPage * pageSize < totalPools

  // Reset pagination function
  const resetPagination = useCallback(() => {
    setRequestedPage(1)
    setPaging(0)
  }, [setPaging])

  return {
    pools,
    isLoading,
    error: null, // Universal Farms atoms handle errors internally
    totalPools,
    hasNextPage,
    currentPage: requestedPage,
    resetPagination,
  }
}
