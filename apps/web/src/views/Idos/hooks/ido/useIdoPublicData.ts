import { ChainId } from '@pancakeswap/chains'
import { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Percent, Price } from '@pancakeswap/swap-sdk-core'
import { CAKE } from '@pancakeswap/tokens'
import BigNumber from 'bignumber.js'
import { UnsafeCurrency } from 'config/constants/types'
import { useCakePrice } from 'hooks/useCakePrice'
import { useLpTokenPrice } from 'state/farms/hooks'
import { getStatusByTimestamp } from '../helpers'
import { useIDOStatus } from './usdIDOStatus'
import { useIDOConfig } from './useIDOConfig'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'
import { useIDOUserStatus } from './useIDOUserStatus'

export type IDOPublicData = {
  isInitialized: boolean
  startTime: number
  endTime: number
  status: IfoStatus
  currencyPriceInUSD: BigNumber
  poolInfo: any
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

export const useIdoPublicData = (chainId: ChainId): IDOPublicData => {
  const { data: poolInfo } = useIDOPoolInfo()
  const { stakeCurrency, offeringCurrency } = useIDOCurrencies()
  const { progress, currentStakedAmount } = useIDOStatus()
  const { pricePerToken, raiseAmount, saleAmount } = useIDOConfig()
  const {
    stakedAmount: userStakedAmount,
    stakeRefund: userStakedRefund,
    stakeTax: userStakedTax,
    claimableAmount: userClaimableAmount,
    claimed: userClaimed,
  } = useIDOUserStatus()

  const startTime = Number(poolInfo?.startTimestamp) || 0
  const endTime = Number(poolInfo?.endTimestamp) || 0 // 1737407928
  const now = Math.floor(Date.now() / 1000)
  const status = getStatusByTimestamp(now, startTime, endTime)
  const lpTokenPriceInUsd = useLpTokenPrice(stakeCurrency?.symbol ?? 'BNB')
  const cakePrice = useCakePrice()
  const duration = startTime - endTime
  const currencyPriceInUSD = stakeCurrency === CAKE[chainId] ? cakePrice : lpTokenPriceInUsd
  const timeProgress = status === 'live' ? ((now - startTime) / duration) * 100 : 0

  return {
    isInitialized: true,
    startTime,
    endTime,
    status,
    currencyPriceInUSD,
    poolInfo,
    plannedStartTime: poolInfo?.startTimestamp ? poolInfo?.startTimestamp - 432000 : 0, // five days before
    progress,
    currentStakedAmount,
    timeProgress,
    duration,
    pricePerToken,
    stakeCurrency,
    offeringCurrency,
    raiseAmount,
    saleAmount,
    userStakedAmount,
    userStakedRefund,
    userStakedTax,
    userClaimableAmount,
    userClaimed,
  }
}
