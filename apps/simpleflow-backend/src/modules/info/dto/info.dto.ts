/**
 * Info API DTO 定义
 * 与 PancakeSwap 前端 Info 页面所需的数据格式完全兼容
 */

// ============ Top Tokens Response ============

/**
 * Top Token 数据结构
 * 对应前端 GET /cached/tokens/v3/{chainName}/list/top 的响应
 */
export interface TopTokenResponse {
  /** Token 地址 */
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  /** 总交易次数 */
  totalTxCount: number;
  /** 24小时交易次数 */
  txCount24h: number;
  /** 48小时交易次数 */
  txCount48h: number;
  /** 7天交易次数 */
  txCount7d: number;
  /** 当前价格 (USD) */
  priceUSD: string;
  /** 24小时前价格 (USD) */
  priceUSD24h: string;
  /** 48小时前价格 (USD) */
  priceUSD48h: string;
  /** 7天前价格 (USD) */
  priceUSD7d: string;
  /** 总交易量 (USD) */
  totalVolumeUSD: string;
  /** 24小时交易量 (USD) */
  volumeUSD24h: string | null;
  /** 48小时交易量 (USD) */
  volumeUSD48h: string | null;
  /** 7天交易量 (USD) */
  volumeUSD7d: string | null;
  /** 总锁仓价值 (USD) */
  tvlUSD: string;
  /** 24小时前 TVL (USD) */
  tvlUSD24h: string;
  /** 48小时前 TVL (USD) */
  tvlUSD48h: string;
  /** 7天前 TVL (USD) */
  tvlUSD7d: string;
  /** 总锁仓量 (token 数量) */
  tvl: string;
  /** 24小时锁仓量 */
  tvl24h: string;
  /** 48小时锁仓量 */
  tvl48h: string;
  /** 7天锁仓量 */
  tvl7d: string;
  /** 总手续费 (USD) */
  totalFeeUSD: string;
  /** 24小时手续费 (USD) */
  feeUSD24h: string;
  /** 48小时手续费 (USD) */
  feeUSD48h: string;
  /** 7天手续费 (USD) */
  feeUSD7d: string;
}

// ============ Top Pools Response ============

/**
 * Pool Token 信息
 */
export interface PoolTokenInfo {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Top Pool 数据结构
 * 对应前端 GET /cached/pools/v3/{chainName}/list/top 的响应
 */
export interface TopPoolResponse {
  /** Pool 地址 */
  id: string;
  token0: PoolTokenInfo;
  token1: PoolTokenInfo;
  /** 总交易量 (USD) */
  totalVolumeUSD: string;
  /** Token0 相对 Token1 的价格 */
  token0Price: string;
  /** Token1 相对 Token0 的价格 */
  token1Price: string;
  /** Token0 锁仓量 */
  tvlToken0: string;
  /** Token1 锁仓量 */
  tvlToken1: string;
  /** 24小时交易量 (USD) */
  volumeUSD24h: string;
  /** 48小时交易量 (USD) */
  volumeUSD48h: string;
  /** 7天交易量 (USD) */
  volumeUSD7d: string;
  /** 总锁仓价值 (USD) */
  tvlUSD: string;
  /** 24小时前 TVL (USD) */
  tvlUSD24h: string;
  /** 48小时前 TVL (USD) */
  tvlUSD48h: string;
  /** 7天前 TVL (USD) */
  tvlUSD7d: string;
  /** Pool 创建时间戳 */
  createdAtTimestamp: string;
  /** 手续费等级 (100, 500, 2500, 10000) */
  feeTier: number;
  /** 当前流动性 */
  liquidity: string;
  /** sqrtPriceX96 */
  sqrtPrice: string;
  /** 当前 tick */
  tick: number | null;
  /** 总手续费 (USD) */
  totalFeeUSD: string;
  /** 24小时手续费 (USD) */
  feeUSD24h: string;
  /** 48小时手续费 (USD) */
  feeUSD48h: string;
  /** 7天手续费 (USD) */
  feeUSD7d: string;
}

// ============ Token Detail Response ============

/**
 * Token 详情数据结构
 * 对应前端 GET /cached/tokens/v3/{chainName}/{address} 的响应
 */
export interface TokenDetailResponse {
  /** Token 地址 */
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  /** 总交易次数 */
  totalTxCount: number;
  /** 24小时交易次数 */
  txCount24h: number;
  /** 48小时交易次数 */
  txCount48h: number;
  /** 7天交易次数 */
  txCount7d: number;
  /** 当前价格 (USD) */
  priceUSD: string;
  /** 24小时前价格 (USD) */
  priceUSD24h: string;
  /** 48小时前价格 (USD) */
  priceUSD48h: string;
  /** 7天前价格 (USD) */
  priceUSD7d: string;
  /** 总交易量 (USD) */
  totalVolumeUSD: string;
  /** 24小时交易量 (USD) */
  volumeUSD24h: string | null;
  /** 48小时交易量 (USD) */
  volumeUSD48h: string | null;
  /** 7天交易量 (USD) */
  volumeUSD7d: string | null;
  /** 总锁仓价值 (USD) */
  tvlUSD: string;
  /** 24小时前 TVL (USD) */
  tvlUSD24h: string;
  /** 48小时前 TVL (USD) */
  tvlUSD48h: string;
  /** 7天前 TVL (USD) */
  tvlUSD7d: string;
  /** 总锁仓量 (token 数量) */
  tvl: string;
  /** 24小时锁仓量 */
  tvl24h: string;
  /** 48小时锁仓量 */
  tvl48h: string;
  /** 7天锁仓量 */
  tvl7d: string;
  /** 总手续费 (USD) */
  totalFeeUSD: string;
  /** 24小时手续费 (USD) */
  feeUSD24h: string;
  /** 48小时手续费 (USD) */
  feeUSD48h: string;
  /** 7天手续费 (USD) */
  feeUSD7d: string;
  /** 关联的池子列表 */
  pools?: TokenDetailPool[];
}

/**
 * Token 详情中的 Pool 信息
 */
export interface TokenDetailPool {
  id: string;
  token0: PoolTokenInfo;
  token1: PoolTokenInfo;
  feeTier: number;
  tvlUSD: string;
  totalVolumeUSD: string;
  tvlToken0: string;
  tvlToken1: string;
}

// ============ Pool Detail Response ============

/**
 * Pool 详情数据结构
 * 对应前端 GET /cached/pools/v3/{chainName}/{address} 的响应
 */
export interface PoolDetailResponse {
  /** Pool 地址 */
  id: string;
  token0: PoolTokenInfo;
  token1: PoolTokenInfo;
  /** 总交易量 (USD) */
  totalVolumeUSD: string;
  /** Token0 相对 Token1 的价格 */
  token0Price: string;
  /** Token1 相对 Token0 的价格 */
  token1Price: string;
  /** Token0 锁仓量 */
  tvlToken0: string;
  /** Token1 锁仓量 */
  tvlToken1: string;
  /** 24小时交易量 (USD) */
  volumeUSD24h: string;
  /** 48小时交易量 (USD) */
  volumeUSD48h: string;
  /** 7天交易量 (USD) */
  volumeUSD7d: string;
  /** 总锁仓价值 (USD) */
  tvlUSD: string;
  /** 24小时前 TVL (USD) */
  tvlUSD24h: string;
  /** 48小时前 TVL (USD) */
  tvlUSD48h: string;
  /** 7天前 TVL (USD) */
  tvlUSD7d: string;
  /** Pool 创建时间戳 */
  createdAtTimestamp: string;
  /** 手续费等级 */
  feeTier: number;
  /** 当前流动性 */
  liquidity: string;
  /** sqrtPriceX96 */
  sqrtPrice: string;
  /** 当前 tick */
  tick: number | null;
  /** 总手续费 (USD) */
  totalFeeUSD: string;
  /** 24小时手续费 (USD) */
  feeUSD24h: string;
  /** 48小时手续费 (USD) */
  feeUSD48h: string;
  /** 7天手续费 (USD) */
  feeUSD7d: string;
}

// ============ Chart Data Response ============

/**
 * 图表数据点
 */
export interface ChartDataPoint {
  /** 时间戳 (秒) */
  date: number;
  /** 交易量 (USD) */
  volumeUSD: number;
  /** 锁仓价值 (USD) */
  tvlUSD: number;
}

/**
 * Token 图表数据响应
 */
export interface TokenChartResponse {
  data: ChartDataPoint[];
}

// ============ Protocol Stats Response ============

/**
 * 协议统计数据
 * 对应前端 GET /cached/protocol/{protocol}/{chainName}/stats
 */
export interface ProtocolStatsResponse {
  /** 总锁仓价值 (USD) */
  tvlUSD: string;
  /** 总交易量 (USD) */
  totalVolumeUSD: string;
  /** 总协议手续费 (USD) */
  totalProtocolFeeUSD: string;
  /** 24小时协议手续费 (USD) */
  totalProtocolFeeUSD24h: string;
  /** 48小时协议手续费 (USD) */
  totalProtocolFeeUSD48h: string;
  /** 30天协议手续费 (USD) */
  totalProtocolFeeUSD30d: string;
  /** 总交易次数 */
  totalTxCount: number;
  /** 总手续费 (USD) */
  totalFeeUSD: string;
  /** 24小时手续费 (USD) */
  totalFeeUSD24h: string;
  /** 48小时手续费 (USD) */
  totalFeeUSD48h: string;
  /** 30天手续费 (USD) */
  totalFeeUSD30d: string;
  /** 24小时 TVL (USD) */
  tvlUSD24h: string;
  /** 48小时 TVL (USD) */
  tvlUSD48h: string;
  /** 30天 TVL (USD) */
  tvlUSD30d: string;
  /** 24小时交易量 (USD) */
  volumeUSD24h: string;
  /** 48小时交易量 (USD) */
  volumeUSD48h: string;
  /** 30天交易量 (USD) */
  volumeUSD30d: string;
  /** 24小时交易次数 */
  txCount24h: number;
  /** 48小时交易次数 */
  txCount48h: number;
  /** 30天交易次数 */
  txCount30d: number;
}

// ============ Search Response ============

/**
 * 搜索结果响应
 */
export interface SearchResponse {
  tokens: SearchToken[];
  pools: SearchPool[];
}

export interface SearchToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  priceUSD: string;
  totalVolumeUSD: string;
  tvlUSD: string;
  tvl: string;
  totalTxCount: number;
}

export interface SearchPool {
  id: string;
  token0: PoolTokenInfo;
  token1: PoolTokenInfo;
  feeTier: number;
  tvlUSD: string;
  totalVolumeUSD: string;
  tvlToken0: string;
  tvlToken1: string;
}

// ============ Common Response Wrapper ============

/**
 * 带缓存的响应包装
 */
export interface CachedResponse<T> {
  data: T;
  _cache?: {
    maxAge: number;
  };
}
