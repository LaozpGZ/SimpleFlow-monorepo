import { ChainId } from '@pancakeswap/chains'

import { bscTokens } from './constants/bsc'
import { bscTestnetTokens } from './constants/bscTestnet'
import { simplechainTestnetTokens } from './constants/simplechainTestnet'

export const allTokens = {
  [ChainId.BSC]: bscTokens,
  [ChainId.BSC_TESTNET]: bscTestnetTokens,
  [ChainId.SIMPLECHAIN_TESTNET]: simplechainTestnetTokens,
}
