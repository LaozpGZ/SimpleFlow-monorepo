// 简化的池子数据结构（后续可扩展）
export interface PoolToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface V3PoolInfo {
  address: string;
  token0: PoolToken;
  token1: PoolToken;
  fee: number;
  liquidity?: string;
  sqrtPriceX96?: string;
  tick?: number;
  tvlUsd?: number;
  tvlToken0?: string;
  tvlToken1?: string;
  priceToken0?: string;
  priceToken1?: string;
}

export interface V2PoolInfo {
  address: string;
  token0: PoolToken;
  token1: PoolToken;
  reserve0?: string;
  reserve1?: string;
  tvlUsd?: number;
  priceToken0?: string;
  priceToken1?: string;
}

export interface StablePoolInfo {
  address: string;
  tokens: PoolToken[];
  balances: string[];
  lpToken: PoolToken;
  tvlUsd?: number;
}

export interface PoolsResponse {
  chainId: number;
  v3Pools: V3PoolInfo[];
  v2Pools: V2PoolInfo[];
  stablePools: StablePoolInfo[];
  _cache?: {
    maxAge: number;
  };
}
