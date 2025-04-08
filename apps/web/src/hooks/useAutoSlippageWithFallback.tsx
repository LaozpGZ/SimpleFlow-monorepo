import { ExclusiveDutchOrderTrade } from '@pancakeswap/pcsx-sdk'
import { SmartRouterTrade, V4Router } from '@pancakeswap/smart-router'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { useAllTypeBestTrade } from 'views/Swap/V3Swap/hooks/useAllTypeBestTrade'
import useClassicAutoSlippageTolerance, {
  MIN_DEFAULT_SLIPPAGE_NUMERATOR,
  useInputBasedAutoSlippage,
} from './useAutoSlippage'

// Atom to store the user's preference for auto slippage
const autoSlippageEnabledAtom = atomWithStorage('pcs:auto-slippage-enabled-2', true)
const autoSlippageAtom = atomWithStorage('pcs:auto-slippage-value', MIN_DEFAULT_SLIPPAGE_NUMERATOR)

export const useAutoSlippageAtom = () => {
  return useAtom(autoSlippageAtom)
}

export const useAutoSlippageEnabled = () => {
  return useAtom(autoSlippageEnabledAtom)
}

type SupportedTrade =
  | SmartRouterTrade<TradeType>
  | V4Router.V4TradeWithoutGraph<TradeType>
  | ExclusiveDutchOrderTrade<Currency, Currency>

/**
 * Returns the slippage tolerance based on user settings or auto-calculated value
 * If auto slippage is enabled, it will use the auto-calculated value
 * Otherwise, it will use the user's manually set slippage
 */
export function useAutoSlippageWithFallback(): {
  slippageTolerance: number
  isAuto: boolean
} {
  const [isAutoSlippageEnabled] = useAutoSlippageEnabled()
  const [userSlippageTolerance] = useUserSlippage()
  const [autoSlippageTolerance] = useAutoSlippageAtom()
  const hasTrade = Boolean(useAllTypeBestTrade()?.bestOrder?.trade)

  return useMemo(() => {
    if (isAutoSlippageEnabled && hasTrade) {
      return {
        slippageTolerance: autoSlippageTolerance,
        isAuto: true,
      }
    }

    return {
      slippageTolerance: userSlippageTolerance,
      isAuto: false,
    }
  }, [isAutoSlippageEnabled, hasTrade, autoSlippageTolerance, userSlippageTolerance])
}

export const useInputBasedAutoSlippageWithFallback = (inputAmount?: CurrencyAmount<Currency>) => {
  const [isAutoSlippageEnabled] = useAutoSlippageEnabled()
  const [userSlippageTolerance] = useUserSlippage()
  const autoSlippageTolerance = useInputBasedAutoSlippage(inputAmount)

  return useMemo(() => {
    if (isAutoSlippageEnabled && inputAmount) {
      return {
        slippageTolerance: Number(autoSlippageTolerance.numerator),
        isAuto: true,
      }
    }

    return {
      slippageTolerance: userSlippageTolerance,
      isAuto: false,
    }
  }, [isAutoSlippageEnabled, inputAmount, autoSlippageTolerance, userSlippageTolerance])
}

export const AutoSlippageProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Sync />
    </>
  )
}
export const Sync = () => {
  const result = useAllTypeBestTrade()
  const autoSlippage = useClassicAutoSlippageTolerance(result?.bestOrder?.trade)
  const [, setAutoSlippageValue] = useAutoSlippageAtom()
  useEffect(() => {
    if (result?.bestOrder?.trade && autoSlippage) {
      setAutoSlippageValue(Number(autoSlippage.numerator))
    }
  }, [result, autoSlippage])
  return null
}
