import { ChainId } from '@pancakeswap/chains'
import { getSourceChain } from '@pancakeswap/ifos'
import { useMemo } from 'react'

// By default source chain is the first chain that supports native ifo
export function useIfoSourceChain(chainId?: ChainId) {
  return useMemo(() => getSourceChain(chainId) || ChainId.BSC, [chainId])
}
