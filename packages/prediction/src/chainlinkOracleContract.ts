import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const chainlinkOracleBNB: Record<string, Address> = {
  [ChainId.BSC]: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
  [ChainId.BSC_TESTNET]: '0x',
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleCAKE: Record<string, Address> = {
  [ChainId.BSC]: '0xB6064eD41d4f67e353768aA239cA86f4F73665a1',
  [ChainId.BSC_TESTNET]: '0x',
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleETH: Record<string, Address> = {
  [ChainId.BSC]: '0x',
  [ChainId.BSC_TESTNET]: '0x267aa2A74EFbc24F4F621E81C9De97d93cA043cb', // Mock
  // [ChainId.BSC_TESTNET]: '0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7', // ETH/USD on bscTestnet
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleWBTC: Record<string, Address> = {
  [ChainId.BSC]: '0x',
  [ChainId.BSC_TESTNET]: '0x04a02840856CD13239508343CF3630579DA65420', // Mock
  // [ChainId.BSC_TESTNET]: '0x5741306c21795FdCBb9b265Ea0255F499DFe515C', // BTC/USD on bscTestnet
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>
