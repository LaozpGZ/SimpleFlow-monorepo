import { ChainId } from '@pancakeswap/chains'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { FAST_INTERVAL } from 'config/constants'
import { useTokenByChainId, useTokensByChainId } from 'hooks/Tokens'
import { useMemo } from 'react'
import { zeroAddress } from 'viem'
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

export const fetchGiftInfo = async ({
  chainId,
  account,
}: {
  chainId?: number
  account?: string
}): Promise<GiftInfoResponse[]> => {
  if (!chainId || !account) {
    throw new Error('Missing required parameters: chainId and account')
  }

  if (!NEXT_PUBLIC_GIFT_API) {
    throw new Error('API URL is not configured')
  }

  const urlSend = `${NEXT_PUBLIC_GIFT_API}/gift/list?chainId=${chainId}&address=${account}`
  const urlReceive = `${NEXT_PUBLIC_GIFT_API}/gift/list?chainId=${chainId}&claimerAddress=${account}`

  // promise all urlsend and urlreceive
  const [responseSend, responseReceive] = await Promise.all([fetch(urlSend), fetch(urlReceive)])

  if (!responseSend.ok || !responseReceive.ok) {
    throw new Error(
      `Failed to fetch gift info: ${responseSend.status} ${responseSend.statusText} ${responseReceive.status} ${responseReceive.statusText}`,
    )
  }

  const resultSend: GiftApiResponse<GiftInfoResponse[]> = await responseSend.json()
  const resultReceive: GiftApiResponse<GiftInfoResponse[]> = await responseReceive.json()

  if (resultSend.status === GiftApiStatus.FAILED || resultReceive.status === GiftApiStatus.FAILED) {
    throw new Error(resultSend.message || resultReceive.message || 'Failed to fetch gift information')
  }

  // ensure no duplicate gift codehash
  const giftCodes = new Set()
  const result = [...(resultSend.data || []), ...(resultReceive.data || [])]
  return result.filter((gift) => {
    if (giftCodes.has(gift.codeHash)) {
      return false
    }
    giftCodes.add(gift.codeHash)
    return true
  })
}

export const useGetGiftInfo = () => {
  const { address: account } = useAccount()
  const chainId = ChainId.BSC

  const selectGiftInfo = useGiftInfoSelector()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY_GIFT_INFO, chainId, account],
    queryFn: () =>
      fetchGiftInfo({
        chainId,
        account: account!,
      }),
    select: (data): GiftInfo[] => {
      return data.map(selectGiftInfo).filter((gift) => gift !== null)
    },
    enabled: Boolean(chainId && account),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    refetchInterval: FAST_INTERVAL,
  })

  const missingTokens = useMemo(() => data?.filter((gift) => gift?.currencyAmount === undefined) || [], [data])

  const tokens = useTokensByChainId(
    missingTokens.map((gift) => gift?.token),
    chainId,
  )

  const newData = useMemo(() => {
    return data?.map((gift) => {
      if (gift?.currencyAmount === undefined) {
        const isNative = gift.token === zeroAddress

        if (isNative) {
          return gift
        }

        const token = tokens[gift.token]
        if (!token) {
          return gift
        }

        return {
          ...gift,
          currencyAmount: CurrencyAmount.fromRawAmount(token, gift.tokenAmount),
        }
      }
      return gift
    })
  }, [data, tokens])

  return useMemo(() => {
    return {
      data: newData,
      isLoading,
    }
  }, [newData, isLoading])
}

export const useGetGiftByCodeHash = ({ codeHash }: { codeHash?: string }) => {
  // NOTE: hardcode to bsc for now
  const chainId = ChainId.BSC

  const selectGiftInfo = useGiftInfoSelector()

  const { data, isLoading } = useQuery({
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
    refetchOnMount: true,
  })

  const searchToken = useTokenByChainId(data?.currencyAmount !== null ? data?.token : undefined, chainId)

  if (data && searchToken) {
    data.currencyAmount = CurrencyAmount.fromRawAmount(searchToken, data?.tokenAmount)
  }

  return useMemo(() => {
    return {
      data,
      isLoading,
    }
  }, [data, isLoading])
}
