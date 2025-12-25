/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-await-in-loop */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChainId } from '@pancakeswap/chains';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';
import {
  V3PoolInfo,
  V2PoolInfo,
  StablePoolInfo,
  PoolsResponse,
} from './dto/pool-response.dto';

// V3 池子 ABI - 只包含需要的函数
const V3_POOL_ABI = [
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
      { internalType: 'int24', name: 'tick', type: 'int24' },
      { internalType: 'uint16', name: 'observationIndex', type: 'uint16' },
      {
        internalType: 'uint16',
        name: 'observationCardinality',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'observationCardinalityNext',
        type: 'uint16',
      },
      { internalType: 'uint32', name: 'feeProtocol', type: 'uint32' },
      { internalType: 'bool', name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// V2 池子 ABI
const V2_PAIR_ABI = [
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { internalType: 'uint112', name: 'reserve0', type: 'uint112' },
      { internalType: 'uint112', name: 'reserve1', type: 'uint112' },
      { internalType: 'uint32', name: 'blockTimestampLast', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// 链上池子数据类型
interface V3PoolOnChainData {
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
}

interface V2PoolOnChainData {
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
}

// Farms 配置文件中的池子类型
interface FarmPoolConfig {
  pid: number;
  chainId: number;
  protocol: string;
  token0: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    isNative: boolean;
  };
  token1: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    isNative: boolean;
  };
  feeAmount: number;
  lpAddress: string;
  poolId?: string;
}

@Injectable()
export class PoolsService implements OnModuleInit {
  private readonly logger = new Logger(PoolsService.name);

  // 支持的链列表
  private readonly supportedChains = [
    ChainId.ETHEREUM,
    ChainId.BSC,
    ChainId.BSC_TESTNET,
    ChainId.ARBITRUM_ONE,
    ChainId.OPBNB,
    ChainId.BASE,
    ChainId.LINEA,
    ChainId.SIMPLECHAIN,
    ChainId.ZKSYNC,
  ];

  // 缓存 farms 配置数据
  private farmsConfig: Map<number, FarmPoolConfig[]> = new Map();

  constructor(
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  onModuleInit() {
    this.logger.log(
      `PoolsService initialized for ${this.supportedChains.length} chains`,
    );
    // 预加载 farms 配置
    this.loadFarmsConfig();
  }

  /**
   * 从 @pancakeswap/farms 包加载配置
   */
  private loadFarmsConfig() {
    // 尝试从构建后的 farms 包读取配置
    const configPaths = [
      join(process.cwd(), '../../packages/farms/lists/56.json'),
      join(process.cwd(), '../../packages/farms/dist/lists/56.json'),
    ];

    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          const data = JSON.parse(
            readFileSync(configPath, 'utf-8'),
          ) as FarmPoolConfig[];
          this.farmsConfig.set(ChainId.BSC, data);
          this.logger.log(`Loaded ${data.length} pools from farms config`);
          return;
        } catch (e) {
          // 继续尝试下一个路径
        }
      }
    }
    this.logger.warn('Could not load farms config, pools will be empty');
  }

  /**
   * 检查链是否支持
   */
  isChainSupported(chainId: number): boolean {
    return this.supportedChains.includes(chainId as ChainId);
  }

  /**
   * 获取指定链的所有池子数据
   * @param chainId 链 ID
   * @param options 选项
   * @param options.enrich 是否从链上获取详细数据（liquidity, reserves 等），默认 false
   * @param options.limit 限制返回的池子数量，用于 enrich 模式避免请求过慢
   */
  async getPools(
    chainId: number,
    options: { enrich?: boolean; limit?: number } = {},
  ): Promise<PoolsResponse> {
    const { enrich = false, limit } = options;

    if (!this.isChainSupported(chainId)) {
      return this.emptyResponse(chainId);
    }

    const cacheKey = `pools:${chainId}:${enrich ? 'enriched' : 'basic'}`;
    const cached = await this.cacheService.get<PoolsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // 从 farms 配置获取池子数据
    const pools = this.farmsConfig.get(chainId as ChainId) || [];

    // 分类池子
    const v3Pools: V3PoolInfo[] = [];
    const v2Pools: V2PoolInfo[] = [];

    const poolsToProcess = limit ? pools.slice(0, limit) : pools;

    for (const pool of poolsToProcess) {
      // 根据协议分类
      if (pool.protocol === 'v3' || pool.protocol.startsWith('infinity')) {
        v3Pools.push({
          address: pool.lpAddress || pool.poolId || '',
          token0: {
            address: pool.token0.address || 'native',
            symbol: pool.token0.symbol,
            name: pool.token0.name,
            decimals: pool.token0.decimals,
          },
          token1: {
            address: pool.token1.address || 'native',
            symbol: pool.token1.symbol,
            name: pool.token1.name,
            decimals: pool.token1.decimals,
          },
          fee: pool.feeAmount,
          tvlUsd: 0, // TODO: 需要代币价格来计算
        });
      } else if (pool.protocol === 'v2') {
        v2Pools.push({
          address: pool.lpAddress || '',
          token0: {
            address: pool.token0.address || 'native',
            symbol: pool.token0.symbol,
            name: pool.token0.name,
            decimals: pool.token0.decimals,
          },
          token1: {
            address: pool.token1.address || 'native',
            symbol: pool.token1.symbol,
            name: pool.token1.name,
            decimals: pool.token1.decimals,
          },
          tvlUsd: 0, // TODO: 需要代币价格来计算
        });
      }
    }

    // 如果需要链上数据，进行批量获取
    let enrichedV3Pools = v3Pools;
    let enrichedV2Pools = v2Pools;

    if (enrich) {
      // 只对真正的 V3 池子进行 enrich（Infinity 池子地址不是合约地址）
      const realV3Pools = v3Pools.filter((p) => p.address.length === 42);
      const infinityPools = v3Pools.filter((p) => p.address.length !== 42);

      this.logger.log(
        `Enriching ${realV3Pools.length} V3 pools and ${v2Pools.length} V2 pools with on-chain data (${infinityPools.length} Infinity pools skipped)...`,
      );

      // 限制并发，避免 RPC 限流
      const enrichLimit = limit || realV3Pools.length;
      const poolsToEnrich = realV3Pools.slice(0, enrichLimit);

      const enrichedRealV3 = await this.batchEnrichPools(
        poolsToEnrich,
        chainId,
        this.enrichV3PoolWithOnChainData.bind(this),
        10, // 每批 10 个
      );

      // 合并结果：未处理的 V3 + 已处理的 V3 + Infinity 池子
      enrichedV3Pools = [
        ...enrichedRealV3,
        ...realV3Pools.slice(enrichLimit),
        ...infinityPools,
      ];

      const v2EnrichLimit = limit || v2Pools.length;
      const v2PoolsToEnrich = v2Pools.slice(0, v2EnrichLimit);
      enrichedV2Pools = [...v2PoolsToEnrich, ...v2Pools.slice(v2EnrichLimit)];

      enrichedV2Pools = await this.batchEnrichPools(
        enrichedV2Pools,
        chainId,
        this.enrichV2PoolWithOnChainData.bind(this),
        10,
      );

      this.logger.log(`Enriched pools complete`);
    }

    const response: PoolsResponse = {
      chainId,
      v3Pools: enrichedV3Pools,
      v2Pools: enrichedV2Pools,
      stablePools: [], // 暂不支持
      _cache: {
        maxAge: enrich ? 60 : 600, // 链上数据缓存时间短一点
      },
    };

    // 缓存结果
    await this.cacheService.set(cacheKey, response, enrich ? 60 : 600);

    return response;
  }

  /**
   * 获取 V3 池子
   */
  async getV3Pools(chainId: number): Promise<V3PoolInfo[]> {
    const pools = await this.getPools(chainId);
    return pools.v3Pools;
  }

  /**
   * 获取 V2 池子
   */
  async getV2Pools(chainId: number): Promise<V2PoolInfo[]> {
    const pools = await this.getPools(chainId);
    return pools.v2Pools;
  }

  /**
   * 获取 Stable 池子
   */

  async getStablePools(_chainId: number): Promise<StablePoolInfo[]> {
    // 暂不支持 Stable 池子
    return [];
  }

  /**
   * 获取单个池子详情
   */
  async getPoolDetail(
    chainId: number,
    address: string,
  ): Promise<V3PoolInfo | V2PoolInfo | StablePoolInfo | null> {
    const pools = await this.getPools(chainId);

    // 在 V3 池子中查找
    const v3Pool = pools.v3Pools.find(
      (p) => p.address.toLowerCase() === address.toLowerCase(),
    );
    if (v3Pool) return v3Pool;

    // 在 V2 池子中查找
    const v2Pool = pools.v2Pools.find(
      (p) => p.address.toLowerCase() === address.toLowerCase(),
    );
    if (v2Pool) return v2Pool;

    // 在 Stable 池子中查找
    const stablePool = pools.stablePools.find(
      (p) => p.address.toLowerCase() === address.toLowerCase(),
    );
    if (stablePool) return stablePool;

    return null;
  }

  /**
   * 从链上获取 V3 池子数据
   * 注意：Infinity 池子使用 poolId（66 字符）而非合约地址，需要跳过
   */
  private async getV3PoolOnChainData(
    poolAddress: string,
    chainId: number,
  ): Promise<V3PoolOnChainData | null> {
    try {
      // 跳过 Infinity 池子（地址长度不是 42 字符）
      // Infinity 池子使用 poolId (66 chars) 而非标准合约地址 (42 chars)
      if (poolAddress.length !== 42) {
        return null;
      }

      const client = this.rpcService.getClient(chainId as ChainId);
      if (!client) {
        return null;
      }

      // 批量读取 slot0 和 liquidity
      const [slot0, liquidity] = await Promise.all([
        client.readContract({
          address: poolAddress as `0x${string}`,
          abi: V3_POOL_ABI,
          functionName: 'slot0',
        }),
        client.readContract({
          address: poolAddress as `0x${string}`,
          abi: V3_POOL_ABI,
          functionName: 'liquidity',
        }),
      ]);

      return {
        sqrtPriceX96: slot0[0] as bigint,
        tick: slot0[1] as number,
        liquidity: liquidity as bigint,
      };
    } catch (error) {
      this.logger.debug(
        `Failed to fetch V3 pool data for ${poolAddress}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  /**
   * 从链上获取 V2 池子数据
   */
  private async getV2PoolOnChainData(
    pairAddress: string,
    chainId: number,
  ): Promise<V2PoolOnChainData | null> {
    try {
      const client = this.rpcService.getClient(chainId as ChainId);
      if (!client) {
        return null;
      }

      // 批量读取 reserves 和 totalSupply
      const [reserves, totalSupply] = await Promise.all([
        client.readContract({
          address: pairAddress as `0x${string}`,
          abi: V2_PAIR_ABI,
          functionName: 'getReserves',
        }),
        client.readContract({
          address: pairAddress as `0x${string}`,
          abi: V2_PAIR_ABI,
          functionName: 'totalSupply',
        }),
      ]);

      return {
        reserve0: reserves[0] as bigint,
        reserve1: reserves[1] as bigint,
        totalSupply: totalSupply as bigint,
      };
    } catch (error) {
      this.logger.debug(
        `Failed to fetch V2 pool data for ${pairAddress}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  /**
   * 计算 V3 池子的 TVL（简化版，只返回原始数据，USD 价格需要后续添加）
   */
  private async enrichV3PoolWithOnChainData(
    pool: V3PoolInfo,
    chainId: number,
  ): Promise<V3PoolInfo> {
    const poolAddress = pool.address.startsWith('0x')
      ? pool.address
      : `0x${pool.address}`;

    const onChainData = await this.getV3PoolOnChainData(poolAddress, chainId);
    if (!onChainData) {
      return pool;
    }

    return {
      ...pool,
      liquidity: onChainData.liquidity.toString(),
      sqrtPriceX96: onChainData.sqrtPriceX96.toString(),
      tick: onChainData.tick,
      // tvlUsd 需要代币价格，暂时保持 0
      tvlUsd: pool.tvlUsd,
    };
  }

  /**
   * 计算 V2 池子的 TVL（简化版，只返回原始数据）
   */
  private async enrichV2PoolWithOnChainData(
    pool: V2PoolInfo,
    chainId: number,
  ): Promise<V2PoolInfo> {
    const poolAddress = pool.address.startsWith('0x')
      ? pool.address
      : `0x${pool.address}`;

    const onChainData = await this.getV2PoolOnChainData(poolAddress, chainId);
    if (!onChainData) {
      return pool;
    }

    return {
      ...pool,
      reserve0: onChainData.reserve0.toString(),
      reserve1: onChainData.reserve1.toString(),
      // tvlUsd 需要代币价格，暂时保持 0
      tvlUsd: pool.tvlUsd,
    };
  }

  /**
   * 批量获取池子的链上数据（限制并发数）
   */

  private async batchEnrichPools<T extends V3PoolInfo | V2PoolInfo>(
    pools: T[],
    chainId: number,
    enrichFn: (pool: T, chainId: number) => Promise<T>,
    batchSize = 20,
  ): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < pools.length; i += batchSize) {
      const batch = pools.slice(i, i + batchSize);
      const enrichedBatch = await Promise.all(
        batch.map((pool) => enrichFn(pool, chainId)),
      );
      results.push(...enrichedBatch);

      // 添加小延迟避免请求过快
      if (i + batchSize < pools.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return results;
  }

  /**
   * 返回空响应
   */

  private emptyResponse(chainId: number): PoolsResponse {
    return {
      chainId,
      v3Pools: [],
      v2Pools: [],
      stablePools: [],
      _cache: {
        maxAge: 60, // 不支持的链缓存时间短一点
      },
    };
  }
}
