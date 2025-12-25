import { Token, WNATIVE } from '@simpleflow/sdk'
import { ChainId } from '@simpleflow/chains'

export function getNativeWrappedToken(chainId: ChainId): Token | null {
  return WNATIVE[chainId] ?? null
}
