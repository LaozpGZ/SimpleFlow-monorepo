import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

export const TICK_QUERY_HELPER_ADDRESSES: Partial<Record<ChainId, Address>> = {
  [ChainId.BSC]: '0x5BF1597ebfB079c3D47918b1B77eaE2475803D7A',
  [ChainId.BSC_TESTNET]: '0x5BF1597ebfB079c3D47918b1B77eaE2475803D7A',
  [ChainId.SIMPLECHAIN_TESTNET]: '0x5BF1597ebfB079c3D47918b1B77eaE2475803D7A',
}
