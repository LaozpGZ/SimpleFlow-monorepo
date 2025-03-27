import { ChainId } from '@pancakeswap/chains'
import { bscDynamicHooks, bscHooksList } from './bsc'
import { bscTestnetDynamicHooks, bscTestnetHooksList } from './bscTestnet'

export const hooksList = {
  [ChainId.BSC]: bscHooksList,
  [ChainId.BSC_TESTNET]: bscTestnetHooksList,
}

export const dynamicHooksList = {
  [ChainId.BSC]: bscDynamicHooks,
  [ChainId.BSC_TESTNET]: bscTestnetDynamicHooks,
}

export * from './dynamicFeeHook'
