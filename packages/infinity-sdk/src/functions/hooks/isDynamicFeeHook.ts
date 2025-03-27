import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

import { BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN, CL_DYNAMIC_FEE_HOOKS_BY_CHAIN, InfinitySupportedChains } from '../../constants'

export function isDynamicFeeHook(chainId: ChainId, hook?: Address) {
  if (!hook) return false
  return (
    CL_DYNAMIC_FEE_HOOKS_BY_CHAIN[chainId as InfinitySupportedChains] === hook ||
    BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN[chainId as InfinitySupportedChains] === hook
  )
}
