export enum ChainId {
  BSC = 56,
  BSC_TESTNET = 97,
  SIMPLECHAIN_TESTNET = 1914,
}

export enum NonEVMChainId {
  SOLANA = 900901,
  APTOS = 999999,
}

export enum SunsetChainId {}

export type UnifiedChainId = ChainId | NonEVMChainId

export const testnetChainIds = [ChainId.BSC_TESTNET, ChainId.SIMPLECHAIN_TESTNET]
