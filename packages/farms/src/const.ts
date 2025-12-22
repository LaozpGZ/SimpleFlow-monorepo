import { ChainId } from '@pancakeswap/chains'

// @todo remove all other v2/v3 and type definitions
export const supportedChainIdV4 = [
  ChainId.BSC,
  ChainId.BSC_TESTNET,
  ChainId.SIMPLECHAIN_TESTNET,
] as const satisfies readonly ChainId[]

// from: https://api.merkl.xyz/v4/chains/
export const merklSupportedChainId = [56] // BSC chain ID

export const supportedChainIdV2 = [ChainId.BSC, ChainId.BSC_TESTNET] as const
export const supportedChainIdV3 = [ChainId.BSC, ChainId.BSC_TESTNET, ChainId.SIMPLECHAIN_TESTNET] as const
export const supportedChainId = Array.from(new Set<ChainId>([...supportedChainIdV2, ...supportedChainIdV3]))
export const bCakeSupportedChainId = [ChainId.BSC] as const

export const FARM_AUCTION_HOSTING_IN_SECONDS = 691200

export type FarmSupportedChainId = (typeof supportedChainId)[number]

export type FarmV2SupportedChainId = (typeof supportedChainIdV2)[number]

export type FarmV3SupportedChainId = (typeof supportedChainIdV3)[number]

export type FarmV4SupportedChainId = (typeof supportedChainIdV4)[number]

export const masterChefAddresses = {
  [ChainId.BSC_TESTNET]: '0xB4A466911556e39210a6bB2FaECBB59E4eB7E43d',
  [ChainId.BSC]: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
} as const

export const masterChefV3Addresses = {
  [ChainId.BSC]: '0x556B9306565093C855AEA9AE92A594704c2Cd59e',
  [ChainId.BSC_TESTNET]: '0x4c650FB471fe4e0f476fD3437C3411B1122c4e3B',
  [ChainId.SIMPLECHAIN_TESTNET]: '0x',
} as const satisfies Record<FarmV3SupportedChainId, string>

export const crossFarmingVaultAddresses = {} as const
