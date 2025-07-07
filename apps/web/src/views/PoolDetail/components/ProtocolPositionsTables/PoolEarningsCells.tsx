import { useEffect, useMemo } from 'react'

import { useAccount } from 'wagmi'

import { formatNumber } from '@pancakeswap/utils/formatBalance'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId, useUnclaimedFarmRewardsUSDByTokenId } from 'hooks/infinity/useFarmReward'
import { PoolInfo } from 'state/farmsV4/state/type'
import { Address } from 'viem'
import { useV2CakeEarning, useV3CakeEarning } from 'views/universalFarms/hooks/useCakeEarning'
import { usePositionEarningAmount } from 'views/universalFarms/hooks/usePositionEarningAmount'

const Earnings = ({ earningsAmount, earningsBusd }: { earningsAmount: number; earningsBusd: number }) => {
  return <div>~${formatNumber(earningsBusd)}</div>
}

export const V2EarningsCell = ({ pool }: { pool: PoolInfo | null | undefined }) => {
  const { earningsAmount, earningsBusd } = useV2CakeEarning(pool)
  return <Earnings earningsAmount={earningsAmount} earningsBusd={earningsBusd} />
}

export const V3EarningsCell = ({ tokenId, chainId }: { tokenId?: bigint; chainId: number }) => {
  const { earningsAmount, earningsBusd } = useV3CakeEarning(
    useMemo(() => (tokenId ? [tokenId] : []), [tokenId]),
    chainId,
  )
  return <Earnings earningsAmount={earningsAmount} earningsBusd={earningsBusd} />
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
  const amount = useMemo(() => {
    const decimal = Math.min(rewardsAmount?.currency.decimals ?? 18, 18)
    return Number(rewardsAmount?.toFixed(decimal) ?? 0)
  }, [rewardsAmount])

  const [, updatePositionEarningAmount] = usePositionEarningAmount()

  useEffect(() => {
    if (!(chainId && poolId && !isLoading)) {
      return
    }
    updatePositionEarningAmount(chainId, poolId, amount)
  }, [amount, chainId, poolId, isLoading, updatePositionEarningAmount])
  return <Earnings earningsAmount={amount} earningsBusd={rewardsUSD} />
}

export const InfinityCLEarningsCell = ({
  tokenId,
  chainId,
  poolId,
}: {
  tokenId?: bigint
  chainId?: number
  poolId?: Address
}) => {
  const { address } = useAccount()
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
  const amount = useMemo(() => {
    const decimal = Math.min(rewardsAmount?.currency.decimals ?? 18, 18)
    return Number(rewardsAmount?.toFixed(decimal) ?? 0)
  }, [rewardsAmount])

  const [, updatePositionEarningAmount] = usePositionEarningAmount()

  useEffect(() => {
    if (!(chainId && poolId && tokenId && !isLoading)) {
      return
    }
    updatePositionEarningAmount(chainId, poolId, tokenId, amount)
  }, [amount, chainId, poolId, tokenId, isLoading, updatePositionEarningAmount])

  return <Earnings earningsAmount={amount} earningsBusd={rewardsUSD} />
}
