import type { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { getStatusByTimestamp } from '../helpers'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'

export type IDOConfig = {
  totalSales: [bigint, bigint]
  startTimestamp: number
  endTimestamp: number
  duration: number
  pricePerTokens: [Price<Currency, Currency> | undefined, Price<Currency, Currency> | undefined]
  maxStakePerUsers: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  raiseAmounts: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  saleAmounts: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  totalSalesAmount: CurrencyAmount<Currency> | undefined
  status: IfoStatus
}

export const useIDOConfig = () => {
  const { data: poolInfo } = useIDOPoolInfo()
  const { stakeCurrency0, stakeCurrency1, offeringCurrency } = useIDOCurrencies()

  return useMemo(() => {
    return {
      totalSales: [poolInfo?.pool0Info.offeringAmountPool ?? 0n, poolInfo?.pool1Info.offeringAmountPool ?? 0n],
      startTimestamp: poolInfo?.startTimestamp ?? 0,
      endTimestamp: poolInfo?.endTimestamp ?? 0,
      duration:
        poolInfo?.endTimestamp && poolInfo?.startTimestamp ? poolInfo?.endTimestamp - poolInfo?.startTimestamp : 0,
      pricePerTokens: [
        stakeCurrency0 && offeringCurrency
          ? new Price(
              offeringCurrency,
              stakeCurrency0,
              poolInfo?.pool0Info.offeringAmountPool ?? 0n,
              poolInfo?.pool0Info.raisingAmountPool ?? 0n,
            )
          : undefined,
        stakeCurrency1 && offeringCurrency
          ? new Price(
              offeringCurrency,
              stakeCurrency1,
              poolInfo?.pool1Info.offeringAmountPool ?? 0n,
              poolInfo?.pool1Info.raisingAmountPool ?? 0n,
            )
          : undefined,
      ],
      maxStakePerUsers: [
        stakeCurrency0
          ? CurrencyAmount.fromRawAmount(stakeCurrency0, poolInfo?.pool0Info.capPerUserInLP ?? 0n)
          : undefined,
        stakeCurrency1
          ? CurrencyAmount.fromRawAmount(stakeCurrency1, poolInfo?.pool1Info.capPerUserInLP ?? 0n)
          : undefined,
      ],
      raiseAmounts: offeringCurrency
        ? [
            CurrencyAmount.fromRawAmount(offeringCurrency, poolInfo?.pool0Info.raisingAmountPool ?? 0n),
            CurrencyAmount.fromRawAmount(offeringCurrency, poolInfo?.pool1Info.raisingAmountPool ?? 0n),
          ]
        : [undefined, undefined],
      saleAmounts: offeringCurrency
        ? [
            CurrencyAmount.fromRawAmount(offeringCurrency, poolInfo?.pool0Info.offeringAmountPool ?? 0n),
            CurrencyAmount.fromRawAmount(offeringCurrency, poolInfo?.pool1Info.offeringAmountPool ?? 0n),
          ]
        : [undefined, undefined],
      totalSalesAmount: offeringCurrency
        ? CurrencyAmount.fromRawAmount(offeringCurrency, poolInfo?.pool0Info.offeringAmountPool ?? 0n).add(
            CurrencyAmount.fromRawAmount(offeringCurrency, poolInfo?.pool1Info.offeringAmountPool ?? 0n),
          )
        : undefined,
      status: getStatusByTimestamp(dayjs().unix(), poolInfo?.startTimestamp, poolInfo?.endTimestamp),
    } satisfies IDOConfig
  }, [poolInfo, stakeCurrency0, stakeCurrency1, offeringCurrency])
}
