import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

export type Addresses = {
  [chainId in ChainId]?: Address
}

export const bCakeFarmBoosterV3Address: Addresses = {
  [ChainId.BSC]: '0x695170faE243147b3bEB4C43AA8DE5DcD9202752',
  [ChainId.BSC_TESTNET]: '0x56666300A1E25624489b661f3C6c456c159a109a',
}
export const bCakeFarmBoosterV3VeCakeAddress: Addresses = {
  [ChainId.BSC]: '0x625F45234D6335859a8b940960067E89476300c6',
  [ChainId.BSC_TESTNET]: '0x1F32591CC45f00BaE3A742Bf2bCAdAe59DbAd228',
}

export const bCakeFarmWrapperBoosterVeCakeAddress: Addresses = {
  [ChainId.BSC]: '0x5dbC7e443cCaD0bFB15a081F1A5C6BA0caB5b1E6',
}
