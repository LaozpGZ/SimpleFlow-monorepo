import { ChainId } from '@simpleflow/chains'
import { Address } from 'viem'

export const WBETH: Record<number, Address> = {
  [ChainId.ETHEREUM]: '0xa2E3356610840701BDf5611a53974510Ae27E2e1',
  [ChainId.BSC]: '0xa2E3356610840701BDf5611a53974510Ae27E2e1',
  [ChainId.BSC_TESTNET]: '0x34f8f72e3f14Ede08bbdA1A19a90B35a80f3E789',
  [ChainId.GOERLI]: '0xE7bCB9e341D546b66a46298f4893f5650a56e99E',
}

export const SNBNB: Record<number, Address> = {
  [ChainId.BSC]: '0x1adB950d8bB3dA4bE104211D5AB038628e477fE6',
}

// SimpleChain Liquid Staking - sSRW (Staked SRW)
// TODO: 部署后替换为实际合约地址
export const SSRW: Record<number, Address> = {
  [ChainId.SIMPLECHAIN]: '0x1234567890123456789012345678901234567890',
  [ChainId.SIMPLECHAIN_TESTNET]: '0x1234567890123456789012345678901234567890',
}

export const UNWRAPPED_ETH_ADDRESS: Address = '0x79973d557CD9dd87eb61E250cc2572c990e20196'
