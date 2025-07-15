import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useMemo } from 'react'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { PoolInfo } from 'state/farmsV4/state/type'
import { farmsSearchAtom, farmsSearchPagingAtom } from 'views/universalFarms/atom/farmsSearchAtom'

const poolsDataAtom = atomFamily((_: FarmQuery) => atom<PoolInfo[]>([]), isEqual)

interface UseMiniPoolsDataParams {
  chainId: FarmV4SupportedChainId
  protocols?: Protocol[]
  searchQuery?: string
}

interface UseMiniPoolsDataReturn {
  pools: PoolInfo[]
  isLoading: boolean
  loadMore: () => void
}

const DEFAULT_PROTOCOLS = [Protocol.InfinityCLAMM, Protocol.InfinityBIN, Protocol.V3, Protocol.V2, Protocol.STABLE]

export const useMiniPoolsData = ({
  chainId,
  protocols = DEFAULT_PROTOCOLS,
  searchQuery = '',
}: UseMiniPoolsDataParams): UseMiniPoolsDataReturn => {
  // Create query object for Universal Farms
  const query: FarmQuery = useMemo(
    () => ({
      keywords: searchQuery,
      chains: [chainId],
      protocols,
      sortBy: null, // Default sorting
      sortOrder: 0, // No specific sort order
      activeChainId: chainId, // Use first chain as active
    }),
    [searchQuery, chainId, protocols],
  )

  // Use existing Universal Farms atoms
  const farmSearchResult = useAtomValue(farmsSearchAtom(query))
  const setPaging = useSetAtom(farmsSearchPagingAtom(query))

  const [pools, setPools] = useAtom(poolsDataAtom(query))

  useEffect(() => {
    const farmsList = farmSearchResult.unwrapOr([])
    if (farmsList.length > 0) {
      setPools(farmsList)
    }
  }, [farmSearchResult])

  const isLoading = useMemo(() => pools.length === 0 && farmSearchResult.isPending(), [pools, farmSearchResult])

  const loadMore = useCallback(() => {
    setPaging((prev) => (prev ?? 0) + 1)
  }, [setPaging])

  return {
    pools,
    isLoading,
    loadMore,
  }
}
