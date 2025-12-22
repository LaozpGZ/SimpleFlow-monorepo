import { ChainId } from '@pancakeswap/chains'
import type { Address } from 'viem'

// = 1 << 23 or 100000000000000000000000
export const EMPTY_FEE_PATH_PLACEHOLDER = 8388608

export const MIXED_ROUTE_QUOTER_ADDRESSES = {
  [ChainId.BSC]: '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
  [ChainId.BSC_TESTNET]: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
  [ChainId.SIMPLECHAIN_TESTNET]: '0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5',
} as const satisfies Record<ChainId, Address>
