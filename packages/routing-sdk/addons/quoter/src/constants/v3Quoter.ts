import { ChainId } from '@pancakeswap/chains'
import type { Address } from 'viem'

export const V3_QUOTER_ADDRESSES = {
  [ChainId.BSC]: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
  [ChainId.BSC_TESTNET]: '0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2',
  [ChainId.SIMPLECHAIN_TESTNET]: '0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5',
} as const satisfies Record<ChainId, Address>
