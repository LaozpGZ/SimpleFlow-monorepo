import { useMemo, useCallback } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { StableNGHook } from '../sdk/stableNGHook'

interface UseAddLiquidityStableNGPoolParams {
  poolAddress: string
}

export const useAddLiquidityStableNGPool = ({ poolAddress }: UseAddLiquidityStableNGPoolParams) => {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const stableNGHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new StableNGHook(poolAddress, publicClient, walletClient)
  }, [poolAddress, publicClient, walletClient])

  const addLiquidityStableNGPool = useCallback(
    async (amount0: bigint, amount1: bigint, minMintAmount: bigint) => {
      if (!stableNGHook) throw new Error('StableNGHook not initialized')
      return stableNGHook.addLiquidity(amount0, amount1, minMintAmount)
    },
    [stableNGHook],
  )

  return useMemo(
    () => ({
      addLiquidityStableNGPool,
      isReady: !!stableNGHook,
    }),
    [addLiquidityStableNGPool, stableNGHook],
  )
}
