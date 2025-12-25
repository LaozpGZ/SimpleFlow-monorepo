import { Currency, UnifiedCurrency } from '@simpleflow/sdk'
import { ChainId } from '@simpleflow/chains'
import SwapWarningTokens from 'config/constants/swapWarningTokens'

const shouldShowSwapWarning = (chainId: ChainId | undefined, swapCurrency?: UnifiedCurrency): boolean => {
  if (chainId && SwapWarningTokens[chainId] && swapCurrency) {
    const swapWarningTokens = Object.values(SwapWarningTokens[chainId])
    return swapWarningTokens.some((warningToken) => warningToken.equals(swapCurrency as Currency))
  }

  return false
}

export default shouldShowSwapWarning
