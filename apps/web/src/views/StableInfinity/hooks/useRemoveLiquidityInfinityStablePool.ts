import { useMemo, useCallback } from 'react'
import { usePublicClient, useSendTransaction, useAccount } from 'wagmi'
import { InfinityStableHook } from '../sdk/InfinityStableHook'

interface UseRemoveLiquidityInfinityStablePoolParams {
  poolAddress: string
}

export const useRemoveLiquidityInfinityStablePool = ({ poolAddress }: UseRemoveLiquidityInfinityStablePoolParams) => {
  const publicClient = usePublicClient()
  const { sendTransactionAsync } = useSendTransaction()
  const { address: account } = useAccount()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient)
  }, [poolAddress, publicClient])

  const estimateRemoveLiquidityGas = useCallback(
    async (burnAmount: bigint, minAmount0: bigint, minAmount1: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      if (!account) throw new Error('Account not connected')
      return infinityStableHook.estimateRemoveLiquidityGas(burnAmount, minAmount0, minAmount1, account)
    },
    [infinityStableHook, account],
  )

  const removeLiquidityInfinityStablePool = useCallback(
    async (burnAmount: bigint, minAmount0: bigint, minAmount1: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      if (!account) throw new Error('Account not connected')

      const calldata = infinityStableHook.getRemoveLiquidityCalldata(burnAmount, minAmount0, minAmount1, account)

      const hash = await sendTransactionAsync({
        to: calldata.address,
        data: calldata.calldata,
        ...(calldata.value ? { value: BigInt(calldata.value) } : {}),
      })

      return hash
    },
    [infinityStableHook, account, sendTransactionAsync],
  )

  const calcWithdrawOneCoin = useCallback(
    async (burnAmount: bigint, index: number) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      return infinityStableHook.calcWithdrawOneCoin(burnAmount, index)
    },
    [infinityStableHook],
  )

  const removeLiquidityOneCoin = useCallback(
    async (burnAmount: bigint, zeroOrOne: boolean, minReceived: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')

      const calldata = infinityStableHook.getRemoveLiquidityOneCoinCalldata(burnAmount, zeroOrOne, minReceived)

      const hash = await sendTransactionAsync({
        to: calldata.address,
        data: calldata.calldata,
        ...(calldata.value ? { value: BigInt(calldata.value) } : {}),
      })

      return hash
    },
    [infinityStableHook, sendTransactionAsync],
  )

  const removeLiquidityImbalance = useCallback(
    async (amount0: bigint, amount1: bigint, maxBurnAmount: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')

      const calldata = infinityStableHook.getRemoveLiquidityImbalanceCalldata(amount0, amount1, maxBurnAmount)

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
      estimateRemoveLiquidityGas,
      removeLiquidityInfinityStablePool,
      calcWithdrawOneCoin,
      removeLiquidityOneCoin,
      removeLiquidityImbalance,
      isReady: !!infinityStableHook,
    }),
    [
      estimateRemoveLiquidityGas,
      removeLiquidityInfinityStablePool,
      calcWithdrawOneCoin,
      removeLiquidityOneCoin,
      removeLiquidityImbalance,
      infinityStableHook,
    ],
  )
}
