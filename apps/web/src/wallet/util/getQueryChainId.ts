import { isAptos, ChainId, getChainIdByChainName } from '@simpleflow/chains'
import safeGetWindow from '@simpleflow/utils/safeGetWindow'

export function getQueryChainId() {
  const window = safeGetWindow()
  if (!window) {
    return ChainId.SIMPLECHAIN
  }
  const params = new URL(window.location.href).searchParams
  const chainId = getChainIdByChainName(params.get('chain') || '')
  // Aptos not supported in web
  if (!chainId || isAptos(chainId)) {
    return undefined
  }
  return chainId
}
