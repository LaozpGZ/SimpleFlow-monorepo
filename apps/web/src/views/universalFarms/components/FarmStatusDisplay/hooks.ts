import { ChainId } from '@pancakeswap/chains'
import { useMemo } from 'react'
import { rewardConfig } from './config'
import { RewardProvider } from './types'

// Pure function to check if a farm has rewards
export const hasReward = (chainId: ChainId, poolAddress: string, provider = RewardProvider.Ethena): boolean => {
  const chainConfig = rewardConfig[chainId]
  if (!chainConfig) return false

  return chainConfig.some(
    (config) => config.poolAddress.toLowerCase() === poolAddress.toLowerCase() && config.rewardProvider === provider,
  )
}

// React hook version - uses the pure function with memoization
export const useHasReward = (chainId: ChainId, poolAddress: string, provider = RewardProvider.Ethena): boolean => {
  return useMemo(() => hasReward(chainId, poolAddress, provider), [chainId, poolAddress, provider])
}
