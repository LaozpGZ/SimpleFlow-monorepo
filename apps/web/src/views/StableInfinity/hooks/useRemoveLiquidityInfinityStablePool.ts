import { useMemo, useCallback } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { InfinityStableHook } from '../sdk/infinityStableHook'

interface UseRemoveLiquidityInfinityStablePoolParams {
  poolAddress: string
}

export const useRemoveLiquidityInfinityStablePool = ({ poolAddress }: UseRemoveLiquidityInfinityStablePoolParams) => {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient, walletClient)
  }, [poolAddress, publicClient, walletClient])

  const estimateRemoveLiquidityGas = useCallback(
    async (burnAmount: bigint, minAmount0: bigint, minAmount1: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      return infinityStableHook.estimateRemoveLiquidityGas(burnAmount, minAmount0, minAmount1)
    },
    [infinityStableHook],
  )

  const removeLiquidityInfinityStablePool = useCallback(
    async (burnAmount: bigint, minAmount0: bigint, minAmount1: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      return infinityStableHook.removeLiquidity(burnAmount, minAmount0, minAmount1)
    },
    [infinityStableHook],
  )

  return useMemo(
    () => ({
      estimateRemoveLiquidityGas,
      removeLiquidityInfinityStablePool,
      isReady: !!infinityStableHook,
    }),
    [estimateRemoveLiquidityGas, removeLiquidityInfinityStablePool, infinityStableHook],
  )
}
