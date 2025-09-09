import { ChainId, isTestnetChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { InfinityClPool, InfinityRouter } from '@pancakeswap/smart-router'
import { Tick } from '@pancakeswap/v3-sdk'
import { getPoolTicks } from 'hooks/useAllTicksQuery'
import { publicClient } from 'utils/viem'

export const fetchInfinityCLPoolTicksWithFallback = async (chainId: ChainId, pool: InfinityClPool) => {
  // Explorer API ticks not supported on BSC testnet
  // TODO: Consider fetching ticks only on chain
  if (!isTestnetChainId(chainId)) {
    // Fetch ticks from Explorer API
    const ticks = await getPoolTicks({
      chainId,
      poolAddress: pool.id,
      protocol: Protocol.InfinityCLAMM,
      activeTick: pool.tick,
    })

    const newTicks = ticks?.map(
      ({ tick, liquidityNet, liquidityGross }) =>
        new Tick({
          index: Number(tick),
          liquidityNet,
          liquidityGross,
        }),
    )

    const newPool: InfinityClPool = {
      ticks: [...(pool.ticks || []), ...newTicks],
      ...pool,
    }

    return newPool
  }

  // Fallback to getting ticks on-chain
  const [poolWithTicks] = await InfinityRouter.fillClPoolsWithTicks({
    pools: [pool],
    clientProvider: publicClient,
  })

  return poolWithTicks
}
