import { useEffect, useMemo } from 'react'
import { ApiV3PoolInfoItem, FetchPoolParams, PoolFetchType } from '@raydium-io/raydium-sdk-v2'
import useSWR, { KeyedMutator } from 'swr'
import { shallow } from 'zustand/shallow'
import { AxiosResponse } from 'axios'
import { getPoolsByIds } from '@pancakeswap/solana-clmm-sdk'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useAppStore, useTokenStore } from '@/store'

import { ConditionalPoolType } from './type'
import { formatPoolData, poolInfoCache, formatAprData } from './formatter'

const fetcher = ([ids]: [ids: string[]]) => getPoolsByIds(ids)

export default function useFetchPoolById<T = ApiV3PoolInfoItem>(
  props: {
    shouldFetch?: boolean
    idList?: (string | undefined)[]
    refreshInterval?: number
    readFromCache?: boolean
    refreshTag?: number
    keepPreviousData?: boolean
  } & FetchPoolParams
): {
  data?: T[]
  dataMap: { [key: string]: T }
  formattedData?: ConditionalPoolType<T>[]
  formattedDataMap: { [key: string]: ConditionalPoolType<T> }
  isLoading: boolean
  error?: any
  isEmptyResult: boolean
  isValidating: boolean
  mutate: KeyedMutator<T[]>
} {
  const {
    shouldFetch = true,
    idList = [],
    refreshInterval = MINUTE_MILLISECONDS * 3,
    readFromCache,
    type,
    refreshTag,
    keepPreviousData
  } = props || {}
  const readyIdList = idList.filter((i) => i && isValidPublicKey(i) && !useTokenStore.getState().tokenMap.get(i)) as string[]
  const [host, searchIdUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_SEARCH_BY_ID], shallow)

  const cacheDataList = useMemo(
    () =>
      readFromCache
        ? readyIdList
            .map((id) => poolInfoCache.get(id))
            .filter(
              (d) => d !== undefined && (!type || type === PoolFetchType.All || type.toLocaleLowerCase() === d.type.toLocaleLowerCase())
            )
        : [],
    [JSON.stringify(readyIdList)]
  ) as ApiV3PoolInfoItem[]

  // todo:@eric add host back
  const url = !readyIdList.length || readyIdList.length === cacheDataList.length || !shouldFetch ? null : searchIdUrl

  const { data, isLoading, error, mutate, ...rest } = useSWR(url ? [readyIdList, refreshTag] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval,
    keepPreviousData
  })
  const resData = useMemo(
    () => [
      ...cacheDataList,
      ...(data?.data.filter(
        (d) => !!d && (!type || type === PoolFetchType.All || type.toLocaleLowerCase() === d.type.toLocaleLowerCase())
      ) || [])
    ],
    [data, cacheDataList, type]
  )
  const dataMap = useMemo(() => resData.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}), [resData]) as {
    [key: string]: T
  }
  const formattedData = useMemo(
    () => (resData ? resData.map((d) => formatPoolData(formatAprData(d))) : undefined),
    [resData]
  ) as ConditionalPoolType<T>[]
  const formattedDataMap = useMemo(() => formattedData.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}), [formattedData]) as {
    [key: string]: ConditionalPoolType<T>
  }
  const isEmptyResult = !!idList.length && !isLoading && (!data || !resData.length || !!error)

  useEffect(() => {
    if (resData) resData.forEach((d) => poolInfoCache.set(d.id, d))
  }, [resData])

  return {
    data: data?.data.filter(Boolean).map(formatAprData) as T[],
    dataMap,
    formattedData,
    formattedDataMap,
    isLoading,
    error,
    isEmptyResult,
    mutate: mutate as any,
    ...rest
  }
}
