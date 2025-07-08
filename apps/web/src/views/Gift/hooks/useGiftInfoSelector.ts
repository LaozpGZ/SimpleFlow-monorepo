import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { BalanceData } from 'hooks/useAddressBalance'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback } from 'react'
import { GiftInfo, GiftInfoResponse } from '../types'

export default function useGiftInfoSelector(assets: BalanceData[]) {
  const { chainId } = useActiveChainId()
  const native = useNativeCurrency(chainId)

  return useCallback(
    (gift?: GiftInfoResponse): GiftInfo | null => {
      // Why null?
      // Because we want to differentiate between gift is not loaded and gift is invalid
      // if gift is undefined, it means the gift is not loaded yet
      // if gift is null, it means the gift is invalid
      if (!gift) {
        return null
      }

      const asset = assets.find(
        (asset) => asset.token.address.toLowerCase() === gift.token.toLowerCase() && asset.chainId === chainId,
      )

      if (!asset) {
        return null
      }

      try {
        const tokenInfo = new WrappedTokenInfo({
          name: asset.token.name,
          symbol: asset.token.symbol,
          decimals: asset.token.decimals,
          address: asset.token.address as `0x${string}`,
          chainId: asset.chainId,
          logoURI: asset.token.logoURI,
        })

        return {
          ...gift,
          tokenInfo,
          tokenAmount: CurrencyAmount.fromRawAmount(tokenInfo, gift.tokenAmount),
          nativeAmount: CurrencyAmount.fromRawAmount(native, gift.nativeAmount),
          // TODO: Update nativePrice and tokenPrice to use the price from the asset
          nativePrice: asset.price?.usd ?? 0,
          tokenPrice: asset.price?.usd ?? 0,
        }
      } catch (error) {
        console.error(error)
        return null
      }
    },
    [assets, chainId, native],
  )
}
