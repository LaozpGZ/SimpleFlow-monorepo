import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { BIG_INT_ZERO } from 'config/constants/exchange'
import { useEffect, useRef } from 'react'
import { Field } from 'state/swap/actions'
import { logGTMQuoteQueryEvent } from 'utils/customGTMEventTracking'

enum QuoteState {
  IDLE = 'idle',
  STARTED = 'started',
  COMPLETED = 'completed',
}

interface UseQuoteTrackingParams {
  typedValue: string
  tradeLoading?: boolean
  tradeError?: Error | null
  inputCurrency?: Currency
  outputCurrency?: Currency
  swapInputError?: string
  parsedAmounts: { [field in Field]?: any }
  disabled?: boolean
  isValid?: boolean
  order?: PriceOrder
}

export const useQuoteTrackingStateMachine = ({
  typedValue,
  tradeLoading = false,
  tradeError,
  inputCurrency,
  outputCurrency,
  swapInputError,
  parsedAmounts,
  disabled = false,
  isValid = false,
  order,
}: UseQuoteTrackingParams): void => {
  const stateRef = useRef<QuoteState>(QuoteState.IDLE)

  const isSwapButtonEnabled = isValid && !disabled

  // Auto-reset to IDLE when inputs change
  useEffect(() => {
    stateRef.current = QuoteState.IDLE
  }, [typedValue, inputCurrency?.chainId, outputCurrency?.chainId])

  // Quote Start Logic - only log if state is IDLE
  useEffect(() => {
    // if typedValue is not changed, skip
    if (!typedValue) return

    // Track quote start when user input amount and no quote result
    const haveEnoughData = inputCurrency?.chainId && outputCurrency?.chainId

    if (tradeLoading && haveEnoughData && !parsedAmounts[Field.OUTPUT]) {
      // Only log start if we haven't started yet
      if (stateRef.current === QuoteState.IDLE) {
        logGTMQuoteQueryEvent('start', {
          fromChain: inputCurrency?.chainId,
          toChain: outputCurrency?.chainId,
          fromToken: inputCurrency?.symbol,
          toToken: outputCurrency?.symbol,
          amount: typedValue,
        })

        // Transition to STARTED after logging start
        stateRef.current = QuoteState.STARTED
      }
    }
  }, [tradeLoading, inputCurrency, outputCurrency, typedValue, parsedAmounts])

  // Quote Success Logic - only log if state is STARTED
  useEffect(() => {
    // Track quote success when user input amount and swap is valid
    if (
      stateRef.current === QuoteState.STARTED &&
      order?.trade?.outputAmount?.greaterThan(BIG_INT_ZERO) &&
      isSwapButtonEnabled
    ) {
      // Only log success if we have started a quote session
      logGTMQuoteQueryEvent('succ', {
        fromChain: order?.trade?.inputAmount?.currency?.chainId,
        toChain: order?.trade?.outputAmount?.currency?.chainId,
        fromToken: order?.trade?.inputAmount?.currency?.symbol,
        toToken: order?.trade?.outputAmount?.currency?.symbol,
        amount: order?.trade?.inputAmount?.toExact(),
        amountOut: order?.trade?.outputAmount?.toExact(),
      })

      // Transition to COMPLETED after logging success
      stateRef.current = QuoteState.COMPLETED
    }
  }, [order, isSwapButtonEnabled])

  // Quote Fail Logic - only log if state is STARTED
  useEffect(() => {
    // Only log fail if we have started a quote session
    if (stateRef.current !== QuoteState.STARTED) return

    // if typedValue is not changed, skip
    if (tradeLoading || !parsedAmounts[Field.INPUT]?.greaterThan(BIG_INT_ZERO) || isSwapButtonEnabled) return

    const errorMsg = tradeError?.message || swapInputError

    if (errorMsg) {
      logGTMQuoteQueryEvent('fail', {
        fromChain: inputCurrency?.chainId,
        toChain: outputCurrency?.chainId,
        fromToken: inputCurrency?.symbol,
        toToken: outputCurrency?.symbol,
        amount: typedValue,
        errorMessage: errorMsg,
      })

      // Transition to COMPLETED after logging fail
      stateRef.current = QuoteState.COMPLETED
    }
  }, [
    tradeError,
    inputCurrency,
    outputCurrency,
    swapInputError,
    typedValue,
    isSwapButtonEnabled,
    parsedAmounts,
    tradeLoading,
  ])
}
