import { ChainId, NonEVMChainId, testnetChainIds, UnifiedChainId } from './chainId'
import {
  chainNameToChainId,
  chainNames,
  chainNamesInKebabCase,
  defiLlamaChainNames,
  mainnetChainNamesInKebabCase,
} from './chainNames'

const MAX_EVM_CHAIN_ID = Math.max(...Object.values(ChainId).filter((v) => typeof v === 'number'))

export function getChainName(chainId: UnifiedChainId) {
  return chainNames[chainId as ChainId]
}

export function getChainNameInKebabCase(chainId: UnifiedChainId) {
  return chainNamesInKebabCase[chainId as ChainId]
}

export function getMainnetChainNameInKebabCase(chainId: keyof typeof mainnetChainNamesInKebabCase) {
  return mainnetChainNamesInKebabCase[chainId]
}

export function getLlamaChainName(chainId: ChainId) {
  return defiLlamaChainNames[chainId]
}

export function getChainIdByChainName(chainName?: string): UnifiedChainId | undefined {
  if (!chainName) return undefined
  return chainNameToChainId[chainName] ?? undefined
}

export function isTestnetChainId(chainId: UnifiedChainId) {
  return testnetChainIds.includes(chainId as ChainId)
}

export function isEvm(chainId?: number) {
  if (!chainId) return false
  return chainId <= MAX_EVM_CHAIN_ID
}

export function isChainSupported(chainId?: UnifiedChainId) {
  if (!chainId) return false
  return Object.values(ChainId).includes(chainId as ChainId)
}

export function isSolana(chainId?: UnifiedChainId) {
  if (!chainId) return false
  return chainId === NonEVMChainId.SOLANA
}
