import { ChainId } from '@pancakeswap/chains'
import { Percent } from '@pancakeswap/swap-sdk-core'

import { ERC20Token } from './entities/erc20Token'

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const WETH9 = {
  [ChainId.BSC]: new ERC20Token(
    ChainId.BSC,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Binance-Peg Ethereum Token',
    'https://ethereum.org',
  ),
  [ChainId.BSC_TESTNET]: new ERC20Token(
    ChainId.BSC,
    '0xE7bCB9e341D546b66a46298f4893f5650a56e99E',
    18,
    'ETH',
    'ETH',
    'https://ethereum.org',
  ),
  [ChainId.SIMPLECHAIN_TESTNET]: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
  ),
}

export const WBNB = {
  [ChainId.BSC]: new ERC20Token(
    ChainId.BSC,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org',
  ),
  [ChainId.BSC_TESTNET]: new ERC20Token(
    ChainId.BSC_TESTNET,
    '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org',
  ),
}

export const WNATIVE = {
  [ChainId.BSC]: WBNB[ChainId.BSC],
  [ChainId.BSC_TESTNET]: WBNB[ChainId.BSC_TESTNET],
  [ChainId.SIMPLECHAIN_TESTNET]: WETH9[ChainId.SIMPLECHAIN_TESTNET],
} satisfies Partial<Record<ChainId, ERC20Token>>

const BNB = {
  name: 'Binance Chain Native Token',
  symbol: 'BNB',
  decimals: 18,
} as const

export const NATIVE = {
  [ChainId.BSC]: BNB,
  [ChainId.BSC_TESTNET]: {
    name: 'Binance Chain Native Token',
    symbol: 'tBNB',
    decimals: 18,
  },
  [ChainId.SIMPLECHAIN_TESTNET]: {
    name: 'SimpleChain',
    symbol: 'SRW',
    decimals: 18,
  },
} satisfies Partial<
  Record<
    ChainId,
    {
      name: string
      symbol: string
      decimals: number
    }
  >
>
