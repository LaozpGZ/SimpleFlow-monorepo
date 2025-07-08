import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { FAST_INTERVAL } from 'config/constants'
import { useAccount } from 'wagmi'
import { NEXT_PUBLIC_GIFT_API, QUERY_KEY_GIFT_INFO } from '../constants'
import { GiftInfo, GiftInfoResponse } from '../types'
import useGiftInfoSelector from './useGiftInfoSelector'

enum GiftApiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

// API Response Types based on the API specification
interface GiftApiResponse<T> {
  status: GiftApiStatus
  message?: string // if status is failed
  data?: T
}

export const useGetGiftInfo = () => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const selectGiftInfo = useGiftInfoSelector()

  return useQuery({
    queryKey: [QUERY_KEY_GIFT_INFO, chainId, account],
    queryFn: async (): Promise<GiftInfoResponse[]> => {
      if (!chainId || !account) {
        throw new Error('Missing required parameters: chainId and account')
      }

      if (!NEXT_PUBLIC_GIFT_API) {
        throw new Error('NEXT_PUBLIC_GIFT_API environment variable is not configured')
      }

      const url = `${NEXT_PUBLIC_GIFT_API}/gift/list?chainId=${chainId}&address=${account}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch gift info: ${response.status} ${response.statusText}`)
      }

      const result: GiftApiResponse<GiftInfoResponse[]> = await response.json()

      if (result.status === GiftApiStatus.FAILED) {
        throw new Error(result.message || 'Failed to fetch gift information')
      }

      return result.data || []
    },
    select: (data): GiftInfo[] => {
      return data.map(selectGiftInfo).filter((gift) => gift !== null)
    },
    enabled: Boolean(chainId && account),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    refetchInterval: FAST_INTERVAL,
  })
}

export const useGetGiftByCodeHash = ({ codeHash }: { codeHash?: string }) => {
  const { chainId } = useActiveChainId()

  const selectGiftInfo = useGiftInfoSelector()

  return useQuery({
    queryKey: [QUERY_KEY_GIFT_INFO, chainId, codeHash],
    queryFn: async (): Promise<GiftInfoResponse | undefined> => {
      if (!chainId) {
        throw new Error('Missing required parameters: chainId')
      }

      if (!NEXT_PUBLIC_GIFT_API) {
        throw new Error('NEXT_PUBLIC_GIFT_API environment variable is not configured')
      }

      const url = `${NEXT_PUBLIC_GIFT_API}/gift?codeHash=${codeHash}&chainId=${chainId}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch gift info: ${response.status} ${response.statusText}`)
      }

      const result: GiftApiResponse<GiftInfoResponse> = await response.json()

      if (result.status === GiftApiStatus.FAILED) {
        throw new Error(result.message || 'Failed to fetch gift information')
      }

      return result.data
    },
    select: (data) => {
      return selectGiftInfo(data)
    },
    enabled: Boolean(chainId && codeHash),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}
