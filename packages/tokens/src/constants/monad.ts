import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'

import { BUSD, USDC, USDT } from './common'

export const monadTokens = {
  weth: WETH9[ChainId.MONAD_MAINNET],
  busd: BUSD[ChainId.MONAD_MAINNET],
  usdc: USDC[ChainId.MONAD_MAINNET],
  usdt: USDT[ChainId.MONAD_MAINNET],
  wmon: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
    18,
    'WMON',
    'Wrapped Monad',
    'https://www.monad.xyz/',
  ),
  mcake: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0xcf05Fc31A6B693DD0bEB76e958ae4BCD490dc985',
    18,
    'MCake',
    'Monad Cake',
    'https://www.monad.xyz/',
  ),
  musdt: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0xF05266b1B1759D3A2746cd3b031b802C2496b278',
    18,
    'MUSDT',
    'Mock USDT',
    'https://tether.to/',
  ),
  meth: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0xD59aaE32bcF95AAe58119751d5E355C9855cDC31',
    18,
    'METH',
    'Mock ETH',
    'https://ethereum.org',
  ),
  mbnb: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x95aaBC8387963DD589292915374AdD2920BA3cc7',
    18,
    'MBNB',
    'Mock BNB',
    'https://www.binance.org',
  ),
}
