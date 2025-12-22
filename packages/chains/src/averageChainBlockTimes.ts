import { ChainId } from './chainId'

export const AVERAGE_CHAIN_BLOCK_TIMES: Record<ChainId, number> = {
  [ChainId.BSC]: 0.75,
  [ChainId.BSC_TESTNET]: 0.75,
  [ChainId.SIMPLECHAIN_TESTNET]: 3,
}
