import type { TokenInfo } from '@pancakeswap/token-lists'
import type { ListsState } from '@pancakeswap/token-lists/react'
import { memoizeAsync } from '@pancakeswap/utils/memoize'
import { atom } from 'jotai'
import type { Getter } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { RWA_URLS } from 'config/constants/lists'
import { listsAtom } from 'state/lists/lists'

const RWA_STATUS_ENDPOINT = 'https://raw-api.pancakeswap.com/ondo/status'
const MEMOIZE_TTL_MS = 30 * 1000

interface RwaAssetStatus {
  symbol: string
  status?: string
  type?: string
  reason?: {
    code?: string
    message?: string
    documentation?: string
  }
  start?: string
  end?: string
}

type RwaPauseCode = 'MARKET_CLOSED' | 'MARKET_PAUSED' | 'ASSET_PAUSED'

type RwaTokenStatusInfo = {
  status: 'active' | 'upcoming'
  code?: RwaPauseCode
}

const fetchRwaStatuses = memoizeAsync(
  async (): Promise<RwaAssetStatus[]> => {
    if (typeof window === 'undefined') {
      return []
    }
    const response = await fetch(RWA_STATUS_ENDPOINT, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RWA statuses: ${response.status}`)
    }

    const data = (await response.json()) as RwaAssetStatus[]
    return Array.isArray(data) ? data : []
  },
  {
    isValid: (result) => Array.isArray(result),
    resolver: () => Math.floor(Date.now() / MEMOIZE_TTL_MS),
  },
)

const normalizeAddress = (address: string) => address.toLowerCase()

const findRwaToken = (lists: ListsState | undefined, chainId: number, address: string): TokenInfo | undefined => {
  if (!lists?.byUrl) {
    return undefined
  }

  const normalized = normalizeAddress(address)

  for (const url of RWA_URLS) {
    const tokenList = lists.byUrl[url]?.current
    if (!tokenList?.tokens?.length) {
      continue
    }

    const token = tokenList.tokens.find((item) => item.chainId === chainId && item.address.toLowerCase() === normalized)
    if (token) {
      return token
    }
  }

  return undefined
}

export const rwaStatusesAtom = atom(async () => fetchRwaStatuses())

const DEFAULT_STATUS: RwaTokenStatusInfo = { status: 'active' }

const parseTimestamp = (value?: string): number | undefined => {
  if (!value) {
    return undefined
  }
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const selectStatusForCurrentTime = (statuses: RwaAssetStatus[], now: number): RwaAssetStatus | undefined => {
  if (!statuses.length) {
    return undefined
  }

  const withTimestamps = statuses.map((item) => ({
    item,
    startTime: parseTimestamp(item.start),
    endTime: parseTimestamp(item.end),
  }))

  const active = withTimestamps
    .filter(({ startTime, endTime }) => {
      if (startTime !== undefined && now < startTime) {
        return false
      }
      if (endTime !== undefined && now >= endTime) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const aStart = a.startTime ?? Number.NEGATIVE_INFINITY
      const bStart = b.startTime ?? Number.NEGATIVE_INFINITY
      return bStart - aStart
    })[0]

  if (active) {
    return active.item
  }
  return undefined
}

export const isRwaTokenAtom = atomFamily(
  ({ chainId, address }: { chainId: number; address: string }) =>
    atom((get) => {
      const lists = get(listsAtom)
      return Boolean(findRwaToken(lists, chainId, address))
    }),
  (a, b) => a.chainId === b.chainId && normalizeAddress(a.address) === normalizeAddress(b.address),
)

export const getRwaTokenStatus = async (
  get: Getter,
  chainId: number,
  address: string,
): Promise<RwaTokenStatusInfo | undefined> => {
  if (!address) {
    return DEFAULT_STATUS
  }
  const lists = get(listsAtom)
  const token = findRwaToken(lists, chainId, address)
  if (!token) {
    return undefined
  }

  const statuses = await get(rwaStatusesAtom)
  const matchingStatuses = statuses.filter((item) => item.symbol?.toLowerCase() === token.symbol.toLowerCase())
  const status = selectStatusForCurrentTime(matchingStatuses, Date.now())
  if (!status) {
    return undefined
  }

  const { reason, status: apiStatus } = status
  const rawCode = reason?.code
  const code: RwaPauseCode | undefined =
    rawCode === 'MARKET_CLOSED' || rawCode === 'MARKET_PAUSED' || rawCode === 'ASSET_PAUSED' ? rawCode : undefined

  if (apiStatus === 'active' || apiStatus === 'upcoming') {
    return { status: apiStatus, code }
  }

  return DEFAULT_STATUS
}
