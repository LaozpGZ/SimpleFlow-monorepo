import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { BalanceData } from 'hooks/useAddressBalance'
import useNativeCurrency from 'hooks/useNativeCurrency'
import lowerCase from 'lodash/lowerCase'
import { useCallback } from 'react'
import { GiftInfo, GiftInfoResponse } from '../types'

export default function useGiftInfoSelector(assets: BalanceData[]) {
  const { chainId } = useActiveChainId()
  const native = useNativeCurrency(chainId)

  return useCallback(
    (gift?: GiftInfoResponse): GiftInfo | undefined => {
      if (!gift) {
        return undefined
      }

      const asset = assets.find(
        (asset) => lowerCase(asset.token.address) === lowerCase(gift.token) && asset.chainId === chainId,
      )

      if (!asset) {
        return undefined
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
        return undefined
      }
    },
    [assets, chainId, native],
  )
}
