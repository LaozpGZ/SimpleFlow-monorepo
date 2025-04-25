import { Token } from '@pancakeswap/swap-sdk-core'
import { tryParsePrice } from 'hooks/v3/utils'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import { useV3FormState } from '../reducer'
import { useV3MintActionHandlers } from './useV3MintActionHandlers'

export const useInitialRange = (baseToken?: Token, quoteToken?: Token) => {
  const { query } = useRouter()
  const { onBothRangeInput } = useV3MintActionHandlers(undefined)
  const { leftRangeTypedValue, rightRangeTypedValue } = useV3FormState()
  const [minPrice, maxPrice] = useMemo(() => {
    const { minPrice: rawMinPrice, maxPrice: rawMaxPrice } = query

    return [rawMinPrice, rawMaxPrice].map((p) => {
      if (typeof p === 'string' && (p === 'true' || !Number.isNaN(p))) return p
      return undefined
    })
  }, [query])

  useEffect(() => {
    if (!leftRangeTypedValue && !rightRangeTypedValue && minPrice && maxPrice) {
      onBothRangeInput({
        leftTypedValue: minPrice === 'true' ? true : tryParsePrice(baseToken, quoteToken, minPrice),
        rightTypedValue: maxPrice === 'true' ? true : tryParsePrice(baseToken, quoteToken, maxPrice),
      })
    }
  }, [query, minPrice, maxPrice, baseToken, quoteToken, leftRangeTypedValue, rightRangeTypedValue, onBothRangeInput])
}
