import { ClassicOrder, OrderType, XOrder } from '@pancakeswap/price-api-sdk'
import { InfinityRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { useCallback, useMemo, useState } from 'react'

import { usePCSX } from 'hooks/usePCSX'
import { useThrottleFn } from 'hooks/useThrottleFn'
import { InterfaceOrder } from 'views/Swap/utils'

import { useBetterQuote } from './useBetterQuote'
import { useSwapBestOrder } from './useSwapBestOrder'
import { useSwapBestTrade } from './useSwapBestTrade'
import { createLoadedValue, LoadedValue } from './utils/LoadedValue'
import { useCachedValue } from './utils/useCachedValue'

export const useAllTypeBestTrade = () => {
  const [xEnabled] = usePCSX()
  const [isQuotingPaused, setIsQuotingPaused] = useState(false)
  const bestOrder = useSwapBestOrder()
  const { isLoading, trade, refresh, syncing, isStale, error } = useSwapBestTrade({ maxHops: 3 })

  const currentOrder = useCachedValue(
    () => createLoadedValue(bestOrder.order, bestOrder.isLoading, bestOrder.error),
    isQuotingPaused,
    [bestOrder.order, bestOrder.isLoading, bestOrder.error],
  )

  const ammCurrentTrade = useCachedValue(() => trade, isQuotingPaused, [trade])

  const pauseQuoting = useCallback(() => {
    setIsQuotingPaused(true)
  }, [])

  const resumeQuoting = useCallback(() => {
    setIsQuotingPaused(false)
  }, [])

  const refreshTrade: () => void = useThrottleFn(refresh, 3000)
  const refreshOrder: () => void = useThrottleFn(bestOrder.refresh, 3000)

  const classicAmmOrder = useMemo(() => {
    const _trade: ClassicOrder | undefined = ammCurrentTrade && {
      trade: ammCurrentTrade as InfinityRouter.InfinityTradeWithoutGraph<TradeType>,
      type: OrderType.PCS_CLASSIC,
    }
    return createLoadedValue(_trade, isLoading, error)
  }, [ammCurrentTrade, isLoading, error])

  const hasAvailableDutchOrder =
    bestOrder.enabled && bestOrder.order?.type === OrderType.DUTCH_LIMIT && bestOrder.isValidQuote
  const ductedOrder = hasAvailableDutchOrder ? currentOrder : undefined
  const betterQuote: LoadedValue<ClassicOrder | XOrder> = useBetterQuote(classicAmmOrder, ductedOrder)
  const finalOrder: LoadedValue<ClassicOrder | XOrder> = xEnabled ? betterQuote : classicAmmOrder
  const tradeLoaded = Boolean(finalOrder && !finalOrder.isLoading)

  return {
    ammOrder: classicAmmOrder,
    xOrder: currentOrder,
    // TODO: for log purpose in this stage
    betterOrder: betterQuote,
    bestOrder: (tradeLoaded
      ? finalOrder?.trade?.inputAmount && finalOrder?.trade?.outputAmount
        ? finalOrder
        : undefined
      : finalOrder) as InterfaceOrder | undefined,
    tradeLoaded,
    tradeError: finalOrder?.error,
    refreshDisabled:
      finalOrder?.type === OrderType.DUTCH_LIMIT
        ? bestOrder.isLoading || !bestOrder.isStale
        : isLoading || syncing || !isStale,
    refreshOrder: finalOrder?.type === OrderType.DUTCH_LIMIT ? refreshOrder : refreshTrade,
    refreshTrade,
    pauseQuoting,
    resumeQuoting,
  }
}
