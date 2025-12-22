import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import { bscTestnetTokens, bscTokens, simplechainTestnetTokens } from '@pancakeswap/tokens'

export const usdGasTokensByChain = {
  [ChainId.BSC]: [bscTokens.usdt],
  [ChainId.BSC_TESTNET]: [bscTestnetTokens.usdt],
  [ChainId.SIMPLECHAIN_TESTNET]: [simplechainTestnetTokens.usdt],
} satisfies Record<ChainId, Token[]>

export * from './stableSwap'
export * from './v2'
export * from './v3'
