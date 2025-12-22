import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'
import { SDX_SIMPLECHAIN_TESTNET, USDC, USDT } from './common'

export const WSRW_SIMPLECHAIN_TESTNET = new ERC20Token(
  ChainId.SIMPLECHAIN_TESTNET,
  '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
  18,
  'WSRW',
  'Wrapped SRW',
  '',
)

export const WBTC_SIMPLECHAIN_TESTNET = new ERC20Token(
  ChainId.SIMPLECHAIN_TESTNET,
  '0x770556F853a17893b1187A9754F17c6f57776b7c',
  8,
  'WBTC',
  'Wrapped BTC',
  'https://bitcoin.org/',
)

export const DAI_SIMPLECHAIN_TESTNET = new ERC20Token(
  ChainId.SIMPLECHAIN_TESTNET,
  '0xA16171a7dadfb86afC934eaF16daCD86cD435120',
  18,
  'DAI',
  'Dai Stablecoin',
  'https://makerdao.com',
)

export const WSOL_SIMPLECHAIN_TESTNET = new ERC20Token(
  ChainId.SIMPLECHAIN_TESTNET,
  '0xbB0543b26A291648D67B91a8A0f150f6122FEd03',
  18,
  'WSOL',
  'Wrapped Solana',
  'https://solana.com',
)

export const simplechainTestnetTokens = {
  weth: WETH9[ChainId.SIMPLECHAIN_TESTNET],
  usdc: USDC[ChainId.SIMPLECHAIN_TESTNET],
  usdt: USDT[ChainId.SIMPLECHAIN_TESTNET],
  sdx: SDX_SIMPLECHAIN_TESTNET,
  wsrw: WSRW_SIMPLECHAIN_TESTNET,
  wbtc: WBTC_SIMPLECHAIN_TESTNET,
  dai: DAI_SIMPLECHAIN_TESTNET,
  wsol: WSOL_SIMPLECHAIN_TESTNET,
}
