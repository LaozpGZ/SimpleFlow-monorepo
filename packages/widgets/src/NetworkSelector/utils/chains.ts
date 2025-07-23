import { type Chain } from 'viem'
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  bsc,
  bscTestnet,
  goerli,
  linea,
  lineaTestnet,
  mainnet,
  monadTestnet,
  opBNB,
  opBNBTestnet,
  polygonZkEvm,
  polygonZkEvmTestnet,
  scrollSepolia,
  sepolia,
  zkSync,
} from 'viem/chains'

export const evmChains: [Chain, ...Chain[]] = [
  bsc,
  bscTestnet,
  mainnet,
  goerli,
  sepolia,
  polygonZkEvm,
  polygonZkEvmTestnet,
  zkSync,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  linea,
  lineaTestnet,
  base,
  baseGoerli,
  baseSepolia,
  opBNB,
  opBNBTestnet,
  scrollSepolia,
  monadTestnet,
]

export interface NonEvmChain {
  id: number
  name: string
  link: string
  image: string
}

export const nonEvmChains: NonEvmChain[] = [
  {
    id: 1,
    name: 'Aptos',
    link: 'https://aptos.pancakeswap.finance/swap',
    image: 'https://aptos.pancakeswap.finance/images/apt.png',
  },
  {
    id: 2,
    name: 'Solana',
    link: process.env.SOLANA_SWAP_PAGE ?? 'https://solana.pancakeswap.finance/swap',
    image: 'https://tokens.pancakeswap.finance/images/symbol/sol.png',
  },
]
