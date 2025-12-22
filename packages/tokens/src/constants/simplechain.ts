import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'
import { SDX, USDC, USDT } from './common'

export const WSRW_SIMPLECHAIN = new ERC20Token(
  ChainId.SIMPLECHAIN,
  '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
  18,
  'WSRW',
  'Wrapped SRW',
  '',
)

export const WBTC_SIMPLECHAIN = new ERC20Token(
  ChainId.SIMPLECHAIN,
  '0x770556F853a17893b1187A9754F17c6f57776b7c',
  8,
  'WBTC',
  'Wrapped BTC',
  'https://bitcoin.org/',
)

export const DAI_SIMPLECHAIN = new ERC20Token(
  ChainId.SIMPLECHAIN,
  '0xA16171a7dadfb86afC934eaF16daCD86cD435120',
  18,
  'DAI',
  'Dai Stablecoin',
  'https://makerdao.com',
)

export const WSOL_SIMPLECHAIN = new ERC20Token(
  ChainId.SIMPLECHAIN,
  '0xbB0543b26A291648D67B91a8A0f150f6122FEd03',
  18,
  'WSOL',
  'Wrapped Solana',
  'https://solana.com',
)

export const simplechainTokens = {
  weth: WETH9[ChainId.SIMPLECHAIN],
  usdc: USDC[ChainId.SIMPLECHAIN],
  usdt: USDT[ChainId.SIMPLECHAIN],
  sdx: SDX,
  wsrw: WSRW_SIMPLECHAIN,
  wbtc: WBTC_SIMPLECHAIN,
  dai: DAI_SIMPLECHAIN,
  wsol: WSOL_SIMPLECHAIN,
}
