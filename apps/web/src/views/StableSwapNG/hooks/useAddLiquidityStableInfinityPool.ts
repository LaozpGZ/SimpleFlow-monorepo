import { useMemo, useCallback } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { InfinityStableHook } from '../sdk/infinityStableHook'

interface UseAddLiquidityInfinityStablePoolParams {
  poolAddress: string
}

export const useAddLiquidityInfinityStablePool = ({ poolAddress }: UseAddLiquidityInfinityStablePoolParams) => {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient, walletClient)
  }, [poolAddress, publicClient, walletClient])

  const addLiquidityInfinityStablePool = useCallback(
    async (amount0: bigint, amount1: bigint, minMintAmount: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      return infinityStableHook.addLiquidity(amount0, amount1, minMintAmount)
    },
    [infinityStableHook],
  )

  return useMemo(
    () => ({
      addLiquidityInfinityStablePool,
      isReady: !!infinityStableHook,
    }),
    [addLiquidityInfinityStablePool, infinityStableHook],
  )
}
