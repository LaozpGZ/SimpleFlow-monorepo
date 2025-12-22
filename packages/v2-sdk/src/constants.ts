import { ChainId } from '@pancakeswap/chains'
import type { Address, Hash } from 'viem'

export const FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'

export const FACTORY_ADDRESS_MAP = {
  [ChainId.BSC]: FACTORY_ADDRESS,
  [ChainId.BSC_TESTNET]: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
  [ChainId.SIMPLECHAIN_TESTNET]: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
} as const satisfies Record<ChainId, Address>

export const INIT_CODE_HASH = '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'

export const INIT_CODE_HASH_MAP = {
  [ChainId.BSC]: INIT_CODE_HASH,
  [ChainId.BSC_TESTNET]: '0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66',
  [ChainId.SIMPLECHAIN_TESTNET]: '0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66',
} as const satisfies Record<ChainId, Hash>
