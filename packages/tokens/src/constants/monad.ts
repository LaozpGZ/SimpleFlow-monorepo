import { ChainId } from '@pancakeswap/chains'
import { ERC20Token } from '@pancakeswap/sdk'

// SimpleChain Mainnet Tokens (复用 MONAD_MAINNET ChainId，指向 SimpleChain Testnet)
export const monadTokens = {
  // 原生代币 Wrapped SRW
  wsrw: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
    'https://simplechain.com/',
  ),
  // 作为 wmon 的别名，兼容旧代码
  wmon: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
    'https://simplechain.com/',
  ),
  // 作为 weth 的别名，兼容旧代码
  weth: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
    'https://simplechain.com/',
  ),
  usdt: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x3577E5E0E3A47d9a552426638977ee3EddD4552e',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  usdc: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.circle.com/',
  ),
  wbtc: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x770556F853a17893b1187A9754F17c6f57776b7c',
    8,
    'WBTC',
    'Wrapped Bitcoin',
    'https://wbtc.network/',
  ),
  dai: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0xA16171a7dadfb86afC934eaF16daCD86cD435120',
    18,
    'DAI',
    'Dai Stablecoin',
    'https://makerdao.com/',
  ),
  // 兼容旧代码的 busd alias (指向 usdc)
  busd: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.circle.com/',
  ),
  // 兼容旧代码的 ausd alias
  ausd: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
    'https://www.circle.com/',
  ),
  // 兼容旧代码的 usdt0 alias
  usdt0: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x3577E5E0E3A47d9a552426638977ee3EddD4552e',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
}
