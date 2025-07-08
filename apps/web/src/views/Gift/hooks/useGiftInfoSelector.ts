import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback } from 'react'
import { useAllTokens } from 'hooks/Tokens'
import { checksumAddress } from 'utils/checksumAddress'
import { GiftInfo, GiftInfoResponse } from '../types'

export default function useGiftInfoSelector() {
  const { chainId } = useActiveChainId()
  const native = useNativeCurrency(chainId)

  const allTokens = useAllTokens()

  return useCallback(
    (gift?: GiftInfoResponse): GiftInfo | null => {
      // Why null?
      // Because we want to differentiate between gift is not loaded and gift is invalid
      // if gift is undefined, it means the gift is not loaded yet
      // if gift is null, it means the gift is invalid
      if (!gift) {
        return null
      }

      const token = allTokens[checksumAddress(gift.token as `0x${string}`)]

      if (!token) {
        return null
      }

      try {
        return {
          ...gift,
          tokenAmount: CurrencyAmount.fromRawAmount(token, gift.tokenAmount),
          nativeAmount: CurrencyAmount.fromRawAmount(native, gift.nativeAmount),
        }
      } catch (error) {
        console.error(error)
        return null
      }
    },
    [chainId, native, allTokens],
  )
}
