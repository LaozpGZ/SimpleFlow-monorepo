import { ChainId } from '@simpleflow/chains'
import { FeeAmount } from '@simpleflow/v3-sdk'
import { simplechainTestnetTokens } from '@simpleflow/tokens'
import { Protocol, UniversalFarmConfig } from '../types'

export const simplechainFarmConfig: UniversalFarmConfig[] = [
  // Add SimpleChain mainnet farm configurations here
  // This is a placeholder - actual farm configurations will be added when farms are deployed
]

export const simplechainTestnetFarmConfig: UniversalFarmConfig[] = [
  // SRW / WBTC - 0.25%
  {
    pid: 1,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000', // V3 pool address (computed from factory)
    token0: simplechainTestnetTokens.wsrw,
    token1: simplechainTestnetTokens.wbtc,
    feeAmount: FeeAmount.MEDIUM,
  },
  // SRW / USDT - 0.25%
  {
    pid: 2,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.wsrw,
    token1: simplechainTestnetTokens.usdt,
    feeAmount: FeeAmount.MEDIUM,
  },
  // SRW / USDC - 0.25%
  {
    pid: 3,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.wsrw,
    token1: simplechainTestnetTokens.usdc,
    feeAmount: FeeAmount.MEDIUM,
  },
  // SRW / USDT - 0.05%
  {
    pid: 4,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.wsrw,
    token1: simplechainTestnetTokens.usdt,
    feeAmount: FeeAmount.LOW,
  },
  // SRW / USDC - 0.05%
  {
    pid: 5,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.wsrw,
    token1: simplechainTestnetTokens.usdc,
    feeAmount: FeeAmount.LOW,
  },
  // SRW / USDT - 1%
  {
    pid: 6,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.wsrw,
    token1: simplechainTestnetTokens.usdt,
    feeAmount: FeeAmount.HIGH,
  },
  // SRW / USDC - 1%
  {
    pid: 7,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.wsrw,
    token1: simplechainTestnetTokens.usdc,
    feeAmount: FeeAmount.HIGH,
  },
  // USDT / USDC - 0.25%
  {
    pid: 8,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.usdt,
    token1: simplechainTestnetTokens.usdc,
    feeAmount: FeeAmount.MEDIUM,
  },
  // USDT / USDC - 0.05%
  {
    pid: 9,
    chainId: ChainId.SIMPLECHAIN_TESTNET,
    protocol: Protocol.V3,
    lpAddress: '0x0000000000000000000000000000000000000000',
    token0: simplechainTestnetTokens.usdt,
    token1: simplechainTestnetTokens.usdc,
    feeAmount: FeeAmount.LOW,
  },
]
