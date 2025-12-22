import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WNATIVE } from '@pancakeswap/sdk'
import { CAKE_TESTNET, BUSD, DAI_SIMPLECHAIN_TESTNET } from './common'

export const simplechainTestnetTokens = {
  wsrw: WNATIVE[ChainId.SIMPLECHAIN_TESTNET],
  wbnb: WNATIVE[ChainId.SIMPLECHAIN_TESTNET], // Alias for wsrw
  wbtc: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x770556F853a17893b1187A9754F17c6f57776b7c',
    8,
    'WBTC',
    'Wrapped Bitcoin',
    'https://bitcoin.org/',
  ),
  btcb: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x770556F853a17893b1187A9754F17c6f57776b7c',
    8,
    'BTCB',
    'Binance-Peg Bitcoin',
    'https://bitcoin.org/',
  ),
  usdt: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x3577E5E0E3A47d9a552426638977ee3EddD4552e',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  usdc: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.centre.io/usdc',
  ),
  dai: DAI_SIMPLECHAIN_TESTNET,
  cake: CAKE_TESTNET,
  busd: BUSD[ChainId.SIMPLECHAIN_TESTNET],
}

// Export bscTestnetTokens as alias for backward compatibility
export const bscTestnetTokens = simplechainTestnetTokens
