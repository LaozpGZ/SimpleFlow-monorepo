import { ChainId } from '@pancakeswap/chains'
import { ERC20Token } from '@pancakeswap/sdk'
import { bscTestnetTokens, bscTokens } from '@pancakeswap/tokens'
import type { FarmV3SupportedChainId } from '../../src'
import type { CommonPrice } from '../../src/fetchFarmsV3'

export const CAKE_BNB_LP_MAINNET = '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0'

export type PriceHelper = {
  list: ERC20Token[]
}

export const priceHelperTokens = {
  [ChainId.BSC]: {
    list: [
      bscTokens.wbnb,
      bscTokens.usdt,
      bscTokens.busd,
      bscTokens.eth,
      bscTokens.solvbtc,
      bscTokens.solvBTCena,
      bscTokens.boxy,
    ],
  },
} satisfies Record<number, PriceHelper>

// for testing purposes
export const DEFAULT_COMMON_PRICE: Record<FarmV3SupportedChainId, CommonPrice> = {
  [ChainId.BSC]: {},
  [ChainId.BSC_TESTNET]: {
    [bscTestnetTokens.mockA.address]: '10',
    [bscTestnetTokens.usdt.address]: '1',
    [bscTestnetTokens.busd.address]: '1',
    [bscTestnetTokens.usdc.address]: '1',
  },
}
