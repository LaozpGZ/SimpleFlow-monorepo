import { WETH9, ERC20Token } from '@pancakeswap/sdk'
import { ChainId } from '@pancakeswap/chains'
import { USDC, CAKE } from './common'

export const lineaTestnetTokens = {
  weth: WETH9[ChainId.LINEA_TESTNET],
  usdc: USDC[ChainId.LINEA_TESTNET],
  cake: CAKE[ChainId.LINEA_TESTNET],
  usdt: new ERC20Token(ChainId.LINEA_TESTNET, '0x3577E5E0E3A47d9a552426638977ee3EddD4552e', 6, 'USDT', 'Tether USD'),
  wbtc: new ERC20Token(ChainId.LINEA_TESTNET, '0x770556F853a17893b1187A9754F17c6f57776b7c', 8, 'WBTC', 'Wrapped BTC'),
  mockA: new ERC20Token(ChainId.BASE_TESTNET, '0x6cc56b20bf8C4FfD58050D15AbA2978A745CC691', 18, 'A', 'Mock A'),
}
