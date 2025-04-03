import { Protocol, UniversalFarmConfig } from '@pancakeswap/farms'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import uniq from 'lodash/uniq'
import { useMemo } from 'react'
import { InfinityBinPositionDetail, InfinityCLPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import type { InfinityPoolInfo } from 'state/farmsV4/state/type'
import { isInfinityProtocol } from 'utils/protocols'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useUserShowTestnet } from 'state/user/hooks/useUserShowTestnet'
import { isTestnetChainId } from '@pancakeswap/chains'

import { fetchCampaignsByPoolIds } from './useCampaigns'
import { useFarmRewardsFromAPIByChains, usePoolFarmRewardsFormAPI } from './useFarmReward'

export const useMultiChainPoolsFarmingStatus = (pools: UniversalFarmConfig[]) => {
  const [isShowTestnet] = useUserShowTestnet()

  const infinityPools = useMemo(
    () =>
      pools.filter(
        (p) => isInfinityProtocol(p.protocol) && (isShowTestnet || !isTestnetChainId(p.chainId)),
      ) as InfinityPoolInfo[],
    [pools, isShowTestnet],
  )

  const chainIdToPoolIdsMap = useMemo(() => {
    return mapValues(groupBy(infinityPools, 'chainId'), (items) => items.map((p) => p.poolId))
  }, [infinityPools])

  const { data: campaignsByChains } = useQuery({
    queryKey: ['CampaignsByPoolId', ...infinityPools],
    queryFn: async () =>
      Promise.allSettled(
        Object.entries(chainIdToPoolIdsMap).map(([chainId, poolIds]) =>
          fetchCampaignsByPoolIds({ chainId: Number(chainId), poolIds, fetchAll: true, includeInactive: false }),
        ),
      ),
    enabled: !!infinityPools.length,
    retry: false,
  })

  return useMemo(
    () =>
      campaignsByChains
        ? Object.keys(chainIdToPoolIdsMap).reduce((acc, chain, idx) => {
            const resultOfChain = campaignsByChains[idx]
            if (resultOfChain.status === 'fulfilled') {
              const activeCampaigns = resultOfChain.value.filter(
                (camp) => Number(camp.startTime) + Number(camp.duration) >= Number(dayjs().unix()),
              )
              // eslint-disable-next-line no-param-reassign
              acc[chain] = groupBy(activeCampaigns, 'poolId')
            }
            return acc
          }, {})
        : {},
    [campaignsByChains, chainIdToPoolIdsMap],
  )
}

export const usePositionIsFarming = ({
  chainId,
  poolId,
  tokenId,
}: {
  chainId?: number
  poolId?: Address
  tokenId?: bigint
}) => {
  const { address } = useAccount()
  const rewards = usePoolFarmRewardsFormAPI({ address, chainId, poolId, timestamp: dayjs().startOf('hour').unix() })
  return useMemo(() => {
    if (!tokenId) {
      return !!rewards?.find((r) => r.poolId === poolId)
    }
    return !!rewards?.find((r) => r.tokenIds.includes(tokenId.toString()))
  }, [rewards, tokenId, poolId])
}

export const usePositionsWithFarming = <T extends InfinityBinPositionDetail | InfinityCLPositionDetail>({
  positions,
}: {
  positions?: T[]
}) => {
  const { address } = useAccount()
  const chainIds = useMemo(() => uniq(positions?.map((p) => p.chainId)), [positions])
  const rewardMap = useFarmRewardsFromAPIByChains({
    chainIds,
    address,
  })
  return useMemo(
    () =>
      rewardMap
        ? positions?.map((pos) => {
            if (!(isInfinityProtocol(pos.protocol) && rewardMap[pos.chainId])) {
              return pos
            }
            let isStaked = false
            if (pos.protocol === Protocol.InfinityCLAMM) {
              isStaked = !!rewardMap[pos.chainId].find((r) => r.tokenIds.includes(pos.tokenId.toString()))
            }
            if (pos.protocol === Protocol.InfinityBIN) {
              isStaked = !!rewardMap[pos.chainId].find((r) => r.poolId === pos.poolId)
            }
            return {
              ...pos,
              isStaked,
            }
          })
        : positions,
    [positions, rewardMap],
  )
}
