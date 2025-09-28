import { useEffect, useMemo, useState } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import { getHashKey } from 'utils/hash'
import { useAtomValue, useSetAtom } from 'jotai'
import { PoolSearcher, PoolSearcherState, PoolSearchEvent } from '../atom/PoolSearcher'
import { isInWhitelist } from '../atom/farmSearch.filter'
import { tokensMapAtom } from '../atom/tokensMapAtom'
import { searchQueryAtom, setPageAtom } from '../atom/searchQueryAtom'

export const useFarmSearch = () => {
  const query = useAtomValue(searchQueryAtom)
  const setPage = useSetAtom(setPageAtom)

  const searcher = useMemo(() => new PoolSearcher(), [])
  const [_pools, setPools] = useState<PoolInfo[]>([])
  const [state, setState] = useState<PoolSearcherState>(searcher.getState())
  const hash = getHashKey(query)
  const { tokensMap } = useAtomValue(tokensMapAtom)
  const checkWhitelist = isInWhitelist(tokensMap)

  useEffect(() => {
    searcher.search(query)
  }, [hash, searcher])

  useEffect(() => {
    const s1 = searcher.on(PoolSearchEvent.POOLS_UPDATED, (pools: PoolInfo[]) => {
      setPools(pools)
    })

    const s2 = searcher.on(PoolSearchEvent.STATE_UPDATED, (state: PoolSearcherState) => {
      setState(state)
    })

    return () => {
      s1()
      s2()
    }
  }, [searcher])

  const pools = useMemo(() => {
    return _pools.map((pool) => {
      if (pool.farm) {
        // eslint-disable-next-line no-param-reassign
        pool.farm.inWhitelist = checkWhitelist(pool.farm)
      }
      return pool
    })
  }, [_pools, checkWhitelist])

  return {
    pools,
    state,
    setPage,
    query,
  }
}
