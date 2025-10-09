import { useState, useEffect, useMemo } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { InfinityStableHook } from '../sdk/infinityStableHook'

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

export const useTotalSupply = ({ poolAddress }: { poolAddress: string }): bigint | null => {
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null)

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient, walletClient)
  }, [poolAddress, publicClient, walletClient])

  useEffect(() => {
    if (!infinityStableHook) {
      setTotalSupply(null)
      return
    }

    const fetchTotalSupply = async () => {
      try {
        const result = await infinityStableHook.totalSupply()
        setTotalSupply(result)
      } catch (err) {
        console.error('Error fetching total supply:', err)
        setTotalSupply(null)
      }
    }

    fetchTotalSupply()
  }, [infinityStableHook])

  return totalSupply
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

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient, walletClient)
  }, [poolAddress, publicClient, walletClient])

  useEffect(() => {
    if (!enabled || !infinityStableHook || (amounts[0] === 0n && amounts[1] === 0n)) {
      setTokenAmount(null)
      setError(null)
      setIsLoading(false)
      return
    }

    const calculateTokenAmount = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await infinityStableHook.calcTokenAmount(amounts, deposit)
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
  }, [infinityStableHook, amounts, deposit, enabled])

  return useMemo(
    () => ({
      tokenAmount,
      isLoading,
      error,
    }),
    [tokenAmount, isLoading, error],
  )
}
