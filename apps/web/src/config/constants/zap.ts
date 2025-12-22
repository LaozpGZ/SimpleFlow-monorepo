import { ChainId } from '@pancakeswap/chains'

// Empty array whitelists all pools for the chain, omitting the chain means ZAP is unsupported.
export const ZAP_V3_POOL_ADDRESSES: Record<number, string[]> = {
  [ChainId.BSC]: [] as string[],
}

// Infinity CLMM Zap is only supported on BNB Chain (BSC)
export const ZAP_INFINITY_CL_SUPPORTED_CHAINS: number[] = [ChainId.BSC]
