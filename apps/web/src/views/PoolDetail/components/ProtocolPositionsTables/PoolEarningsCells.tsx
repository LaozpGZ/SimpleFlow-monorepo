import { useEffect, useMemo } from 'react'

import { useAccount } from 'wagmi'

import { Protocol } from '@pancakeswap/farms'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { Pool } from '@pancakeswap/v3-sdk'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId, useUnclaimedFarmRewardsUSDByTokenId } from 'hooks/infinity/useFarmReward'
import { useFeesEarnedUSD } from 'hooks/infinity/useFeesEarned'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees'
import { useAccountPositionDetailByPool } from 'state/farmsV4/hooks'
import { PoolInfo, V2PoolInfo } from 'state/farmsV4/state/type'
import { Address } from 'viem'
import { useV2CakeEarning, useV3CakeEarning } from 'views/universalFarms/hooks/useCakeEarning'
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

export const V2EarningsCell = ({ pool }: { pool: PoolInfo | null | undefined }) => {
  const { address: account } = useAccount()
  const { earningsBusd: cakeEarnings } = useV2CakeEarning(pool)

  // Get user's V2 position data to calculate LP fees
  const { data: v2Position } = useAccountPositionDetailByPool<Protocol.V2>(
    pool?.chainId ?? 0,
    account,
    pool?.protocol === 'v2' ? (pool as V2PoolInfo) : undefined,
  )

  // Calculate uncollected V2 LP fees
  // TODO: Re-check this logic, assuming 24h volume for earning calculation...
  const lpFeesUSD = useMemo(() => {
    if (!pool || !v2Position || pool.protocol !== 'v2') return 0

    // Get recent pool volume to estimate uncollected fees
    const volume24h = safeParseFloat(pool.vol24hUsd)

    if (volume24h === 0) return 0

    // Calculate user's share of the pool
    const userTotalLPBalance = v2Position.nativeBalance.add(v2Position.farmingBalance)
    const totalSupply = v2Position.totalSupply

    if (userTotalLPBalance.equalTo(0) || totalSupply.equalTo(0)) return 0

    // User's percentage of the pool
    const userPoolPercentage = parseFloat(userTotalLPBalance.divide(totalSupply).toFixed(10))

    // Estimate uncollected fees: user's share of recent trading volume * LP fee rate (0.17%)
    const LP_FEE_RATE = 0.0017 // 0.17% goes to LPs
    return volume24h * LP_FEE_RATE * userPoolPercentage
  }, [pool, v2Position])

  const totalEarnings = cakeEarnings + lpFeesUSD

  return <EarningsUSD earningsBusd={totalEarnings} />
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

  // Get LP fees - standardized approach
  const { totalFiatValue: lpFeesUSD } = useFeesEarnedUSD({
    currency0,
    currency1,
    tokenId,
    poolId,
    tickLower,
    tickUpper,
  })

  // Standardized amount calculation
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
