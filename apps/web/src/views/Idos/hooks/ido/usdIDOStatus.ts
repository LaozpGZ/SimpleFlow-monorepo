import { type Currency, CurrencyAmount, Percent } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'

export type IDOStatus = {
  progress: Percent
  currentStakedAmount: CurrencyAmount<Currency>
}

export const useIDOStatus = () => {
  const { stakeCurrency } = useIDOCurrencies()
  const { data: poolInfo } = useIDOPoolInfo()

  const progress = useMemo(() => {
    if (!poolInfo) return new Percent(0, 100)
    return new Percent(poolInfo.totalAmountPool, poolInfo.raisingAmountPool)
  }, [poolInfo])

  const currentStakedAmount = useMemo(() => {
    if (!stakeCurrency || !poolInfo) return undefined
    return CurrencyAmount.fromRawAmount(stakeCurrency, poolInfo.totalAmountPool)
  }, [poolInfo, stakeCurrency])

  return {
    progress,
    currentStakedAmount,
  }
}
