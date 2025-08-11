import { Loadable } from '@pancakeswap/utils/Loadable'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { fetchListAtom, useListStateReady } from 'state/lists/lists'

export const useTokenListPrepared = (urls: string[]) => {
  const isReady = useListStateReady()

  const fetchList = useSetAtom(fetchListAtom)
  const [flag, setFlag] = useState<Loadable<boolean>>(Loadable.Pending())

  useEffect(() => {
    if (!isReady) return

    const load = async () => {
      await Promise.allSettled(urls.map((url) => fetchList(url)))
      setFlag(Loadable.Just(true))
    }

    load()
  }, [urls, isReady, fetchList])

  return flag
}
