import { ChainId } from '@pancakeswap/chains'
import { Chain } from 'viem'
import { evmChains, NonEvmChain, nonEvmChains } from './chains'

type Network = (Chain & { isEvm: true }) | (NonEvmChain & { isEvm: false })

export function getSortedChains(chainId?: ChainId, showTestnet?: boolean): Network[] {
  const chainOrder = [
    'BNB Smart Chain', // BSC
    'Ethereum', // ETH
    'Solana', // SOL
    'Base', // Base
    'Arbitrum One', // ARB
    'ZKsync Era', // ZKsync
    'Linea Mainnet', // Linea
    'Aptos', // Aptos
    'opBNB', // Opbnb
    'Polygon zkEVM', // ZKevm
  ] as const

  const chainRnk: Record<string, number> = {}
  chainOrder.forEach((chain, i) => {
    chainRnk[chain] = i
  })

  // 1) filter your EVM list based on the same logic you had...
  const filteredEvm = evmChains.filter((chain) => {
    if (chain.id === chainId) return true
    if ('testnet' in chain && chain.testnet && chain.id !== ChainId.MONAD_TESTNET) {
      return showTestnet
    }
    return true
  })

  // 2) build a single `networks` array
  const networks: Network[] = [
    ...filteredEvm.map((chain) => ({ ...chain, isEvm: true } as Network)), // mark as EVM
    ...nonEvmChains.map((chain) => ({ ...chain, isEvm: false } as Network)), // mark as non-EVM
  ].sort((a, b) => {
    const rnkA = chainRnk[a.name] ?? 1000
    const rnkB = chainRnk[b.name] ?? 1000
    return rnkA - rnkB
  })
  return networks
}
