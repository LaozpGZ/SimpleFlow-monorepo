import { ChainId } from '@pancakeswap/chains'
import { arbitrum, bsc, zkSync, bscTestnet } from 'viem/chains'

export const SUPPORTED_CHAIN_IDS = [ChainId.BSC, ChainId.ZKSYNC, ChainId.ARBITRUM_ONE, ChainId.BSC_TESTNET] as const

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export const targetChains = [bsc, zkSync, arbitrum, bscTestnet]
