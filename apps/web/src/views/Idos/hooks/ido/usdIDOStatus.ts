import { type Currency, CurrencyAmount, Percent } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'

export type IDOStatus = {
  progress: Percent
  currentStakedAmount: CurrencyAmount<Currency> | undefined
}

export const useIDOStatus = (): [IDOStatus, IDOStatus] => {
  const { stakeCurrency0, stakeCurrency1 } = useIDOCurrencies()
  const { data: poolInfo } = useIDOPoolInfo()

  const progresses = useMemo(() => {
    if (!poolInfo?.[0] || !poolInfo?.[1]) return [new Percent(0, 100), new Percent(0, 100)]
    return [
      new Percent(poolInfo[0].totalAmountPool, poolInfo[0].raisingAmountPool),
      new Percent(poolInfo[1].totalAmountPool, poolInfo[1].raisingAmountPool),
    ]
  }, [poolInfo])

  const currentStakedAmounts = useMemo(() => {
    if (!poolInfo?.[0] || !poolInfo?.[1]) return [undefined, undefined]
    return [
      stakeCurrency0 ? CurrencyAmount.fromRawAmount(stakeCurrency0, poolInfo[0].totalAmountPool) : undefined,
      stakeCurrency1 ? CurrencyAmount.fromRawAmount(stakeCurrency1, poolInfo[1].totalAmountPool) : undefined,
    ]
  }, [poolInfo, stakeCurrency0, stakeCurrency1])

  return [
    {
      progress: progresses[0],
      currentStakedAmount: currentStakedAmounts[0],
    },
    {
      progress: progresses[1],
      currentStakedAmount: currentStakedAmounts[1],
    },
  ]
}
