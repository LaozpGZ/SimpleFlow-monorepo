import { useEffect, useMemo } from 'react'

import { useAccount } from 'wagmi'

import { Currency } from '@pancakeswap/swap-sdk-core'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { Pool } from '@pancakeswap/v3-sdk'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId, useUnclaimedFarmRewardsUSDByTokenId } from 'hooks/infinity/useFarmReward'
import { useFeesEarnedUSD } from 'hooks/infinity/useFeesEarned'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees'
import { Address } from 'viem'
import { useV3CakeEarning } from 'views/universalFarms/hooks/useCakeEarning'
import { usePositionEarningAmount } from 'views/universalFarms/hooks/usePositionEarningAmount'

// Helper function to standardize number conversion
const safeParseFloat = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0
  const parsed = typeof value === 'string' ? parseFloat(value) : value
  return Number.isNaN(parsed) ? 0 : parsed
}

const EarningsUSD = ({ earningsBusd }: { earningsBusd: number }) => {
  return <div>~${formatNumber(earningsBusd)}</div>
}

export const V3EarningsCell = ({
  tokenId,
  chainId,
  pool,
  currency0,
  currency1,
}: {
  tokenId?: bigint
  chainId: number
  pool?: Pool
  currency0?: Currency
  currency1?: Currency
}) => {
  const { earningsBusd: cakeEarnings } = useV3CakeEarning(
    useMemo(() => (tokenId ? [tokenId] : []), [tokenId]),
    chainId,
  )

  // Get LP fees for V3 position
  const [feeValue0, feeValue1] = useV3PositionFees(pool ?? undefined, tokenId, false)

  // Get USD prices for fee calculation (cached by the hook)
  const { data: price0Usd } = useCurrencyUsdPrice(currency0 ?? undefined, {
    enabled: Boolean(currency0 && feeValue0?.greaterThan(0)),
  })
  const { data: price1Usd } = useCurrencyUsdPrice(currency1 ?? undefined, {
    enabled: Boolean(currency1 && feeValue1?.greaterThan(0)),
  })

  // Standardized LP fee calculation
  const lpFeesUSD = useMemo(() => {
    const fee0USD = price0Usd && feeValue0 ? safeParseFloat(feeValue0.toExact()) * price0Usd : 0
    const fee1USD = price1Usd && feeValue1 ? safeParseFloat(feeValue1.toExact()) * price1Usd : 0
    return fee0USD + fee1USD
  }, [price0Usd, price1Usd, feeValue0, feeValue1])

  const totalEarnings = cakeEarnings + lpFeesUSD

  return <EarningsUSD earningsBusd={totalEarnings} />
}

export const InfinityBinEarningsCell = ({ chainId, poolId }: { chainId?: number; poolId?: Address }) => {
  const { address } = useAccount()
  const {
    data: { rewardsAmount, rewardsUSD },
    isLoading,
  } = useUnclaimedFarmRewardsUSDByPoolId({
    chainId,
    poolId,
    address,
    timestamp: dayjs().startOf('hour').unix(),
  })

  // Standardized amount calculation
  const amount = useMemo(() => {
    if (!rewardsAmount) return 0
    const decimal = Math.min(rewardsAmount.currency.decimals ?? 18, 18)
    return safeParseFloat(rewardsAmount.toFixed(decimal))
  }, [rewardsAmount])

  const [, updatePositionEarningAmount] = usePositionEarningAmount()

  useEffect(() => {
    if (!(chainId && poolId && !isLoading)) {
      return
    }
    updatePositionEarningAmount(chainId, poolId, amount)
  }, [amount, chainId, poolId, isLoading, updatePositionEarningAmount])

  // TODO: Add Bin LP fees calculation when needed
  return <EarningsUSD earningsBusd={rewardsUSD} />
}

export const InfinityCLEarningsCell = ({
  tokenId,
  chainId,
  poolId,
  currency0,
  currency1,
  tickLower,
  tickUpper,
}: {
  tokenId?: bigint
  chainId?: number
  poolId?: Address
  currency0?: Currency
  currency1?: Currency
  tickLower?: number
  tickUpper?: number
}) => {
  const { address } = useAccount()

  // Get farm rewards
  const {
    data: { rewardsAmount, rewardsUSD },
    isLoading,
  } = useUnclaimedFarmRewardsUSDByTokenId({
    chainId,
    tokenId,
    poolId,
    address,
    timestamp: dayjs().startOf('hour').unix(),
  })

  // Get LP fees
  const { totalFiatValue: lpFeesUSD } = useFeesEarnedUSD({
    currency0,
    currency1,
    tokenId,
    poolId,
    tickLower,
    tickUpper,
  })

  const amount = useMemo(() => {
    if (!rewardsAmount) return 0
    const decimal = Math.min(rewardsAmount.currency.decimals ?? 18, 18)
    return safeParseFloat(rewardsAmount.toFixed(decimal))
  }, [rewardsAmount])

  const [, updatePositionEarningAmount] = usePositionEarningAmount()

  useEffect(() => {
    if (!(chainId && poolId && tokenId && !isLoading)) {
      return
    }
    updatePositionEarningAmount(chainId, poolId, tokenId, amount)
  }, [amount, chainId, poolId, tokenId, isLoading, updatePositionEarningAmount])

  // Standardized LP fee conversion
  const lpFeesUSDValue = useMemo(() => {
    return lpFeesUSD ? safeParseFloat(lpFeesUSD.toExact()) : 0
  }, [lpFeesUSD])

  // Combine farm rewards + LP fees
  const totalEarnings = rewardsUSD + lpFeesUSDValue

  return <EarningsUSD earningsBusd={totalEarnings} />
}
