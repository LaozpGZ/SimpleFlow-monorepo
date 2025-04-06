import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { SECONDS_PER_YEAR } from 'config'
import { useMemo } from 'react'
import { InfinityBinPositionDetail, InfinityCLPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { InfinityPoolInfo } from 'state/farmsV4/state/type'
import { Address } from 'viem/accounts'
import { useCampaignsByChainId } from './useCampaigns'

interface InfinityCakeAPRProps {
  chainId?: number
  poolId?: Address
  tvlUSD?: `${number}` | BigNumber
  cakePrice?: BigNumber
}

export const useInfinityCakeAPR = ({ chainId, poolId, tvlUSD, cakePrice }: InfinityCakeAPRProps) => {
  // just fetch all campaigns at once, avoid to fetch every pool
  const campaigns = useCampaignsByChainId({ chainId })
  return useMemo(() => {
    if (!tvlUSD || Number(tvlUSD) === 0 || !cakePrice || !poolId || !chainId) {
      return {
        value: '0' as `${number}`,
      }
    }
    const validCampaigns = campaigns?.filter(
      (c) => c?.duration && Number(c.duration) > 0 && c?.startTime && Number(c.startTime) * 1000 <= Date.now(),
    )
    const cakeRewardsPerYear = validCampaigns
      ?.filter((c) => (Number(c.startTime) + Number(c.duration)) * 1000 >= Date.now())
      .reduce((acc, campaign) => {
        const { totalRewardAmount, duration } = campaign
        return new BigNumber(totalRewardAmount).dividedBy(1e18).dividedBy(duration).times(SECONDS_PER_YEAR).plus(acc)
      }, new BigNumber(0))
    const poolCakeRewardsPerYear = validCampaigns
      ?.filter((c) => c.poolId === poolId)
      .filter((c) => (Number(c.startTime) + Number(c.duration)) * 1000 >= Date.now())
      .reduce((acc, campaign) => {
        const { totalRewardAmount, duration } = campaign
        return new BigNumber(totalRewardAmount).dividedBy(1e18).dividedBy(duration).times(SECONDS_PER_YEAR).plus(acc)
      }, new BigNumber(0))
    const APR = (poolCakeRewardsPerYear?.times(cakePrice).dividedBy(tvlUSD).toFixed(6) ?? '0') as `${number}`
    return {
      value: APR,
      cakePerYear: cakeRewardsPerYear,
      poolWeight: cakeRewardsPerYear ? poolCakeRewardsPerYear?.dividedBy(cakeRewardsPerYear) : BIG_ZERO,
      userTvlUsd: new BigNumber(tvlUSD),
    }
  }, [cakePrice, campaigns, chainId, poolId, tvlUSD])
}

type InfinityPositionCakeAPR<T extends InfinityCLPositionDetail | InfinityBinPositionDetail> = InfinityCakeAPRProps & {
  pool: InfinityPoolInfo
  position: T
}

export const useInfinityCLPositionCakeAPR = ({
  tvlUSD,
  cakePrice,
  position,
  pool,
}: InfinityPositionCakeAPR<InfinityCLPositionDetail>) => {
  const { chainId, poolId } = pool
  const { cakePerYear, poolWeight } = useInfinityCakeAPR({ chainId, poolId, tvlUSD, cakePrice })

  return useMemo(() => {
    if (!cakePerYear || !tvlUSD) {
      return {
        value: '0' as `${number}`,
      }
    }

    return {
      value: new BigNumber(cakePerYear)
        .times(poolWeight ?? 0)
        .times(cakePrice ?? 1)
        .times(new BigNumber(position.liquidity.toString()).dividedBy(pool.liquidity?.toString() ?? 1))
        .div(tvlUSD)
        .toString() as `${number}`,
    }
  }, [cakePerYear, tvlUSD, position.liquidity, poolWeight, pool.liquidity, cakePrice])
}

export const useInfinityBinPositionCakeAPR = ({
  tvlUSD,
  cakePrice,
  position,
  pool,
}: InfinityPositionCakeAPR<InfinityBinPositionDetail>) => {
  const { chainId, poolId } = pool
  const activeTVLUsd = useMemo(() => {
    if (!tvlUSD || !position.liquidity || !position.poolLiquidity) {
      return '0' as `${number}`
    }
    return new BigNumber(tvlUSD).times(
      new BigNumber(position.liquidity.toString()).dividedBy(position.poolLiquidity.toString()),
    )
  }, [position.poolLiquidity, position.liquidity, tvlUSD])

  const { cakePerYear, poolWeight } = useInfinityCakeAPR({ chainId, poolId, tvlUSD: activeTVLUsd, cakePrice })

  return useMemo(() => {
    if (!cakePerYear || !tvlUSD) {
      return {
        value: '0' as `${number}`,
      }
    }

    const share = new BigNumber(position.liquidity.toString()).dividedBy(position.poolLiquidity?.toString() ?? 1)

    return {
      value: new BigNumber(cakePerYear)
        .times(poolWeight ?? 0)
        .times(cakePrice ?? 1)
        .times(share)
        .div(tvlUSD)
        .toString() as `${number}`,
    }
  }, [cakePerYear, tvlUSD, position.liquidity, position.poolLiquidity, poolWeight, cakePrice])
}
