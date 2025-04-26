import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType, SmartRouterTrade, V4Router } from '@pancakeswap/smart-router'
import { Currency, TradeType } from '@pancakeswap/swap-sdk-core'
import { useCallback, useMemo, useRef, useState } from 'react'

import { usePCSX } from 'hooks/usePCSX'
import { useThrottleFn } from 'hooks/useThrottleFn'
import { BridgeOrderWithCommands, InterfaceOrder } from 'views/Swap/utils'

import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useCurrency } from 'hooks/Tokens'
import { useBetterQuote } from 'hooks/useBestAMMTrade'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useBridgeMetadata } from 'views/Swap/Bridge/hooks/useBridgeMetadata'
import { useSwapBestOrder, useSwapBestTrade } from './useSwapBestTrade'

type Trade = SmartRouterTrade<TradeType> | V4Router.V4TradeWithoutGraph<TradeType>

export const useAllTypeBestTrade = () => {
  const [xEnabled] = usePCSX()
  const [isQuotingPaused, setIsQuotingPaused] = useState(false)
  const bestOrder = useSwapBestOrder()

  const { isLoading, trade, refresh, syncing, isStale, error } = useSwapBestTrade({ maxHops: 3 })

  console.log('trade', trade)

  const lockedAMMTrade = useRef<Trade | undefined>()
  const lockedOrder = useRef<
    | (InterfaceOrder<Currency, Currency> & {
        isLoading: typeof isLoading
        error: typeof error
      })
    | undefined
  >()

  const currentOrder = useMemo(() => {
    const best = bestOrder.order
      ? {
          ...bestOrder.order,
          isLoading: bestOrder.isLoading,
          error: bestOrder.error ?? undefined,
        }
      : undefined
    if (!lockedOrder.current) {
      lockedOrder.current = best
    }
    lockedOrder.current = isQuotingPaused ? lockedOrder.current : best
    return lockedOrder.current
  }, [isQuotingPaused, bestOrder.order, bestOrder.isLoading, bestOrder.error])

  const ammCurrentTrade = useMemo(() => {
    if (!lockedAMMTrade.current) {
      lockedAMMTrade.current = trade
    }
    lockedAMMTrade.current = isQuotingPaused ? lockedAMMTrade.current : trade
    return lockedAMMTrade.current
  }, [isQuotingPaused, trade])

  const pauseQuoting = useCallback(() => {
    setIsQuotingPaused(true)
  }, [])

  const resumeQuoting = useCallback(() => {
    setIsQuotingPaused(false)
  }, [])

  const refreshTrade = useThrottleFn(refresh, 3000)
  const refreshOrder = useThrottleFn(bestOrder.refresh, 3000)

  const classicAmmOrder = useMemo(() => {
    return ammCurrentTrade
      ? {
          trade: ammCurrentTrade,
          type: OrderType.PCS_CLASSIC,
          isLoading,
          error: error ?? undefined,
        }
      : undefined
  }, [ammCurrentTrade, isLoading, error])

  const hasAvailableDutchOrder =
    bestOrder.enabled && bestOrder.order?.type === OrderType.DUTCH_LIMIT && bestOrder.isValidQuote

  const betterQuote = useBetterQuote(classicAmmOrder, hasAvailableDutchOrder ? currentOrder : undefined)

  const finalSwapOrder = xEnabled ? betterQuote : classicAmmOrder

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId, chainId: inputCurrencyChainId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId, chainId: outputCurrencyChainId },
  } = useSwapState()
  const outputCurrency = useCurrency(outputCurrencyId, outputCurrencyChainId)
  const inputCurrency = useCurrency(inputCurrencyId, inputCurrencyChainId)
  const inputAmount = tryParseAmount(typedValue, inputCurrency)

  const { data: bridgeOrder } = useBridgeMetadata({
    inputAmount: finalSwapOrder?.trade ? finalSwapOrder?.trade?.outputAmount : inputAmount,
    outputCurrency,
  })

  let finalOrder = finalSwapOrder

  // TODO: refactor this logic to be more encapsulated
  if (bridgeOrder && outputCurrency && inputCurrencyChainId !== outputCurrency?.chainId) {
    if (finalOrder?.trade) {
      finalOrder = {
        bridgeFee: bridgeOrder?.bridgeFee,
        type: OrderType.PCS_BRIDGE,
        trade: {
          inputAmount: finalOrder?.trade?.inputAmount,
          outputAmount: bridgeOrder?.trade?.outputAmount,
          routes: [
            ...('routes' in finalOrder?.trade ? finalOrder.trade.routes : []),
            {
              path: [finalOrder?.trade?.outputAmount?.currency, bridgeOrder?.trade?.outputAmount?.currency],
              inputAmount: finalOrder?.trade?.outputAmount,
              outputAmount: bridgeOrder?.trade?.outputAmount,
              type: RouteType.BRIDGE,
            },
          ],
          tradeType: bridgeOrder?.trade?.tradeType,
        },
        commands: [finalOrder, bridgeOrder],
        isLoading: false,
        error: undefined,
      } as BridgeOrderWithCommands
    } else if (inputAmount) {
      finalOrder = {
        ...bridgeOrder,
        commands: [bridgeOrder],
        isLoading: false,
        error: undefined,
      } as BridgeOrderWithCommands
    }
  }

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
    tradeError: finalOrder ? finalOrder.error : error,
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
