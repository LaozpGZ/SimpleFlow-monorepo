import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'
import { USDC, USDT } from './common'

// Using SimpleChain Testnet token addresses for Linea Testnet
export const WSRW_LINEA_TESTNET = new ERC20Token(
  ChainId.LINEA_TESTNET,
  '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
  18,
  'WSRW',
  'Wrapped SRW',
  '',
)

export const WBTC_LINEA_TESTNET = new ERC20Token(
  ChainId.LINEA_TESTNET,
  '0x770556F853a17893b1187A9754F17c6f57776b7c',
  8,
  'WBTC',
  'Wrapped BTC',
  'https://bitcoin.org/',
)

export const DAI_LINEA_TESTNET = new ERC20Token(
  ChainId.LINEA_TESTNET,
  '0xA16171a7dadfb86afC934eaF16daCD86cD435120',
  18,
  'DAI',
  'Dai Stablecoin',
  'https://makerdao.com',
)

export const WSOL_LINEA_TESTNET = new ERC20Token(
  ChainId.LINEA_TESTNET,
  '0xbB0543b26A291648D67B91a8A0f150f6122FEd03',
  18,
  'WSOL',
  'Wrapped Solana',
  'https://solana.com',
)

export const SDX_LINEA_TESTNET = new ERC20Token(
  ChainId.LINEA_TESTNET,
  '0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75',
  18,
  'SDX',
  'SimpleDex Token',
  'https://www.simpleflow.finance/',
)

export const lineaTestnetTokens = {
  weth: WETH9[ChainId.LINEA_TESTNET],
  usdc: USDC[ChainId.LINEA_TESTNET],
  usdt: USDT[ChainId.LINEA_TESTNET],
  sdx: SDX_LINEA_TESTNET,
  wsrw: WSRW_LINEA_TESTNET,
  wbtc: WBTC_LINEA_TESTNET,
  dai: DAI_LINEA_TESTNET,
  wsol: WSOL_LINEA_TESTNET,
}
