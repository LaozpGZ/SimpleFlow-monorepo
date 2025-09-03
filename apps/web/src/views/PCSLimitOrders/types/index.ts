import { Address } from 'viem'

export interface SupportedPoolListItem {
  chainId: number
  poolId: string
  currency0: Address
  currency1: Address
}
