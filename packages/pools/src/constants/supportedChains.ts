import { ChainId } from '@pancakeswap/chains'

export const SUPPORTED_CHAIN_IDS = [ChainId.BSC, ChainId.BSC_TESTNET, ChainId.SIMPLECHAIN_TESTNET] as const

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export const CAKE_VAULT_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET] as const

export type CakeVaultSupportedChainId = (typeof CAKE_VAULT_SUPPORTED_CHAINS)[number]
