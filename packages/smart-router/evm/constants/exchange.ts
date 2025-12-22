import { ChainId } from '@pancakeswap/chains'
import { Token, WNATIVE } from '@pancakeswap/sdk'
import { bscTestnetTokens, bscTokens, simplechainTestnetTokens } from '@pancakeswap/tokens'

import { ChainMap, ChainTokenList } from '../types'

export const SMART_ROUTER_ADDRESSES = {
  [ChainId.BSC]: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
  [ChainId.BSC_TESTNET]: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
  [ChainId.SIMPLECHAIN_TESTNET]: '0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12',
} as const satisfies Record<ChainId, string>

export const V2_ROUTER_ADDRESS: ChainMap<string> = {
  [ChainId.BSC]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  [ChainId.BSC_TESTNET]: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  [ChainId.SIMPLECHAIN_TESTNET]: '',
}

export const STABLE_SWAP_INFO_ADDRESS: ChainMap<string> = {
  [ChainId.BSC]: '0xa680d27f63Fa5E213C502d1B3Ca1EB6a3C1b31D6',
  [ChainId.BSC_TESTNET]: '0xaE6C14AAA753B3FCaB96149e1E10Bc4EDF39F546',
  [ChainId.SIMPLECHAIN_TESTNET]: '',
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.BSC]: [
    bscTokens.wbnb,
    bscTokens.cake,
    bscTokens.usd1,
    bscTokens.usdt,
    bscTokens.btcb,
    bscTokens.eth,
    bscTokens.usdc,
  ],
  [ChainId.BSC_TESTNET]: [bscTestnetTokens.wbnb, bscTestnetTokens.cake, bscTestnetTokens.busd, bscTestnetTokens.usdc],
  [ChainId.SIMPLECHAIN_TESTNET]: [
    simplechainTestnetTokens.wsrw,
    simplechainTestnetTokens.usdc,
    simplechainTestnetTokens.usdt,
  ],
}

export type ADDITIONAL_BASES_TABLE = {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
}
/**
 * Additional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: ADDITIONAL_BASES_TABLE = {
  [ChainId.BSC]: {
    // SNFTS-SFUND
    [bscTokens.snfts.address]: [bscTokens.sfund],

    [bscTokens.ankr.address]: [bscTokens.ankrbnb],
    [bscTokens.ankrbnb.address]: [bscTokens.ankrETH, bscTokens.ankr],
    [bscTokens.ankrETH.address]: [bscTokens.ankrbnb],

    // REVV - EDU
    [bscTokens.revv.address]: [bscTokens.edu],
    [bscTokens.edu.address]: [bscTokens.revv],
    // unshETH - USH
    [bscTokens.unshETH.address]: [bscTokens.ush],
    [bscTokens.ush.address]: [bscTokens.unshETH],

    [bscTokens.tusd.address]: [bscTokens.usdd],
    [bscTokens.usdd.address]: [bscTokens.tusd],

    [bscTokens.mpendle.address]: [bscTokens.pendle],
    [bscTokens.pendle.address]: [bscTokens.mpendle],

    [bscTokens.mdlp.address]: [bscTokens.dlp],
    [bscTokens.dlp.address]: [bscTokens.mdlp],

    [bscTokens.susde.address]: [bscTokens.usde],
    [bscTokens.usde.address]: [bscTokens.susde],
    [bscTokens.olm.address]: [bscTokens.ora],
    [bscTokens.ora.address]: [bscTokens.olm, bscTokens.brm],
    [bscTokens.brm.address]: [bscTokens.ora],
    [bscTokens.susdx.address]: [bscTokens.usdx],
  },
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 * @example [AMPL.address]: [DAI, WNATIVE[ChainId.BSC]]
 */
export const CUSTOM_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.BSC]: {
    [bscTokens.axlusdc.address]: [bscTokens.usdt],
  },
}
