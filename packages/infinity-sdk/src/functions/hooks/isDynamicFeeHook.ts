import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

import { cacheByMem } from '@pancakeswap/utils/cacheByMem'
import { findHook } from '../../constants'
import { HOOK_CATEGORY } from '../../types'

export const isDynamicFeeHook = cacheByMem((chainId: ChainId, hook?: Address) => {
  if (!hook) return false
  const relatedHook = findHook(hook, chainId)
  if (relatedHook?.category?.includes(HOOK_CATEGORY.DynamicFees)) {
    return true
  }
  return false
})
