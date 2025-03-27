import { ChainId } from '@pancakeswap/chains'
import { FARMING_OFFCHAIN_ABI, INFI_FARMING_DISTRIBUTOR_ADDRESSES } from '@pancakeswap/infinity-sdk'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { getTokenByAddress } from '@pancakeswap/tokens'
import { useQuery } from '@tanstack/react-query'
import BN from 'bignumber.js'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useCakePrice } from 'hooks/useCakePrice'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import { useMemo } from 'react'
import { rewardApiClient } from 'state/farmsV4/api/client'
import { operations } from 'state/farmsV4/api/schema'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { chainIdToExplorerInfoChainName, explorerApiClient } from 'state/info/api/client'
import { getViemClients } from 'utils/viem'
import { Address } from 'viem'

const FETCH_OPTIONS = {
  ...QUERY_SETTINGS_IMMUTABLE,
  retry: 9,
  retryDelay: 1000,
}

interface PoolFarmRewardsProps {
  chainId?: number
  address?: Address
  poolId?: Address
  timestamp?: number
}

const fetchUserFarmRewards = async ({ chainId, address, poolId, timestamp }: PoolFarmRewardsProps) => {
  if (!(chainId && address)) {
    return []
  }
  const path: operations['getPoolFarmRewards']['parameters']['path'] = {
    chainId,
    address,
  }
  if (poolId && timestamp) {
    path.poolId = poolId
    path.timestamp = timestamp.toString()
  }
  const resp = await rewardApiClient.GET(
    poolId ? '/farms/user-rewards/{chainId}/{address}/{poolId}/{timestamp}' : '/farms/user-rewards/{chainId}/{address}',
    {
      // @todo @ChefJerry remove this after the backend is ready
      baseUrl:
        chainId === ChainId.BSC_TESTNET ? 'https://test.v4.pancakeswap.com/' : 'https://infinity.pancakeswap.com/',
      params: {
        path,
      },
    },
  )

  return resp.data?.rewardsInfo ?? []
}

interface UserClaimedRewardsProps {
  chainId?: number
  address?: Address
}
const fetchUserClaimedRewards = async ({ chainId, address }: UserClaimedRewardsProps) => {
  if (!(chainId && address)) {
    return []
  }
  const chainName = chainIdToExplorerInfoChainName[chainId]
  if (!chainName) {
    return []
  }
  const resp = await explorerApiClient.GET('/cached/pools/infinity/{chainName}/claim/{address}', {
    params: {
      path: {
        chainName,
        address,
      },
    },
  })
  return resp.data ?? []
}

export const usePoolFarmRewardsFormAPI = ({ chainId, address, poolId, timestamp }: PoolFarmRewardsProps) => {
  const { data } = useQuery({
    queryKey: ['poolFarmRewards', chainId, address, poolId, timestamp],
    queryFn: () => fetchUserFarmRewards({ chainId, address, poolId, timestamp }),
    enabled: !!(chainId && address && timestamp),
    ...FETCH_OPTIONS,
  })

  return data
}

const useClaimedRewardsFromAPI = ({ chainId, address }: UserClaimedRewardsProps) => {
  const [latestTxReceipt] = useLatestTxReceipt()
  const { data } = useQuery({
    queryKey: ['ClaimedRewardsFromAPI', chainId, address, latestTxReceipt?.blockHash],
    queryFn: () => fetchUserClaimedRewards({ chainId, address }),
    enabled: !!(chainId && address),
    ...FETCH_OPTIONS,
  })

  return data
}

type FarmRewardsFromAPIByChainsProps = {
  chainIds?: number[]
  address?: Address
}
export const useFarmRewardsFromAPIByChains = ({ chainIds = [], address }: FarmRewardsFromAPIByChainsProps) => {
  const [latestTxReceipt] = useLatestTxReceipt()
  const { data } = useQuery({
    queryKey: ['poolFarmRewards', ...chainIds, address, latestTxReceipt?.blockHash],
    queryFn: async () => {
      const result = await Promise.allSettled(chainIds.map((chainId) => fetchUserFarmRewards({ chainId, address })))
      return chainIds.reduce<Record<number, Awaited<ReturnType<typeof fetchUserFarmRewards>>>>((acc, id, idx) => {
        const rewards = result[idx]
        if (rewards.status === 'fulfilled') {
          // eslint-disable-next-line no-param-reassign
          acc[id] = rewards.value
        }
        return acc
      }, {})
    },
    enabled: !!(chainIds.length && address),
    ...FETCH_OPTIONS,
  })

  return data
}

const useUserAllClaimedRewardsFromChain = ({
  chainId,
  rewardTokens,
  user,
}: {
  chainId?: number
  rewardTokens?: Address[]
  user?: Address
}) => {
  const [latestTxReceipt] = useLatestTxReceipt()
  return useQuery<Record<Address, bigint>>({
    queryKey: ['userAllClaimedRewards', chainId, user, latestTxReceipt?.blockHash],
    queryFn: async () => {
      if (!(chainId && user && rewardTokens?.length)) {
        return 0n
      }
      const calls = rewardTokens.map(
        (token) =>
          ({
            abi: FARMING_OFFCHAIN_ABI,
            address: INFI_FARMING_DISTRIBUTOR_ADDRESSES[chainId] as Address,
            functionName: 'claimedAmounts',
            args: [token, user] as const,
          } as const),
      )
      const resp = await getViemClients({ chainId }).multicall({
        contracts: calls,
        allowFailure: true,
      })
      return rewardTokens.reduce((acc, token, idx) => {
        if (resp[idx]?.result) {
          Object.assign(acc, {
            [token]: resp[idx].result,
          })
        }
        return acc
      }, {})
    },
    enabled: !!(chainId && user && rewardTokens),
    ...FETCH_OPTIONS,
  })
}

const getRewardsMap = (data?: Awaited<ReturnType<typeof fetchUserFarmRewards>>, tokenId?: bigint) => {
  return data?.reduce<Record<string, string>>((acc, r) => {
    r.tokenIds.forEach((tId, idx) => {
      if (tokenId && tId !== tokenId?.toString()) {
        return
      }
      const key = `${r.poolId}-${r.campaignId}-${tId}`
      // eslint-disable-next-line no-param-reassign
      acc[key] = r.rewardAmounts[idx]
    })
    return acc
  }, {})
}

const useUnclaimedRewards = ({
  chainId,
  address,
  poolId,
  tokenId,
  timestamp,
}: PoolFarmRewardsProps & { tokenId?: bigint }) => {
  const rewards = usePoolFarmRewardsFormAPI({ chainId, address, poolId, timestamp })
  const claimedHistory = useClaimedRewardsFromAPI({ chainId, address })
  const rewardsBeforeLastClaimed = usePoolFarmRewardsFormAPI({
    chainId,
    address,
    poolId,
    timestamp: claimedHistory?.[0]?.timestamp
      ? +new Date(claimedHistory?.[0]?.timestamp.toString()) / 1000 - 1
      : undefined,
  })

  const rewardsOfTokenId = useMemo(
    () => (tokenId ? rewards?.filter((item) => item.tokenIds.includes(tokenId.toString())) : rewards),
    [rewards, tokenId],
  )
  const rewardsMap = useMemo(() => getRewardsMap(rewardsOfTokenId, tokenId), [rewardsOfTokenId, tokenId])
  const rewardsBeforeLastClaimedMap = useMemo(
    () =>
      getRewardsMap(
        tokenId
          ? rewardsBeforeLastClaimed?.filter((item) => item.tokenIds.includes(tokenId.toString()))
          : rewardsBeforeLastClaimed,
        tokenId,
      ),
    [rewardsBeforeLastClaimed, tokenId],
  )

  const currency =
    chainId && rewardsOfTokenId?.[0]?.rewardTokenAddress
      ? getTokenByAddress(chainId, rewardsOfTokenId?.[0].rewardTokenAddress)
      : undefined

  return {
    rewardsMap,
    rewardsBeforeLastClaimedMap,
    currency,
  }
}

const useUnclaimedFarmRewardsAmountByPoolId = ({ chainId, address, poolId, timestamp }: PoolFarmRewardsProps) => {
  const { currency, rewardsBeforeLastClaimedMap, rewardsMap } = useUnclaimedRewards({
    chainId,
    address,
    poolId,
    timestamp,
  })

  return useMemo(() => {
    if (!currency || !rewardsMap) {
      return undefined
    }

    return CurrencyAmount.fromRawAmount(
      currency,
      Object.keys(rewardsMap)
        .reduce(
          (acc, key) => new BN(rewardsMap[key]).minus(rewardsBeforeLastClaimedMap?.[key] ?? 0).plus(acc),
          new BN(0),
        )
        .toNumber(),
    )
  }, [currency, rewardsMap, rewardsBeforeLastClaimedMap])
}

const useUnclaimedFarmRewardsAmountByTokenId = ({
  chainId,
  address,
  poolId,
  tokenId,
  timestamp,
}: PoolFarmRewardsProps & { tokenId?: bigint }) => {
  const { currency, rewardsBeforeLastClaimedMap, rewardsMap } = useUnclaimedRewards({
    chainId,
    address,
    poolId,
    tokenId,
    timestamp,
  })
  return useMemo(() => {
    if (!currency || !rewardsMap) {
      return undefined
    }

    return CurrencyAmount.fromRawAmount<Currency>(
      currency,
      Object.keys(rewardsMap)
        .reduce((acc, key) => {
          return new BN(rewardsMap[key] ?? 0).minus(rewardsBeforeLastClaimedMap?.[key] ?? 0).plus(acc)
        }, new BN(0))
        .toNumber(),
    )
  }, [currency, rewardsBeforeLastClaimedMap, rewardsMap])
}

export const useUnclaimedFarmRewardsUSDByPoolId = ({ chainId, address, poolId, timestamp }: PoolFarmRewardsProps) => {
  const rewardsAmount = useUnclaimedFarmRewardsAmountByPoolId({
    chainId,
    address,
    poolId,
    timestamp,
  })
  return useFarmRewardsUSD(rewardsAmount)
}

export const useUnclaimedFarmRewardsUSDByTokenId = ({
  chainId,
  address,
  poolId,
  tokenId,
  timestamp,
}: PoolFarmRewardsProps & { tokenId?: bigint }) => {
  const rewardsAmount = useUnclaimedFarmRewardsAmountByTokenId({
    chainId,
    address,
    poolId,
    tokenId,
    timestamp,
  })
  return useFarmRewardsUSD(rewardsAmount)
}

const useFarmRewardsUSD = (rewardsAmount?: CurrencyAmount<Currency>) => {
  const cakePrice = useCakePrice()
  return useMemo(() => {
    return {
      rewardsAmount,
      rewardsUSD: new BN(rewardsAmount?.toExact() ?? 0).times(cakePrice.toString()).toNumber(),
    }
  }, [cakePrice, rewardsAmount])
}

interface UserFarmRewardsProps {
  chainId?: number
  user?: Address
  timestamp?: number
}
export const useUserAllFarmRewardsByChainIdFromAPI = ({ chainId, user, timestamp }: UserFarmRewardsProps) => {
  const { data: allRewards } = useQuery({
    queryKey: ['userAllFarmRewards', chainId, user, timestamp],
    queryFn: async () => {
      if (!(chainId && user)) {
        return []
      }
      const resp = await rewardApiClient.GET('/farms/users/{chainId}/{address}/{timestamp}', {
        // @todo @ChefJerry remove this after the backend is ready
        baseUrl:
          chainId === ChainId.BSC_TESTNET ? 'https://test.v4.pancakeswap.com/' : 'https://infinity.pancakeswap.com/',
        params: {
          path: {
            chainId,
            address: user,
            timestamp: timestamp?.toString() ?? Math.floor(Date.now() / 1000).toString(),
          },
        },
      })

      return resp.data?.rewards ?? []
    },
    enabled: !!(chainId && user),
    ...FETCH_OPTIONS,
  })

  const rewardTokens = useMemo(() => allRewards?.map((i) => i.rewardTokenAddress), [allRewards])

  const { data: claimedRewards } = useUserAllClaimedRewardsFromChain({
    chainId,
    user,
    rewardTokens,
  })

  const totalUnclaimedRewards = useMemo(
    () =>
      chainId
        ? map(groupBy(allRewards, 'rewardTokenAddress'), (items) => {
            const rewardTokenAddress = items[0]?.rewardTokenAddress
            const currency = getTokenByAddress(chainId, rewardTokenAddress)
            if (!currency) {
              return {
                rewardTokenAddress,
                totalReward: '0',
              }
            }
            const claimedAmount = CurrencyAmount.fromRawAmount(currency, claimedRewards?.[rewardTokenAddress] ?? 0n)
            const totalReward = items
              .reduce(
                (acc, item) =>
                  CurrencyAmount.fromRawAmount(currency, item.totalRewardAmount).add(acc).subtract(claimedAmount),
                CurrencyAmount.fromRawAmount(currency, 0),
              )
              .toExact()
            return {
              rewardTokenAddress: items[0].rewardTokenAddress,
              totalReward,
            }
          })
        : [],
    [chainId, allRewards, claimedRewards],
  )

  return useMemo(
    () => ({
      allRewards,
      totalUnclaimedRewards,
    }),
    [allRewards, totalUnclaimedRewards],
  )
}
