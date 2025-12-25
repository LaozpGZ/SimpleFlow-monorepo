import { chainFullNames, UnifiedChainId } from '@simpleflow/chains'

export function getChainFullName(chainId: UnifiedChainId) {
  return chainFullNames[chainId]
}
