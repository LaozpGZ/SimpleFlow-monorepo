import { useMemo, useCallback } from 'react'
import { usePublicClient, useSendTransaction } from 'wagmi'
import { InfinityStableHook } from '../sdk/InfinityStableHook'

interface UseAddLiquidityInfinityStablePoolParams {
  poolAddress: string
}

export const useAddLiquidityInfinityStablePool = ({ poolAddress }: UseAddLiquidityInfinityStablePoolParams) => {
  const publicClient = usePublicClient()
  const { sendTransactionAsync } = useSendTransaction()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient)
  }, [poolAddress, publicClient])

  const addLiquidityInfinityStablePool = useCallback(
    async (amount0: bigint, amount1: bigint, minMintAmount: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')

      const calldata = infinityStableHook.getAddLiquidityCalldata(amount0, amount1, minMintAmount)

      const hash = await sendTransactionAsync({
        to: calldata.address,
        data: calldata.calldata,
        ...(calldata.value ? { value: BigInt(calldata.value) } : {}),
      })

      return hash
    },
    [infinityStableHook, sendTransactionAsync],
  )

  return useMemo(
    () => ({
      addLiquidityInfinityStablePool,
      isReady: !!infinityStableHook,
    }),
    [addLiquidityInfinityStablePool, infinityStableHook],
  )
}
