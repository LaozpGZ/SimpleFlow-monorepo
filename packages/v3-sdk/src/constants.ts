import { ChainId } from '@pancakeswap/chains'
import { Address, Hash } from 'viem'

const FACTORY_ADDRESS = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'

/**
 * To compute Pool address use DEPLOYER_ADDRESSES instead
 */
export const FACTORY_ADDRESSES = {
  [ChainId.BSC]: FACTORY_ADDRESS,
  [ChainId.BSC_TESTNET]: FACTORY_ADDRESS,
  [ChainId.SIMPLECHAIN_TESTNET]: '0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5',
} as const satisfies Record<ChainId, Address>

const DEPLOYER_ADDRESS = '0x41ff9AA7e16B8B1a8a8dc4f0eFacd93D02d071c9'

export const DEPLOYER_ADDRESSES = {
  [ChainId.BSC]: DEPLOYER_ADDRESS,
  [ChainId.BSC_TESTNET]: DEPLOYER_ADDRESS,
  [ChainId.SIMPLECHAIN_TESTNET]: '0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d',
} as const satisfies Record<ChainId, Address>

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

const POOL_INIT_CODE_HASH = '0x6ce8eb472fa82df5469c6ab6d485f17c3ad13c8cd7af59b3d4a8026c5ce0f7e2'

export const POOL_INIT_CODE_HASHES = {
  [ChainId.BSC]: POOL_INIT_CODE_HASH,
  [ChainId.BSC_TESTNET]: POOL_INIT_CODE_HASH,
  [ChainId.SIMPLECHAIN_TESTNET]: '0x2485b4b8c1eb9eba7259fb706aa57ea101810c610dec7a2c4ec0c47cbc2e9395',
} as const satisfies Record<ChainId, Hash>

const NFT_POSITION_MANAGER_ADDRESS = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

export const NFT_POSITION_MANAGER_ADDRESSES = {
  [ChainId.BSC]: NFT_POSITION_MANAGER_ADDRESS,
  [ChainId.BSC_TESTNET]: '0x427bF5b37357632377eCbEC9de3626C71A5396c1',
  [ChainId.SIMPLECHAIN_TESTNET]: '0x53074FeB375dD50b600c9986180ab90974112284',
} as const satisfies Record<ChainId, Address>

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 2500,
  HIGH = 10000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 50,
  [FeeAmount.HIGH]: 200,
}
