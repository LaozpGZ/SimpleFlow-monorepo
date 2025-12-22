import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WNATIVE } from '@pancakeswap/sdk'
import { CAKE_MAINNET, BUSD, DAI_SIMPLECHAIN } from './common'

export const simplechainTokens = {
  wsrw: WNATIVE[ChainId.SIMPLECHAIN],
  wbnb: WNATIVE[ChainId.SIMPLECHAIN], // Alias for wsrw
  wbtc: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x770556F853a17893b1187A9754F17c6f57776b7c',
    8,
    'WBTC',
    'Wrapped Bitcoin',
    'https://bitcoin.org/',
  ),
  btcb: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x770556F853a17893b1187A9754F17c6f57776b7c',
    8,
    'BTCB',
    'Binance-Peg Bitcoin',
    'https://bitcoin.org/',
  ),
  usdt: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x3577E5E0E3A47d9a552426638977ee3EddD4552e',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  usdc: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.centre.io/usdc',
  ),
  dai: DAI_SIMPLECHAIN,
  cake: CAKE_MAINNET,
  busd: BUSD[ChainId.SIMPLECHAIN],
}

// Export bscTokens as alias for backward compatibility
export const bscTokens = simplechainTokens
