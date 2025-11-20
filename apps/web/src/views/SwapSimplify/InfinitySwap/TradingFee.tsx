import { useTranslation } from '@pancakeswap/localization'
import { PriceOrder, SVMTrade } from '@pancakeswap/price-api-sdk'
import { FlexGap, SkeletonV2, Text } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { memo, useMemo } from 'react'
import { isSVMOrder, isSolanaBridge, isXOrder } from 'views/Swap/utils'
import { Currency, SPLToken, TradeType } from '@pancakeswap/sdk'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

import BigNumber from 'bignumber.js'
import { useSolanaTokenPrices } from 'hooks/solana/useSolanaTokenPrice'
import { useSolanaTokenList } from 'hooks/solana/useSolanaTokenList'
import { TOKEN_WSOL } from '@pancakeswap/solana-core-sdk'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { SOLANA_NATIVE_TOKEN_ADDRESS } from 'quoter/consts'

import { useIsWrapping, useSlippageAdjustedAmounts } from '../../Swap/V3Swap/hooks'
import { useHasDynamicHook } from '../hooks/useHasDynamicHook'
import { usePriceBreakdown } from '../hooks/usePriceBreakdown'
import { useDirectBestSolanaTrade } from '../hooks/useDirectBestSolanaTrade'

interface TradingFeeProps {
  loaded: boolean
  order?: PriceOrder
}

export const SVMTradingFee = memo(
  ({ routes, inputCurrencySymbol }: { routes: SVMTrade<TradeType>['routes']; inputCurrencySymbol: string }) => {
    const allPools = useMemo(() => {
      return routes.flatMap((route) => (route as any)?.pools ?? [])
    }, [routes])

    // Collect unique fee mints from all pools
    const uniqueMints = useMemo(() => {
      const mintSet = new Set<string>()
      for (const pool of allPools) {
        let mint: string | undefined = pool?.feeMintAddress

        // if mint === SOLANA_NATIVE_TOKEN_ADDRESS, convert to WSOL
        // because price api only support WSOL
        if (mint === SOLANA_NATIVE_TOKEN_ADDRESS) {
          mint = TOKEN_WSOL.address
        }

        if (mint) mintSet.add(mint)
      }

      return Array.from(mintSet)
    }, [allPools])

    // Input currency Address is the first token in the first pool in the first route
    const inputCurrencyAddress = uniqueMints?.length ? uniqueMints[0] : ''

    const { data: priceMap, isLoading } = useSolanaTokenPrices({
      mints: uniqueMints,
      enabled: uniqueMints.length > 0,
    })

    const { tokenList } = useSolanaTokenList()

    // Only map tokens that we actually need (those in uniqueMints) and construct missingMints
    const { tokenMap, missingMints } = useMemo(() => {
      const map = new Map<string, SPLToken>()
      const uniqueMintsSet = new Set(uniqueMints.map((mint) => mint))
      const missing: SPLToken[] = []

      for (const token of tokenList) {
        // Early exit if we've found all tokens we need
        if (uniqueMintsSet.size === 0) break

        if (uniqueMintsSet.has(token.address)) {
          map.set(token.address, token)

          if (priceMap[token.address] === undefined) {
            missing.push(token)
          }

          uniqueMintsSet.delete(token.address) // Remove from set once found
        }
      }

      return { tokenMap: map, missingMints: missing }
    }, [tokenList, uniqueMints, priceMap])

    const { fallbackPriceMap, isFallbackLoading } = useDirectBestSolanaTrade(missingMints)

    const combinedPriceMap = useMemo(
      () => ({ ...(priceMap || {}), ...(fallbackPriceMap || {}) }),
      [priceMap, fallbackPriceMap],
    )

    const totalFeeInInputCurrency = useMemo(() => {
      if (!allPools?.length || !combinedPriceMap) return undefined
      const inputUsd = combinedPriceMap[inputCurrencyAddress]

      if (inputUsd === undefined || inputUsd === 0) return undefined

      let totalUsdValue = new BigNumber(0)

      // 1. Sum all USD value of all fee mints
      for (const pool of allPools) {
        const feeAmountRaw: string | undefined = pool?.feeAmount
        const feeMint: string | undefined = pool?.feeMintAddress
        if (!feeAmountRaw || !feeMint) continue

        const meta = tokenMap.get(feeMint)
        const decimals = meta?.decimals
        if (decimals === undefined) {
          continue
        }

        const humanAmount = new BigNumber(feeAmountRaw).div(new BigNumber(10).pow(decimals))
        const tokenUsd = combinedPriceMap[feeMint]
        if (tokenUsd === undefined) {
          continue
        }

        totalUsdValue = totalUsdValue.plus(humanAmount.multipliedBy(tokenUsd))
      }

      // 2. Convert USD sum to input currency
      const totalFeeInInputCurrency = totalUsdValue.dividedBy(inputUsd)

      return { value: totalFeeInInputCurrency.toNumber() }
    }, [combinedPriceMap, allPools, inputCurrencyAddress, tokenMap])

    const display = useMemo(() => {
      if (!totalFeeInInputCurrency) return null
      const prefix = '~'
      return `${prefix}${formatNumber(totalFeeInInputCurrency.value, {
        maxDecimalDisplayDigits: 6,
      })} ${inputCurrencySymbol}`
    }, [totalFeeInInputCurrency, inputCurrencySymbol])

    const isDataReady = !isLoading && !isFallbackLoading

    return (
      <SkeletonV2 width="100px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={isDataReady}>
        <Text color="textSubtle" fontSize="14px">
          {display ?? '-'}
        </Text>
      </SkeletonV2>
    )
  },
)

export const TradingFee: React.FC<TradingFeeProps> = memo(({ order, loaded }) => {
  const { t } = useTranslation()
  const slippageAdjustedAmounts = useSlippageAdjustedAmounts(order)

  const priceBreakdown = usePriceBreakdown(order)

  const hasDynamicHooks = useHasDynamicHook(order)
  const isWrapping = useIsWrapping()

  // Calculate all derived values before any conditional returns
  const lpFeeAmount = Array.isArray(priceBreakdown) ? undefined : priceBreakdown?.lpFeeAmount
  const inputAmount = order?.trade?.inputAmount

  const feeAmountNumber = useMemo(() => {
    if (!lpFeeAmount) return undefined
    return parseFloat(lpFeeAmount.toExact())
  }, [lpFeeAmount])

  const feeCurrency = useMemo(() => {
    if (!lpFeeAmount || SPLToken.isSPLToken(lpFeeAmount.currency)) return undefined
    return lpFeeAmount.currency as Currency
  }, [lpFeeAmount])

  const feeUsdValue = useStablecoinPriceAmount(feeCurrency, feeAmountNumber, {
    enabled: Boolean(feeCurrency && feeAmountNumber && order && !isXOrder(order)),
  })

  // Now perform conditional returns after all hooks have been called
  if (Array.isArray(priceBreakdown)) {
    return null
  }

  if (isWrapping || !order || !order.trade || !slippageAdjustedAmounts) {
    return null
  }

  // No need to show trading fee for solana bridge, similar to evm bridge
  if (isSolanaBridge(order)) return null

  let feeText: React.ReactNode

  if (isSVMOrder(order) && inputAmount?.currency?.symbol) {
    feeText = <SVMTradingFee routes={order.trade.routes} inputCurrencySymbol={inputAmount.currency.symbol} />
  } else if (isXOrder(order)) {
    feeText = (
      <Text color="primary" fontSize="14px">
        0 {inputAmount?.currency?.symbol}
      </Text>
    )
  } else {
    feeText = (
      <Text color="textSubtle" fontSize="14px">
        {feeUsdValue !== undefined
          ? `${hasDynamicHooks ? '~' : ''}${formatDollarAmount(feeUsdValue, 3)}`
          : `${hasDynamicHooks ? '~' : ''}${formatAmount(lpFeeAmount, 4)} ${inputAmount?.currency?.symbol}`}
      </Text>
    )
  }

  return (
    <FlexGap gap="8px" alignItems="center">
      <Text color="textSubtle" fontSize="14px">
        {t('Fee.rate')}
      </Text>
      <SkeletonV2 width="108px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={loaded}>
        {feeText}
      </SkeletonV2>
    </FlexGap>
  )
})
