import { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import { KeyedMutator } from 'swr'
import { shallow } from 'zustand/shallow'
import { ApiV3PoolInfoItem, PoolFetchType } from '@pancakeswap/solana-core-sdk'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { formatPoolData, formatAprData } from './formatter'
import { ReturnPoolType, ReturnFormattedPoolType, PoolsApiReturnType } from './type'

const PRESET_FARM_POOLS: any[] = [
  {
    type: 'Concentrated',
    programId: 'HpNfyc2Saw7RKkQd8nEL4khUcuPhQ7WwY1B2qjx8jxFq',
    id: '58dx2QN7cvbswwqQTXHKZRBxNz6VGbSMCpowMU6hCi2G',
    mintA: {
      chainId: 101,
      address: 'sAjQ5LY7PKQa1CVgt9eNqK4y8Mqz6rmZTJD5djmaafF',
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      logoURI: 'https://tokens.pancakeswap.finance/images/sAjQ5LY7PKQa1CVgt9eNqK4y8Mqz6rmZTJD5djmaafF.png',
      symbol: 'T0',
      name: 'Pancake Test Token0',
      decimals: 9,
      tags: [],
      extensions: {}
    },
    mintB: {
      chainId: 101,
      address: 'D58GAhGCSk4cwY368eZBrPprAcvenKJjeDFLgrndpjg5',
      programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
      logoURI: 'https://tokens.pancakeswap.finance/images/GYJmWVaKE1w7PwhsvwbUpj3JAzLGaGMJZfEdAi9iyTem.png',
      symbol: 'T1',
      name: 'Pancake Test Token1',
      decimals: 6,
      tags: [],
      extensions: {}
    },
    price: 0,
    mintAmountA: 341.982441967,
    mintAmountB: 130.188007,
    feeRate: 0.0025,
    openTime: '1750649374000',
    tvl: 0,
    vault: {
      A: 'cn4DF1DknKgDQ6C51Lcfi2SMDf3ruzVWGPASBegpR83',
      B: 'Cv2nx5B49aNaovvUBtXarW7FfjYMUzJGsLrzaSYh6dX8'
    },
    day: {
      volume: 0,
      volumeQuote: 0,
      volumeFee: 0,
      priceMin: 0,
      priceMax: 0
    },
    week: {
      volume: 0,
      volumeQuote: 0,
      volumeFee: 0,
      priceMin: 0,
      priceMax: 0
    },
    month: {
      volume: 0,
      volumeQuote: 261.69318381136367,
      volumeFee: 0,
      priceMin: 0.9461564545454546,
      priceMax: 0.9970875
    },
    config: {
      id: 'He4brjK7TRKiqJ8szpRmhuueDwC4837BFRRBmWfmjo14',
      index: 1,
      protocolFeeRate: 120000,
      tradeFeeRate: 2500,
      tickSpacing: 60,
      fundFeeRate: 0,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5]
    },
    poolType: 'concentrated'
  }
]

type FetcherReturnType = Awaited<ReturnType<typeof fetcher>>

let refreshTag = Date.now()
export const refreshPoolCache = () => {
  refreshTag = Date.now()
}

const fetcher = ([url]: [url: string]) =>
  axios.get<PoolsApiReturnType, PoolsApiReturnType>(url).then((res) => {
    return {
      data: {
        data: res?.data ?? [],
        count: res?.data.length,
        hasNextPage: res?.pagination.totalPages > res?.pagination.page
      }
    }
  })

const PAGE_SIZE = 100

export default function useFetchPoolList<T extends PoolFetchType>(props?: {
  type?: T
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
  refreshInterval?: number
  shouldFetch?: boolean
  showFarms?: boolean
}): {
  data: ReturnPoolType<T>[]
  formattedData: ReturnFormattedPoolType<T>[]
  isLoadEnded: boolean
  setSize: (size: number | ((_size: number) => number)) => Promise<FetcherReturnType[] | undefined>

  size: number
  loadMore: () => void
  mutate: KeyedMutator<FetcherReturnType[]>
  isValidating: boolean
  isLoading: boolean
  isEmpty: boolean
  error?: any
} {
  const {
    type = PoolFetchType.All,
    pageSize = PAGE_SIZE,
    sort = 'default',
    order = 'desc',
    refreshInterval = MINUTE_MILLISECONDS,
    shouldFetch = true,
    showFarms
  } = props || {}
  const [host, listUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_LIST], shallow)

  const url = `${host + listUrl}?poolType=${showFarms ? `${type}Farm` : type}&poolSortField=${sort}&sortType=${order}&pageSize=${pageSize}`

  const { data, setSize, error, ...swrProps } = useSWRInfinite(
    (index) => (shouldFetch ? [`${url}&page=${index + 1}`, refreshTag] : null),
    fetcher,
    {
      revalidateFirstPage: false,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const issues = useMemo(() => {
    // TODO: Remove this after testing, when BE supports farms
    if (showFarms) {
      // Use preset farm pools for testing
      return PRESET_FARM_POOLS.map(formatAprData) as ReturnPoolType<T>[]
    }

    return (data || [])
      .reduce((acc, cur) => acc.concat(cur.data.data), [] as ApiV3PoolInfoItem[])
      .filter(Boolean)
      .map(formatAprData) as ReturnPoolType<T>[]
  }, [data, showFarms])

  const formattedData = useMemo(() => issues.map((i) => formatPoolData(i)), [issues]) as ReturnFormattedPoolType<T>[]

  const lastData = data?.[data.length - 1]
  const isLoadEnded = !lastData || !lastData.data.hasNextPage || lastData.data.data.length < pageSize || !!error
  const loadMore = useCallback(() => setSize((s) => s + 1), [type, sort, order])
  const isEmpty = isLoadEnded && (!data || !data.length)

  return {
    ...swrProps,
    setSize,
    loadMore,
    error,
    data: issues,
    formattedData,
    isLoadEnded,
    isEmpty
  }
}
