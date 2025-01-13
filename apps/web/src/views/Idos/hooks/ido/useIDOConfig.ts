import { type Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'

export type IDOConfig = {
  totalSale: bigint
  startTimestamp: number
  endTimestamp: number
  duration: number
  pricePerToken: Price<Currency, Currency> | undefined
  maxStakePerUser: CurrencyAmount<Currency> | undefined
  raiseAmount: CurrencyAmount<Currency> | undefined
  saleAmount: CurrencyAmount<Currency> | undefined
}

export const useIDOConfig = () => {
  const { data: poolInfo } = useIDOPoolInfo()
  const { stakeCurrency, offeringCurrency } = useIDOCurrencies()

  return useMemo(() => {
    return {
      totalSale: poolInfo?.offeringAmountPool ?? 0n,
      startTimestamp: poolInfo?.startTimestamp ?? 0,
      endTimestamp: poolInfo?.endTimestamp ?? 0,
      duration:
        poolInfo?.endTimestamp && poolInfo?.startTimestamp ? poolInfo?.endTimestamp - poolInfo?.startTimestamp : 0,
      pricePerToken:
        stakeCurrency && offeringCurrency
          ? new Price(
              offeringCurrency,
              stakeCurrency,
              poolInfo?.offeringAmountPool ?? 0n,
              poolInfo?.raisingAmountPool ?? 0n,
            )
          : undefined,
      maxStakePerUser: stakeCurrency
        ? CurrencyAmount.fromRawAmount(stakeCurrency, poolInfo?.capPerUserInLP ?? 0n)
        : undefined,
      raiseAmount: stakeCurrency
        ? CurrencyAmount.fromRawAmount(stakeCurrency, poolInfo?.raisingAmountPool ?? 0n)
        : undefined,
      saleAmount: offeringCurrency
        ? CurrencyAmount.fromRawAmount(offeringCurrency, poolInfo?.offeringAmountPool ?? 0n)
        : undefined,
    } satisfies IDOConfig
  }, [poolInfo, stakeCurrency, offeringCurrency])
}
