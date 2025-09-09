import { ChainId, NonEVMChainId } from '@pancakeswap/chains'
import { useAtomValue } from 'jotai'
import { solanaExplorerAtom } from '@pancakeswap/utils/user'
import { multiChainScanName } from 'state/info/constant'
import { bsc } from 'wagmi/chains'
import { chains } from 'utils/wagmi'

export function useBlockExploreName(chainIdOverride?: number) {
  const solanaExplorer = useAtomValue(solanaExplorerAtom)
  const chainId = chainIdOverride || ChainId.BSC

  if (chainId === NonEVMChainId.SOLANA) {
    return solanaExplorer.name || 'Solscan'
  }

  const chain = chains.find((c) => c.id === chainId)

  return multiChainScanName[chain?.id || -1] || chain?.blockExplorers?.default.name || bsc.blockExplorers.default.name
}
