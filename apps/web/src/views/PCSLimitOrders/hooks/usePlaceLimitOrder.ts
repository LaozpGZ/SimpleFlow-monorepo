import useCatchTxError from 'hooks/useCatchTxError'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { encodePoolKey, PoolKey } from '@pancakeswap/infinity-sdk'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { nearestUsableTick, sqrtRatioX96ToPrice, TickMath, maxLiquidityForAmounts } from '@pancakeswap/v3-sdk'
import { calculateGasMargin } from 'utils'
import { useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { tickToPrice } from 'hooks/infinity/utils'
import { BigNumber as BN } from 'bignumber.js'
import { parseUnits } from '@pancakeswap/utils/viem/parseUnits'
import { stringify } from 'viem/utils'
import { invertTickForLimitOrder } from '../utils/ticks'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { Field } from '../types/limitOrder.types'
import { parsedAmountsAtom } from '../state/form/inputAtoms'
import { ticksAtom } from '../state/form/ticksAtoms'
import { selectedPoolAtom } from '../state/pools/poolAtoms'
import { independentFieldAtom } from '../state/form/fieldAtoms'

interface UsePlaceLimitOrder {
  onError?: (error: any) => void
}

export const usePlaceLimitOrder = ({ onError }: UsePlaceLimitOrder = {}) => {
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()
  const { toastError } = useToast()

  const contract = useCLLimitOrderHookContract()
  const { fetchWithCatchTxError } = useCatchTxError()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
  const independentField = useAtomValue(independentFieldAtom)
  const isExactIn = independentField === Field.CURRENCY_A

  const parsedAmounts = useAtomValue(parsedAmountsAtom)
  const selectedPool = useAtomValue(selectedPoolAtom)
  const ticksData = useAtomValue(ticksAtom)

  // TODO: Handle passing native amounts
  const placeOrder = useCallback(async () => {
    if (!selectedPool || !account || !ticksData || !inputCurrency || !outputCurrency) return

    const parsedAmountA = parsedAmounts[Field.CURRENCY_A]

    // TESTING
    const parsedAmountB = parsedAmounts[Field.CURRENCY_B]

    if (!parsedAmountA || !parsedAmountB) return

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
    const { tickLower: tickLowerFromPool, tickUpper: tickUpperFromPool, zeroForOne: zeroForOneFromPool } = ticksData

    const zeroForOne = zeroForOneFromPool

    // For Limit Orders, the tick direction is opposite to pool's direction
    const tickLower = nearestUsableTick(
      invertTickForLimitOrder(tickUpperFromPool, poolInfo.tick),
      poolInfo.parameters.tickSpacing,
    )
    const tickUpper = nearestUsableTick(
      invertTickForLimitOrder(tickLowerFromPool, poolInfo.tick),
      poolInfo.parameters.tickSpacing,
    )

    const targetTick = zeroForOne ? tickUpper : tickLower

    // FOR TESTING convert ticks to price
    const priceLower = tickToPrice(inputCurrency, outputCurrency, tickLower).toSignificant(6)
    const priceUpper = tickToPrice(inputCurrency, outputCurrency, tickUpper).toSignificant(6)

    console.log('placeOrder TICKS', {
      zeroForOne,
      tickLower,
      tickUpper,
      targetTick,
      currentTick: poolInfo.tick,
      priceLower,
      priceUpper,
    })

    // TESTING CAKE -> BNB
    // const tickCurrent = 59291
    // const tickLower = 59200
    // const tickUpper = 59210
    // const targetTick = 59210
    // const zeroForOne = false

    // Liquidity calculation using both token amounts
    // Map input/output amounts to token0/token1 based on pool's currency ordering
    const amount0 = zeroForOne ? parsedAmountA : parsedAmountB
    const amount1 = zeroForOne ? parsedAmountB : parsedAmountA

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
      //   const estimatedGas = await contract.estimateGas.placeOrder([encodedPoolKey, targetTick, zeroForOne, liquidity], {
      //     account: account,
      //   })

      //   console.log('placeOrder: estimatedGas', estimatedGas)

      // TODO: Add gas fee checks later
      const value = inputCurrency.isNative ? parsedAmountA : 0n

      const receipt = await fetchWithCatchTxError(async () => {
        return contract.write.placeOrder([encodedPoolKey, targetTick, zeroForOne, liquidity], {
          account,
          chain: contract.chain,
          value,
          //   gas: calculateGasMargin(estimatedGas),
        })
      })

      if (receipt?.status) {
        console.log('placeOrder: Transaction successful', receipt.transactionHash)
      }
    } catch (error: any) {
      console.error('placeOrder: Unable to place limit order', error)
      toastError(t('Failed'), error.message || error.details || error)
      onError?.(error)
    }
  }, [contract, account, selectedPool, ticksData, parsedAmounts, fetchWithCatchTxError, onError])

  return {
    placeOrder,
  }
}
