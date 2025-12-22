import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

export const MULTICALL_ADDRESS: { [key in ChainId]?: Address } = {
  [ChainId.BSC]: '0x39eecaE833c944ebb94942Fa44CaE46e87a8Da17',
  [ChainId.BSC_TESTNET]: '0xeeF6ff30cF5D5b8aBA0DE16A01d17A0697a275b5',
  [ChainId.SIMPLECHAIN_TESTNET]: '0xC005b39086AF12248eA2507C22b0e38f0463a79b',
}

export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

export const MULTICALL3_ADDRESSES: {
  [key in ChainId]?: Address
} = {
  [ChainId.BSC]: MULTICALL3_ADDRESS,
  [ChainId.BSC_TESTNET]: MULTICALL3_ADDRESS,
  [ChainId.SIMPLECHAIN_TESTNET]: MULTICALL3_ADDRESS,
}
