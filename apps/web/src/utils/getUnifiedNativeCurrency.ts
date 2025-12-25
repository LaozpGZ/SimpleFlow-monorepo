import { ChainId, NonEVMChainId, UnifiedChainId } from '@simpleflow/chains'
import { Native, SOL } from '@simpleflow/sdk'

export const getUnifiedNativeCurrency = (chainId: UnifiedChainId) => {
  try {
    if (chainId === NonEVMChainId.SOLANA) {
      return SOL
    }
    return Native.onChain(chainId ?? ChainId.BSC)
  } catch (e) {
    return Native.onChain(ChainId.BSC)
  }
}
