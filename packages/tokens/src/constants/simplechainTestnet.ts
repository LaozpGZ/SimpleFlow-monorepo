import { ERC20Token } from '@pancakeswap/sdk'
import { ChainId } from '@pancakeswap/chains'

export const simplechainTestnetTokens = {
  wsrw: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
    18,
    'WSRW',
    'Wrapped SRW',
  ),
  wbtc: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x770556F853a17893b1187A9754F17c6f57776b7c',
    8,
    'WBTC',
    'Wrapped Bitcoin',
  ),
  usdt: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x3577E5E0E3A47d9a552426638977ee3EddD4552e',
    6,
    'USDT',
    'Tether USD',
  ),
  usdc: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769',
    6,
    'USDC',
    'USD Coin',
  ),
  dai: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0xA16171a7dadfb86afC934eaF16daCD86cD435120',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  sdx: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75',
    18,
    'SDX',
    'SimpleDex Token',
  ),
  wsol: new ERC20Token(
    ChainId.SIMPLECHAIN_TESTNET,
    '0xbB0543b26A291648D67B91a8A0f150f6122FEd03',
    18,
    'WSOL',
    'Wrapped Solana',
  ),
}
