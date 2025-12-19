import { useState, useEffect, useMemo } from 'react'
import { usePublicClient } from 'wagmi'
import { InfinityStableHook } from '../sdk/InfinityStableHook'

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

interface UseUserLPBalanceParams {
  poolAddress: string
  account?: `0x${string}`
}

export const useTotalSupply = ({ poolAddress }: { poolAddress: string }): bigint | null => {
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null)

  const publicClient = usePublicClient()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient)
  }, [poolAddress, publicClient])

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

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient)
  }, [poolAddress, publicClient])

  useEffect(() => {
    if (!enabled || !infinityStableHook || amounts[0] === 0n || amounts[1] === 0n) {
      setTokenAmount(null)
      setError(null)
      setIsLoading(false)
      return
    }

    const calculateTokenAmount = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('infinityStableHook calcTokenAmount', amounts, deposit)
        const result = await infinityStableHook.calcTokenAmount(amounts, deposit)

        console.log('infinityStableHook calcTokenAmount result', result)
        setTokenAmount(result)
      } catch (err) {
        console.error('infinityStableHook calcTokenAmount error', err)
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

export const useUserLPBalance = ({ poolAddress, account }: UseUserLPBalanceParams): bigint | null => {
  const [lpBalance, setLpBalance] = useState<bigint | null>(null)

  const publicClient = usePublicClient()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient)
  }, [poolAddress, publicClient])

  useEffect(() => {
    if (!infinityStableHook || !account) {
      setLpBalance(null)
      return
    }

    const fetchLPBalance = async () => {
      try {
        const result = await infinityStableHook.balanceOf(account)
        setLpBalance(result)
      } catch (err) {
        console.error('Error fetching LP balance:', err)
        setLpBalance(null)
      }
    }

    fetchLPBalance()
  }, [infinityStableHook, account])

  return lpBalance
}

export const usePoolBalances = ({ poolAddress }: { poolAddress: string }): [bigint | null, bigint | null] => {
  const [balance0, setBalance0] = useState<bigint | null>(null)
  const [balance1, setBalance1] = useState<bigint | null>(null)

  const publicClient = usePublicClient()

  const infinityStableHook = useMemo(() => {
    if (!publicClient || !poolAddress) return null
    return new InfinityStableHook(poolAddress, publicClient)
  }, [poolAddress, publicClient])

  useEffect(() => {
    if (!infinityStableHook) {
      setBalance0(null)
      setBalance1(null)
      return
    }

    const fetchBalances = async () => {
      console.log('infinityStableHook fetchBalances', poolAddress)
      try {
        const [bal0, bal1] = await Promise.all([infinityStableHook.balances(0), infinityStableHook.balances(1)])
        console.log('infinityStableHook fetchBalances', bal0, bal1)
        setBalance0(bal0)
        setBalance1(bal1)
      } catch (err) {
        console.error('Error fetching pool balances:', err)
        setBalance0(null)
        setBalance1(null)
      }
    }

    fetchBalances()
  }, [infinityStableHook, poolAddress])

  return [balance0, balance1]
}
