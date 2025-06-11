import { Cluster } from '@solana/web3.js'

export type AmmConfig = {
  index: number
  id: string
  protocolFeeRate: number
  tradeFeeRate: number
  tickSpacing: number
  fundFeeRate: number
  fundOwner: string
  description?: string
  defaultRange: number
  defaultRangePoint: number[]
}

const mainnetAmmConfigs: Record<string, AmmConfig> = {}

const devnetAmmConfigs: Record<string, AmmConfig> = {
  '5898eU3GB7uFn9eaLJNLMkjiUaHUNFcKHksLLUtEXeKV': {
    id: '5898eU3GB7uFn9eaLJNLMkjiUaHUNFcKHksLLUtEXeKV',
    index: 3,
    protocolFeeRate: 12,
    tradeFeeRate: 10000,
    tickSpacing: 200,
    fundFeeRate: 0,
    fundOwner: 'DmwXqqK5Zuj619au6q2Jx3TMr9ZV1837uxJcEwyvXVtV',
    description: 'Best for exotic pairs',
    defaultRange: 0.1,
    defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5, 0.6, 0.7, 0.8, 0.9],
  },
  AEWHer5AqGwYMLwNUmVG3jpLK5p7PBLZF7B2EPT4PfYG: {
    id: 'AEWHer5AqGwYMLwNUmVG3jpLK5p7PBLZF7B2EPT4PfYG',
    index: 2,
    protocolFeeRate: 12,
    tradeFeeRate: 3000,
    tickSpacing: 60,
    fundFeeRate: 0,
    fundOwner: 'DmwXqqK5Zuj619au6q2Jx3TMr9ZV1837uxJcEwyvXVtV',
    description: 'Best for most pairs',
    defaultRange: 0.1,
    defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
  },
  Bu65sZ3Kq7iTFDBTSsptD4LkxWCo1q5BDogZDmC7xoUT: {
    id: 'Bu65sZ3Kq7iTFDBTSsptD4LkxWCo1q5BDogZDmC7xoUT',
    index: 1,
    protocolFeeRate: 12,
    tradeFeeRate: 500,
    tickSpacing: 10,
    fundFeeRate: 0,
    fundOwner: 'DmwXqqK5Zuj619au6q2Jx3TMr9ZV1837uxJcEwyvXVtV',
    description: 'Best for stable pairs',
    defaultRange: 0.1,
    defaultRangePoint: [0.1, 0.2],
  },
}

export const ammConfigs: { [key in Cluster]?: Record<string, AmmConfig> } = {
  'mainnet-beta': mainnetAmmConfigs,
  devnet: devnetAmmConfigs,
}
