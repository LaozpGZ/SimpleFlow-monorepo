import { Token as SolanaToken } from '@pancakeswap/solana-core-sdk'

export const solanaTokens = {
  usdc: new SolanaToken({
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  }),
  usdt: new SolanaToken({
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
  }),
  wsol: new SolanaToken({
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    symbol: 'WSOL',
    name: 'Wrapped SOL',
  }),
  ray: new SolanaToken({
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6,
    symbol: 'RAY',
    name: 'Raydium',
  }),
  msol: new SolanaToken({
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    decimals: 9,
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
  }),
}
