import { ChainId } from '@pancakeswap/chains'
import { Percent, TradeType } from '@pancakeswap/sdk'
import { SmartRouterTrade, V4Router } from '@pancakeswap/smart-router'
import { BigNumber } from 'bignumber.js'
import { L2_CHAIN_IDS } from 'config/chains'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useGasPrice } from '../state/user/hooks'

import useNativeCurrency from './useNativeCurrency'
import { useStablecoinPrice, useStablecoinPriceAmount } from './useStablecoinPrice'

const DEFAULT_AUTO_SLIPPAGE = new Percent(50, 10_000) // 0.5%
const MIN_AUTO_SLIPPAGE_TOLERANCE = new Percent(5, 10_000) // 0.5%
const MAX_AUTO_SLIPPAGE_TOLERANCE = new Percent(500, 10_000) // 5%

// Helper functions
const isL2ChainId = (chainId?: number): boolean => {
  if (!chainId) return false
  return L2_CHAIN_IDS.includes(chainId)
}

const chainSupportsGasEstimates = (chainId?: number): boolean => {
  if (!chainId) return false
  return chainId === ChainId.ETHEREUM || chainId === ChainId.BSC
}

// Type guard to check if trade is V4Trade
const isV4Trade = (
  trade: SmartRouterTrade<TradeType> | V4Router.V4TradeWithoutGraph<TradeType> | undefined,
): trade is V4Router.V4TradeWithoutGraph<TradeType> => {
  return trade !== undefined && 'gasUseEstimate' in trade
}

// Estimate gas for a trade
const guesstimateGas = (trade?: SmartRouterTrade<TradeType> | V4Router.V4TradeWithoutGraph<TradeType>): number => {
  if (!trade) return 0
  // A very rough gas estimation based on the trade type
  return 200000 // Default gas estimate
}

type SupportedTrade = SmartRouterTrade<TradeType> | V4Router.V4TradeWithoutGraph<TradeType>

export default function useClassicAutoSlippageTolerance(trade?: SupportedTrade): Percent {
  const { chainId } = useAccount()
  const onL2 = isL2ChainId(chainId)

  // Get USD price of output amount
  const outputCurrency = trade?.outputAmount?.currency
  const outputUSDPrice = useStablecoinPrice(outputCurrency)
  const outputAmount = trade?.outputAmount?.toSignificant(6)
  const outputDollarValue =
    outputAmount && outputUSDPrice ? parseFloat(outputAmount) * parseFloat(outputUSDPrice.toSignificant(6)) : undefined

  // Gas estimation
  const supportsGasEstimate = useMemo(() => chainId && chainSupportsGasEstimates(chainId), [chainId])

  // Get base gas estimate currency price for V4 trades
  const baseGasEstimateCurrency = isV4Trade(trade) ? trade.gasUseEstimateBase?.currency : undefined
  const baseGasEstimatePrice = useStablecoinPrice(baseGasEstimateCurrency)

  // Get gas estimate in USD based on trade type
  const gasEstimateUSD = useMemo(() => {
    if (!supportsGasEstimate || !trade) return null

    if (isV4Trade(trade)) {
      // For V4Trade, use gasUseEstimateBase and convert to USD
      const baseGasEstimate = trade.gasUseEstimateBase
      if (baseGasEstimate && baseGasEstimatePrice) {
        const baseAmount = parseFloat(baseGasEstimate.toSignificant(6))
        return baseAmount * parseFloat(baseGasEstimatePrice.toSignificant(6))
      }
      return null
    }

    // For SmartRouterTrade, use gasEstimateInUSD
    return trade.gasEstimateInUSD
      ? typeof trade.gasEstimateInUSD === 'string'
        ? parseFloat(trade.gasEstimateInUSD)
        : Number(trade.gasEstimateInUSD)
      : null
  }, [supportsGasEstimate, trade, baseGasEstimatePrice])

  const nativeGasPrice = useGasPrice()
  const nativeCurrency = useNativeCurrency(chainId)
  const gasEstimate = guesstimateGas(trade)

  // Calculate native gas cost
  const nativeGasCost =
    nativeGasPrice && typeof gasEstimate === 'number'
      ? new BigNumber(nativeGasPrice.toString()).multipliedBy(gasEstimate)
      : undefined

  // Convert native gas cost to USD without using CurrencyAmount
  const gasCostAmount =
    nativeGasCost && nativeCurrency ? parseFloat(nativeGasCost.toFixed(0)) / 10 ** nativeCurrency.decimals : undefined

  // Always call the hook unconditionally
  const gasCostUSDValue = useStablecoinPriceAmount(nativeCurrency, gasCostAmount)

  return useMemo(() => {
    console.log('Auto Slippage Debug:', {
      hasTrade: !!trade,
      onL2,
      chainId,
      supportsGasEstimate,
      gasEstimateUSD,
      gasCostUSDValue,
      outputDollarValue,
      outputCurrency: outputCurrency?.symbol,
      outputUSDPrice: outputUSDPrice?.toSignificant(6),
      outputAmount,
      nativeGasPrice: nativeGasPrice?.toString(),
      gasEstimate,
      nativeGasCost: nativeGasCost?.toString(),
      gasCostAmount,
    })

    if (!trade || onL2) {
      console.log('Auto Slippage: Using DEFAULT_AUTO_SLIPPAGE because', !trade ? 'no trade' : 'on L2')
      return DEFAULT_AUTO_SLIPPAGE
    }

    // If valid estimate from API and using API trade, use gas estimate from API
    // NOTE - don't use gas estimate for L2s yet - need to verify accuracy
    // If not, use local heuristic
    const dollarCostToUse = supportsGasEstimate && gasEstimateUSD ? gasEstimateUSD : gasCostUSDValue

    if (outputDollarValue && dollarCostToUse) {
      // Optimize for highest possible slippage without getting MEV'd
      // Set slippage % such that the difference between expected amount out and minimum amount out < gas fee to sandwich the trade
      const fraction = dollarCostToUse / outputDollarValue
      const result = new Percent(Math.floor(fraction * 10000), 10000)

      console.log('Auto Slippage: Calculated result', {
        dollarCostToUse,
        outputDollarValue,
        fraction,
        resultBasisPoints: Math.floor(fraction * 10000),
        result: result.toFixed(2),
      })

      if (result.greaterThan(MAX_AUTO_SLIPPAGE_TOLERANCE)) {
        console.log('Auto Slippage: Using MAX_AUTO_SLIPPAGE_TOLERANCE', MAX_AUTO_SLIPPAGE_TOLERANCE.toFixed(2))
        return MAX_AUTO_SLIPPAGE_TOLERANCE
      }

      if (result.lessThan(MIN_AUTO_SLIPPAGE_TOLERANCE)) {
        console.log('Auto Slippage: Using MIN_AUTO_SLIPPAGE_TOLERANCE', MIN_AUTO_SLIPPAGE_TOLERANCE.toFixed(2))
        return MIN_AUTO_SLIPPAGE_TOLERANCE
      }

      console.log('Auto Slippage: Using calculated result', result.toFixed(2))
      return result
    }

    console.log('Auto Slippage: Using DEFAULT_AUTO_SLIPPAGE because missing outputDollarValue or dollarCostToUse')
    return DEFAULT_AUTO_SLIPPAGE
  }, [
    trade,
    onL2,
    supportsGasEstimate,
    gasEstimateUSD,
    gasCostUSDValue,
    outputDollarValue,
    chainId,
    nativeGasPrice,
    gasEstimate,
    outputCurrency,
    outputUSDPrice,
    outputAmount,
    nativeGasCost,
    gasCostAmount,
  ])
}
