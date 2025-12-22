import { ChainId } from '@pancakeswap/chains'
import { simplechainDynamicHooks, simplechainHooksList, simplechainWhitelistLabeledHooks } from './simplechain'
import { simplechainTestnetDynamicHooks, simplechainTestnetHooksList } from './simplechainTestnet'
import { baseDynamicHooks, baseHooksList } from './base'

export const hooksList = {
  [ChainId.SIMPLECHAIN]: simplechainHooksList,
  [ChainId.SIMPLECHAIN_TESTNET]: simplechainTestnetHooksList,
  [ChainId.BASE]: baseHooksList,
  [ChainId.SEPOLIA]: [],
}

export const dynamicHooksList = {
  [ChainId.SIMPLECHAIN]: simplechainDynamicHooks,
  [ChainId.SIMPLECHAIN_TESTNET]: simplechainTestnetDynamicHooks,
  [ChainId.BASE]: baseDynamicHooks,
  [ChainId.SEPOLIA]: [],
}

export const whitelistLabeledHooksList = {
  [ChainId.SIMPLECHAIN]: simplechainWhitelistLabeledHooks,
  [ChainId.SIMPLECHAIN_TESTNET]: [],
  [ChainId.BASE]: [],
  [ChainId.SEPOLIA]: [],
}

export function findHook(hook: string, chainId: ChainId) {
  const list = hooksList[chainId as keyof typeof hooksList]
  return list.find((x) => x.address === hook)
}

export * from './dynamicFeeHook'
