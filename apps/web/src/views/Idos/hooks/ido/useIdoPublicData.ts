import { ChainId } from '@pancakeswap/chains'
import { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Percent, Price } from '@pancakeswap/swap-sdk-core'
import { CAKE } from '@pancakeswap/tokens'
import { UnsafeCurrency } from 'config/constants/types'
import { useCakePrice } from 'hooks/useCakePrice'
import { useLpTokenPrice } from 'state/farms/hooks'
import { getStatusByTimestamp } from '../helpers'
import { useIDOStatus } from './usdIDOStatus'
import { useIDOConfig } from './useIDOConfig'
import { useIDOCurrencies } from './useIDOCurrencies'
import { PoolInfo, useIDOPoolInfo } from './useIDOPoolInfo'
import { useIDOUserStatus } from './useIDOUserStatus'

export type IDOPublicData = {
  startTime: number
  endTime: number
  status: IfoStatus
  // currencyPriceInUSD: BigNumber
  poolInfo: PoolInfo
  plannedStartTime: number
  progress: Percent
  currentStakedAmount?: CurrencyAmount<Currency>
  timeProgress: number
  duration: number
  pricePerToken: Price<Currency, Currency> | undefined
  stakeCurrency: UnsafeCurrency
  offeringCurrency: UnsafeCurrency
  raiseAmount: CurrencyAmount<Currency> | undefined
  saleAmount: CurrencyAmount<Currency> | undefined
  userClaimableAmount?: CurrencyAmount<Currency>
  userStakedAmount?: CurrencyAmount<Currency>
  userStakedRefund?: CurrencyAmount<Currency>
  userStakedTax?: CurrencyAmount<Currency>
  userClaimed?: boolean
}

export const useIdoPublicData = (chainId: ChainId): [IDOPublicData, IDOPublicData] | [IDOPublicData] => {
  const { data: info } = useIDOPoolInfo()
  const { pool0Info, pool1Info, startTimestamp, endTimestamp } = info ?? {}
  const { stakeCurrency0, stakeCurrency1, offeringCurrency } = useIDOCurrencies()
  const [status0, status1] = useIDOStatus()
  const { pricePerTokens, raiseAmounts, saleAmounts } = useIDOConfig()
  const [userStatus0, userStatus1] = useIDOUserStatus()

  const startTime = Number(startTimestamp) || 0
  const endTime = Number(endTimestamp) || 0 // 1737407928
  const now = Math.floor(Date.now() / 1000)
  const status = getStatusByTimestamp(now, startTime, endTime)
  const lpToken0PriceInUsd = useLpTokenPrice(stakeCurrency0?.symbol ?? 'BNB')
  // const lpToken1PriceInUsd = useLpTokenPrice(stakeCurrency1?.symbol ?? 'BNB')
  const cakePrice = useCakePrice()
  const duration = startTime - endTime
  const currencyPriceInUSD = stakeCurrency0 === CAKE[chainId] ? cakePrice : lpToken0PriceInUsd
  const timeProgress = status === 'live' ? ((now - startTime) / duration) * 100 : 0

  return {
    // startTime,
    // endTime,
    // status,
    // // currencyPriceInUSD,
    // poolInfo: pool0Info,
    // plannedStartTime: poolInfo?.startTimestamp ? poolInfo?.startTimestamp - 432000 : 0, // five days before
    // progress,
    // currentStakedAmount: status0.currentStakedAmount,
    // timeProgress,
    // duration,
    // pricePerToken,
    // stakeCurrency,
    // offeringCurrency,
    // raiseAmount,
    // saleAmount,
    // userStakedAmount,
    // userStakedRefund,
    // userStakedTax,
    // userClaimableAmount,
    // userClaimed,
  }
}
