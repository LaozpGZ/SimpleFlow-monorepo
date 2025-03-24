import { ChainId } from '@pancakeswap/chains'
import { Percent, TradeType } from '@pancakeswap/sdk'
import { SmartRouterTrade } from '@pancakeswap/smart-router'
import { BigNumber } from 'bignumber.js'
import { L2_CHAIN_IDS } from 'config/chains'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useGasPrice } from '../state/user/hooks'

import useNativeCurrency from './useNativeCurrency'
import { useStablecoinPrice, useStablecoinPriceAmount } from './useStablecoinPrice'

const DEFAULT_AUTO_SLIPPAGE = new Percent(50, 10_000) // 0.5%
const MIN_AUTO_SLIPPAGE_TOLERANCE = new Percent(5, 10_000) // 0.05%
const MAX_AUTO_SLIPPAGE_TOLERANCE = new Percent(100, 10_000) // 1%

// Helper functions
const isL2ChainId = (chainId?: number): boolean => {
  if (!chainId) return false
  return L2_CHAIN_IDS.includes(chainId)
}

const chainSupportsGasEstimates = (chainId?: number): boolean => {
  if (!chainId) return false
  return chainId === ChainId.ETHEREUM || chainId === ChainId.BSC
}

// Estimate gas for a trade
const guesstimateGas = (trade?: SmartRouterTrade<TradeType>): number => {
  if (!trade) return 0
  // A very rough gas estimation based on the trade type
  return 200000 // Default gas estimate
}

export default function useClassicAutoSlippageTolerance(trade?: SmartRouterTrade<TradeType>): Percent {
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

  // For chains that support gas estimates
  const gasEstimateUSD =
    supportsGasEstimate && trade?.gasEstimateInUSD
      ? typeof trade.gasEstimateInUSD === 'string'
        ? parseFloat(trade.gasEstimateInUSD)
        : Number(trade.gasEstimateInUSD)
      : null

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
    if (!trade || onL2) {
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

      if (result.greaterThan(MAX_AUTO_SLIPPAGE_TOLERANCE)) {
        return MAX_AUTO_SLIPPAGE_TOLERANCE
      }

      if (result.lessThan(MIN_AUTO_SLIPPAGE_TOLERANCE)) {
        return MIN_AUTO_SLIPPAGE_TOLERANCE
      }

      return result
    }

    return DEFAULT_AUTO_SLIPPAGE
  }, [trade, onL2, supportsGasEstimate, gasEstimateUSD, gasCostUSDValue, outputDollarValue])
}
