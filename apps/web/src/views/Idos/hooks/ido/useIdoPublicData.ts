import { ChainId } from '@pancakeswap/chains'
import { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Percent } from '@pancakeswap/swap-sdk-core'
import { CAKE } from '@pancakeswap/tokens'
import BigNumber from 'bignumber.js'
import { useCakePrice } from 'hooks/useCakePrice'
import { useLpTokenPrice } from 'state/farms/hooks'
import { getStatusByTimestamp } from '../helpers'
import { useIDOStatus } from './usdIDOStatus'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'

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
}

export const useIdoPublicData = (chainId: ChainId): IDOPublicData => {
  const { data: poolInfo } = useIDOPoolInfo()
  const { stakeCurrency } = useIDOCurrencies()
  const { progress, currentStakedAmount } = useIDOStatus()

  const startTime = Number(poolInfo?.startTimestamp) || 0
  const endTime = Number(poolInfo?.endTimestamp) || 0
  const now = Math.floor(Date.now() / 1000)
  const status = getStatusByTimestamp(now, startTime, endTime)
  const lpTokenPriceInUsd = useLpTokenPrice(stakeCurrency?.symbol ?? 'BNB')
  const cakePrice = useCakePrice()
  const duration =
    poolInfo?.endTimestamp && poolInfo?.startTimestamp ? poolInfo?.endTimestamp - poolInfo?.startTimestamp : 0
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
  }
}
