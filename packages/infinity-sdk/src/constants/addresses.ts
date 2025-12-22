import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

export const INFINITY_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET] as const

export type InfinitySupportedChains = (typeof INFINITY_SUPPORTED_CHAINS)[number]

export const INFI_VAULT_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x238a358808379702088667322f80aC48bAd5e6c4',
  [ChainId.BSC_TESTNET]: '0x2CdB3EC82EE13d341Dc6E73637BE0Eab79cb79dD',
}

export const INFI_CL_POOL_MANAGER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0xa0FfB9c1CE1Fe56963B0321B32E7A0302114058b',
  [ChainId.BSC_TESTNET]: '0x36A12c70c9Cf64f24E89ee132BF93Df2DCD199d4',
}

export const INFI_BIN_POOL_MANAGER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0xC697d2898e0D09264376196696c51D7aBbbAA4a9',
  [ChainId.BSC_TESTNET]: '0xe71d2e0230cE0765be53A8A1ee05bdACF30F296B',
}

export const INFI_CL_POSITION_MANAGER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x55f4c8abA71A1e923edC303eb4fEfF14608cC226',
  [ChainId.BSC_TESTNET]: '0x77DedB52EC6260daC4011313DBEE09616d30d122',
}

export const INFI_BIN_POSITION_MANAGER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x3D311D6283Dd8aB90bb0031835C8e606349e2850',
  [ChainId.BSC_TESTNET]: '0x68B834232da911c787bcF782CED84ec5d36909a7',
}

export const INFI_CL_QUOTER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0xd0737C9762912dD34c3271197E362Aa736Df0926',
  [ChainId.BSC_TESTNET]: '0x5d544D0ad627a72d7Fb53c22D8888663FC5d5B0d',
}

export const INFI_BIN_QUOTER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0xC631f4B0Fc2Dd68AD45f74B2942628db117dD359',
  [ChainId.BSC_TESTNET]: '0x82E7741E3DE763692785cfDB536D168B1226c4d5',
}

export const INFI_MIXED_QUOTER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x2dCbF7B985c8C5C931818e4E107bAe8aaC8dAB7C',
  [ChainId.BSC_TESTNET]: '0xdf70a0A2DADC2a01dbE165702aa6dCdf034628b0',
}

export const INFI_CL_MIGRATOR_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x',
  [ChainId.BSC_TESTNET]: '0x8637035016cbF8E38519c9A1362b1fDDcA1c1A91',
}

export const INFI_BIN_MIGRATOR_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x',
  [ChainId.BSC_TESTNET]: '0x3bA139617F8318ca7638b2470DA660653FB5F486',
}

export const INFI_CL_LP_FEES_HELPER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x4e6825d29BbeA5F29Ee7AEfA40C3EAaBB27A9733',
  [ChainId.BSC_TESTNET]: '0x54DE53BD47F35A72Dc57A7A3e1a3B6EEB83b9cB4',
}

export const INFI_FARMING_DISTRIBUTOR_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0xEA8620aAb2F07a0ae710442590D649ADE8440877',
  [ChainId.BSC_TESTNET]: '0xFBb5B0B69f89B75E18c37A8211C1f2Fa3B7D2728',
}

export const INFI_CL_PROTOCOL_FEE_CONTROLLER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0x12F2a2965A665F8aBCf955C4dA26CC4Ec437b2c8',
  [ChainId.BSC_TESTNET]: '0x5ab6c844F3c0e818b92932e55b9942B2c8a2D205',
}

export const INFI_BIN_PROTOCOL_FEE_CONTROLLER_ADDRESSES: Record<InfinitySupportedChains, Address> = {
  [ChainId.BSC]: '0xC7C41cc1F0f4BC4CA96ac860E5c724B9A265B9A8',
  [ChainId.BSC_TESTNET]: '0xB91451e44f5D1D8048F8b5c093b705D61C7893F8',
}

export const INFI_CL_TICK_LENS_ADDRESSES: { [key in ChainId]?: Address } = {
  [ChainId.BSC_TESTNET]: '0x05a732bb9A23256F57f9FdF255212979368Ece39',
  [ChainId.BSC]: '0x8BcF30285413F25032fb983C2bF4deFe29a33f3a',
}
