import useCatchTxError from 'hooks/useCatchTxError'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { encodePoolKey, PoolKey } from '@pancakeswap/infinity-sdk'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { nearestUsableTick, TickMath, maxLiquidityForAmounts } from '@pancakeswap/v3-sdk'
import { calculateGasMargin } from 'utils'
import { useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { tickToPrice } from 'hooks/infinity/utils'
import { stringify } from 'viem/utils'
import { Hex } from 'viem'
import { invertTickForLimitOrder } from '../utils/ticks'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { Field } from '../types/limitOrder.types'
import { parsedAmountsAtom } from '../state/form/inputAtoms'
import { ticksAtom } from '../state/form/ticksAtom'
import { selectedPoolAtom } from '../state/pools/selectedPoolAtom'
import { independentFieldAtom } from '../state/form/fieldAtoms'

interface UsePlaceLimitOrder {
  onError?: (error: any) => void
  onSuccess?: (hash: Hex) => void
}

export const usePlaceLimitOrder = ({ onError, onSuccess }: UsePlaceLimitOrder = {}) => {
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()
  const { toastError } = useToast()

  const contract = useCLLimitOrderHookContract()
  const { fetchWithCatchTxError } = useCatchTxError()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
  //   const independentField = useAtomValue(independentFieldAtom)
  //   const isExactIn = independentField === Field.CURRENCY_A

  const parsedAmounts = useAtomValue(parsedAmountsAtom)
  const { data: selectedPool } = useAtomValue(selectedPoolAtom)
  const ticksData = useAtomValue(ticksAtom)

  // TODO: Handle passing native amounts
  const placeOrder = useCallback(async () => {
    if (!selectedPool || !account || !ticksData || !inputCurrency || !outputCurrency) return

    const parsedAmountA = parsedAmounts[Field.CURRENCY_A]
    if (!parsedAmountA) return

    // PoolKey
    const { poolInfo } = selectedPool
    const poolKey: PoolKey = {
      currency0: poolInfo.currency0,
      currency1: poolInfo.currency1,
      poolManager: poolInfo.poolManager,
      fee: poolInfo.fee,
      parameters: poolInfo.parameters,
      hooks: poolInfo.hooks,
    }
    const encodedPoolKey = encodePoolKey(poolKey)

    // Ticks Calculation
    const {
      invertedTickLower,
      invertedTickUpper,
      invertedTargetTick,
      zeroForOne,
      tickLower: tickLower_,
      tickUpper: tickUpper_,
    } = ticksData

    // For Limit Orders, the tick direction is opposite to pool's direction
    // const tickLower = invertedTickLower
    // const tickUpper = invertedTickUpper
    // const targetTick = invertedTargetTick

    // TESTING: Take min/max of ticks for now.
    // ! INVERTED needed only if selling/buying at BAD price
    const tickLower = zeroForOne ? Math.max(tickLower_, invertedTickUpper) : Math.min(tickLower_, invertedTickUpper)
    const tickUpper = zeroForOne ? Math.max(tickUpper_, invertedTickLower) : Math.min(tickUpper_, invertedTickLower)

    // This works!
    // const tickLower = tickLower_
    // const tickUpper = tickUpper_

    const targetTick = tickLower

    // Liquidity calculation using both token amounts
    const amount0 = zeroForOne ? parsedAmountA : 0n // Only provide input amount when selling currency0
    const amount1 = zeroForOne ? 0n : parsedAmountA // Only provide input amount when selling currency1

    const liquidity = maxLiquidityForAmounts(
      poolInfo.sqrtPriceX96,
      TickMath.getSqrtRatioAtTick(tickLower),
      TickMath.getSqrtRatioAtTick(tickUpper),
      amount0,
      amount1,
      true, // useFullPrecision
    )

    console.log('placeOrder', {
      poolKey,
      parsedAmountA,
      targetTick,
      tickLower,
      tickUpper,
      zeroForOne,
      liquidity,
      tickCurrent: poolInfo.tick,
      poolInfo,
      stringified: stringify({
        poolKey,
        parsedAmountA,
        targetTick,
        tickLower,
        tickUpper,
        zeroForOne,
        liquidity,
        tickCurrent: poolInfo.tick,
        poolInfo,
      }),
    })

    try {
      // const estimatedGas = await contract.estimateGas.placeOrder([encodedPoolKey, targetTick, zeroForOne, liquidity], {
      //   account,
      // })

      // console.log('placeOrder: estimatedGas', estimatedGas)

      // TODO: Add gas fee checks later
      const value = inputCurrency.isNative ? parsedAmountA : 0n

      const receipt = await fetchWithCatchTxError(async () => {
        return contract.write.placeOrder([encodedPoolKey, targetTick, zeroForOne, liquidity], {
          account,
          chain: contract.chain,
          value,
          // gas: calculateGasMargin(estimatedGas),
        })
      })

      if (receipt?.status) {
        console.log('placeOrder: Transaction successful', receipt.transactionHash)
        onSuccess?.(receipt.transactionHash)
      }
    } catch (error: any) {
      console.error('placeOrder: Unable to place limit order', error)
      toastError(t('Failed'), error.message || error.details || error)
      onError?.(error)
    }
  }, [contract, account, selectedPool, ticksData, parsedAmounts, fetchWithCatchTxError, onError, onSuccess])

  return {
    placeOrder,
  }
}
