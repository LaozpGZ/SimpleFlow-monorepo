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
  defaultRange?: number
  defaultRangePoint?: [number, number]
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
  },
  AEWHer5AqGwYMLwNUmVG3jpLK5p7PBLZF7B2EPT4PfYG: {
    id: 'AEWHer5AqGwYMLwNUmVG3jpLK5p7PBLZF7B2EPT4PfYG',
    index: 2,
    protocolFeeRate: 12,
    tradeFeeRate: 3000,
    tickSpacing: 60,
    fundFeeRate: 0,
    fundOwner: 'DmwXqqK5Zuj619au6q2Jx3TMr9ZV1837uxJcEwyvXVtV',
  },
  Bu65sZ3Kq7iTFDBTSsptD4LkxWCo1q5BDogZDmC7xoUT: {
    id: 'Bu65sZ3Kq7iTFDBTSsptD4LkxWCo1q5BDogZDmC7xoUT',
    index: 1,
    protocolFeeRate: 12,
    tradeFeeRate: 500,
    tickSpacing: 10,
    fundFeeRate: 0,
    fundOwner: 'DmwXqqK5Zuj619au6q2Jx3TMr9ZV1837uxJcEwyvXVtV',
  },
}

export const ammConfigs: { [key in Cluster]?: Record<string, AmmConfig> } = {
  'mainnet-beta': mainnetAmmConfigs,
  devnet: devnetAmmConfigs,
}
