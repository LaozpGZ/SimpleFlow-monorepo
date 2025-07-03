import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { BalanceData } from 'hooks/useAddressBalance'
import { useAccount } from 'wagmi'
import { NEXT_PUBLIC_GIFT_API } from '../constants'
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

export const useGetGiftInfo = (assets: BalanceData[]) => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const selectGiftInfo = useGiftInfoSelector(assets)

  return useQuery({
    queryKey: ['gift-info', chainId, account],
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
      return data.map(selectGiftInfo).filter((gift) => gift !== undefined)
    },
    enabled: Boolean(chainId && account),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}

export const useGetGiftByCodeHash = ({ codeHash, assets }: { codeHash?: string; assets: BalanceData[] }) => {
  const { chainId } = useActiveChainId()

  const selectGiftInfo = useGiftInfoSelector(assets)

  return useQuery({
    queryKey: ['gift-info', chainId, codeHash],
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
