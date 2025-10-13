import { useMemo, useCallback } from 'react'
import { usePublicClient, useSendTransaction, useAccount } from 'wagmi'
import { calculateGasMargin } from 'utils'
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

  const sendTransactionWithGasEstimate = useCallback(
    async (to: `0x${string}`, data: `0x${string}`, value?: bigint) => {
      if (!publicClient) throw new Error('Public client not available')
      if (!account) throw new Error('Account not connected')

      return publicClient
        .estimateGas({
          account,
          to,
          data,
          value,
        })
        .then((gasLimit) => {
          console.log('success estimate gas: ', { to, data, value })
          return sendTransactionAsync({
            to,
            data,
            value,
            gas: calculateGasMargin(gasLimit),
          })
        })
    },
    [publicClient, account, sendTransactionAsync],
  )

  const removeLiquidityInfinityStablePool = useCallback(
    async (burnAmount: bigint, minAmount0: bigint, minAmount1: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      if (!account) throw new Error('Account not connected')

      const calldata = infinityStableHook.getRemoveLiquidityCalldata(burnAmount, minAmount0, minAmount1, account)

      const hash = await sendTransactionWithGasEstimate(
        calldata.address,
        calldata.calldata,
        calldata.value ? BigInt(calldata.value) : undefined,
      )

      return hash
    },
    [infinityStableHook, account, sendTransactionWithGasEstimate],
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
      if (!account) throw new Error('Account not connected')

      const calldata = infinityStableHook.getRemoveLiquidityOneCoinCalldata(burnAmount, zeroOrOne, minReceived)

      const hash = await sendTransactionWithGasEstimate(
        calldata.address,
        calldata.calldata,
        calldata.value ? BigInt(calldata.value) : undefined,
      )

      return hash
    },
    [infinityStableHook, account, sendTransactionWithGasEstimate],
  )

  const removeLiquidityImbalance = useCallback(
    async (amount0: bigint, amount1: bigint, maxBurnAmount: bigint) => {
      if (!infinityStableHook) throw new Error('InfinityStableHook not initialized')
      if (!account) throw new Error('Account not connected')

      const calldata = infinityStableHook.getRemoveLiquidityImbalanceCalldata(amount0, amount1, maxBurnAmount)

      const hash = await sendTransactionWithGasEstimate(
        calldata.address,
        calldata.calldata,
        calldata.value ? BigInt(calldata.value) : undefined,
      )

      return hash
    },
    [infinityStableHook, account, sendTransactionWithGasEstimate],
  )

  return useMemo(
    () => ({
      removeLiquidityInfinityStablePool,
      calcWithdrawOneCoin,
      removeLiquidityOneCoin,
      removeLiquidityImbalance,
      isReady: !!infinityStableHook,
    }),
    [
      removeLiquidityInfinityStablePool,
      calcWithdrawOneCoin,
      removeLiquidityOneCoin,
      removeLiquidityImbalance,
      infinityStableHook,
    ],
  )
}
