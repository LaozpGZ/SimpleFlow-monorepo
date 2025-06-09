import { useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback, useEffect, useMemo } from 'react'
import { fetchListAtom, listsAtom, useListStateReady } from 'state/lists/lists'

interface ListUpdaterProviderProps {
  urls: string[]
  children: React.ReactNode
}

export const ListUpdaterProvider: React.FC<ListUpdaterProviderProps> = ({ urls, children }) => {
  const isReady = useListStateReady()

  const listState = useAtomValue(listsAtom)
  const fetchList = useSetAtom(fetchListAtom)

  const load = useCallback(async () => {
    const t = Date.now()
    const all = await Promise.allSettled(urls.map((url) => fetchList(url)))
    console.log('time used', Date.now() - t, 'ms')
  }, [urls])

  useEffect(() => {
    load()
  }, [urls])

  const listsLoaded = useMemo(() => {
    return urls.every((url) => Boolean(listState.byUrl[url]?.current))
  }, [listState, urls])

  const shouldRender = isReady && listsLoaded

  return <>{shouldRender ? children : null}</>
}
