import { useState, useEffect, useMemo } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { StableNGHook } from '../sdk/stableNGHook'

interface UseCalcTokenAmountParams {
  poolAddress: string
  amounts: [bigint, bigint]
  deposit?: boolean
  enabled?: boolean
}

interface UseCalcTokenAmountReturn {
  tokenAmount: bigint | null
  isLoading: boolean
  error: Error | null
}

export const useCalcTokenAmount = ({
  poolAddress,
  amounts,
  deposit = true,
  enabled = true,
}: UseCalcTokenAmountParams): UseCalcTokenAmountReturn => {
  const [tokenAmount, setTokenAmount] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const stableNGHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new StableNGHook(poolAddress, publicClient, walletClient)
  }, [poolAddress, publicClient, walletClient])

  useEffect(() => {
    if (!enabled || !stableNGHook || (amounts[0] === 0n && amounts[1] === 0n)) {
      setTokenAmount(null)
      setError(null)
      setIsLoading(false)
      return
    }

    const calculateTokenAmount = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await stableNGHook.calcTokenAmount(amounts, deposit)
        setTokenAmount(result)
      } catch (err) {
        const error = err as Error
        setError(error)
        setTokenAmount(null)
      } finally {
        setIsLoading(false)
      }
    }

    calculateTokenAmount()
  }, [stableNGHook, amounts[0], amounts[1], deposit, enabled])

  return useMemo(
    () => ({
      tokenAmount,
      isLoading,
      error,
    }),
    [tokenAmount, isLoading, error],
  )
}
