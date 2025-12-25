/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/**
 * PoolsService - 池子数据服务
 *
 * 数据获取策略（参考 PancakeSwap Smart-Router）：
 * 1. V3池子：TVL API + 链上数据 (Primary) -> Subgraph (Fallback)
 * 2. V2池子：链上数据 (Primary) -> Subgraph (Fallback)
 * 3. Stable池子：PancakeSwap SDK API
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChainId } from '@pancakeswap/chains';
import { GraphQLClient } from 'graphql-request';
import { getStableSwapPools } from '@pancakeswap/stable-swap-sdk';
import { pancakeV3PoolABI } from '@pancakeswap/v3-sdk';
import { getAddress, createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';

/**
 * 池子数据接口
 */
export interface SwapPool {
  address: string;
  token0: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  reserve0?: string;
  reserve1?: string;
  liquidity?: string;
  sqrtPriceX96?: string;
  tick?: number;
  fee?: number;
  tvlUsd?: string;
  poolType: 'v2' | 'v3' | 'stable';
}

/**
 * TVL API 返回的池子引用
 */
interface V3PoolTvlReference {
  address: string;
  tvlUSD: string;
}

/**
 * V3 Subgraph 查询
 */
const queryAllV3Pools = `
  query getPools($pageSize: Int!, $id: String) {
    pools(first: $pageSize, where: { id_gt: $id }) {
      id
      tick
      token0 {
        symbol
        id
        decimals
      }
      token1 {
        symbol
        id
        decimals
      }
      sqrtPrice
      feeTier
      liquidity
      totalValueLockedUSD
    }
  }
`;

/**
 * 支持的链列表
 */
const SUPPORTED_CHAINS = [
  ChainId.BSC,
  ChainId.BSC_TESTNET,
  ChainId.ETHEREUM,
  ChainId.ARBITRUM_ONE,
  ChainId.OPBNB,
  ChainId.BASE,
  ChainId.LINEA,
  ChainId.ZKSYNC,
  ChainId.SIMPLECHAIN,
  ChainId.SIMPLECHAIN_TESTNET,
];

/**
 * PancakeSwap TVL API URL 模板
 */
const TVL_API_URL = (chainId: number) =>
  `https://routing-api.pancakeswap.com/v0/v3-pools-tvl/${chainId}`;

/**
 * V3 Subgraph URL 配置
 */
function getV3SubgraphUrl(chainId: number): string | null {
  const subgraphs: Record<number, string> = {
    [ChainId.ETHEREUM]:
      'https://api.thegraph.com/subgraphs/id/CJYGNhb7RvnhfBDjqpRnD3oxgyhibzc7fkAMa38YV3oS',
    [ChainId.BSC]:
      'https://api.thegraph.com/subgraphs/id/Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ',
    [ChainId.BSC_TESTNET]:
      'https://api.thegraph.com/subgraphs/id/7xd5KmL3FbzRYbmAM9SSe4wdrsJV71pJQhCBqzU7y8Qi',
    [ChainId.ARBITRUM_ONE]:
      'https://api.thegraph.com/subgraphs/id/251MHFNN1rwjErXD2efWMpNS73SANZN8Ua192zw6iXve',
    [ChainId.ZKSYNC]:
      'https://api.thegraph.com/subgraphs/id/3dKr3tYxTuwiRLkU9vPj3MvZeUmeuGgWURbFC72ZBpYY',
    [ChainId.LINEA]:
      'https://api.thegraph.com/subgraphs/id/6gCTVX98K3A9Hf9zjvgEKwjz7rtD4C1V173RYEdbeMFX',
    [ChainId.BASE]:
      'https://api.thegraph.com/subgraphs/id/5YYKGBcRkJs6tmDfB3RpHdbK2R5KBACHQebXVgbUcYQp',
    [ChainId.OPBNB]:
      'https://api.studio.thegraph.com/query/46533/exchange-v3-opbnb/version/latest',
  };
  return subgraphs[chainId] || null;
}

/**
 * 链配置 - 用于 viem public client
 */
function getChainConfig(chainId: number) {
  const configs: Record<number, ReturnType<typeof defineChain>> = {
    [ChainId.BSC]: defineChain({
      id: 56,
      name: 'BNB Smart Chain',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://bsc-dataseed1.binance.org'] },
      },
    }),
    [ChainId.ETHEREUM]: defineChain({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://eth.llamarpc.com'] },
      },
    }),
    // 其他链可以按需添加
  };
  return configs[chainId] || null;
}

/**
 * 池子数据缓存
 */
interface PoolsCache {
  v2: SwapPool[];
  v3: SwapPool[];
  stable: SwapPool[];
}

@Injectable()
export class PoolsService implements OnModuleInit {
  private readonly logger = new Logger(PoolsService.name);
  private poolsCache: Map<number, PoolsCache> = new Map();
  private viemClients: Map<number, ReturnType<typeof createPublicClient>> =
    new Map();

  constructor(
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      `PoolsService initialized for ${SUPPORTED_CHAINS.length} chains`,
    );
    // 初始化 BSC 的 viem client
    this.initViemClient(ChainId.BSC);
  }

  /**
   * 初始化 viem client
   */
  private initViemClient(chainId: number) {
    const chainConfig = getChainConfig(chainId);
    if (!chainConfig) {
      this.logger.warn(`No chain config for chainId: ${chainId}`);
      return;
    }

    const client = createPublicClient({
      chain: chainConfig,
      transport: http(),
    });

    this.viemClients.set(chainId, client);
    this.logger.log(`Initialized viem client for chain ${chainId}`);
  }

  /**
   * 获取 viem client
   */
  private getViemClient(chainId: number) {
    let client = this.viemClients.get(chainId);
    if (!client) {
      this.initViemClient(chainId);
      client = this.viemClients.get(chainId);
    }
    return client;
  }

  /**
   * 创建 GraphQL 客户端
   */
  private createGraphqlClient(url: string): GraphQLClient {
    return new GraphQLClient(url, {
      fetch: (url, options) =>
        fetch(url as string, {
          ...options,
          signal: AbortSignal.timeout(10000),
        }),
    });
  }

  /**
   * 检查链是否支持
   */
  isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAINS.includes(chainId as ChainId);
  }

  /**
   * 获取支持的链列表
   */
  getSupportedChains(): number[] {
    return [...SUPPORTED_CHAINS];
  }

  /**
   * 获取指定链的所有池子数据
   */
  async getPools(
    chainId: number,
    options: { limit?: number } = {},
  ): Promise<{
    chainId: number;
    pools: SwapPool[];
  }> {
    const { limit } = options;

    if (!this.isChainSupported(chainId)) {
      return { chainId, pools: [] };
    }

    const cacheKey = `pools:swap:${chainId}`;
    const cached = await this.cacheService.get<{ pools: SwapPool[] }>(cacheKey);
    if (cached) {
      return {
        chainId,
        pools: limit ? cached.pools.slice(0, limit) : cached.pools,
      };
    }

    // 并行获取所有类型的池子
    const [v3Pools, v2Pools, stablePools] = await Promise.all([
      this.getV3Pools(chainId),
      this.getV2Pools(chainId),
      this.getStablePools(chainId),
    ]);

    const allPools = [...v3Pools, ...v2Pools, ...stablePools];

    const response = {
      chainId,
      pools: allPools,
    };

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  /**
   * 获取 V3 池子 - TVL API + 链上数据 (Primary) -> Subgraph (Fallback)
   */
  async getV3Pools(chainId: number, limit = 100): Promise<SwapPool[]> {
    if (!this.isChainSupported(chainId)) {
      return [];
    }

    const cacheKey = `pools:v3:${chainId}`;
    const cached = await this.cacheService.get<SwapPool[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 尝试从 TVL API + 链上获取
    try {
      const pools = await this.getV3PoolsFromOnChain(chainId, limit);
      if (pools.length > 0) {
        this.logger.log(
          `Fetched ${pools.length} V3 pools from on-chain for chain ${chainId}`,
        );
        await this.cacheService.set(cacheKey, pools, 300);
        return pools;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to fetch V3 pools from on-chain, trying subgraph`,
        error,
      );
    }

    // Fallback: 尝试从 Subgraph 获取
    try {
      const pools = await this.getV3PoolsFromSubgraph(chainId, limit);
      if (pools.length > 0) {
        this.logger.log(
          `Fetched ${pools.length} V3 pools from subgraph for chain ${chainId}`,
        );
        await this.cacheService.set(cacheKey, pools, 300);
        return pools;
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch V3 pools from subgraph for chain ${chainId}`,
        error,
      );
    }

    return [];
  }

  /**
   * 从 TVL API + 链上获取 V3 池子
   */
  private async getV3PoolsFromOnChain(
    chainId: number,
    limit: number,
  ): Promise<SwapPool[]> {
    // 1. 获取 TVL API 数据
    const tvlResponse = await fetch(TVL_API_URL(chainId));
    if (!tvlResponse.ok) {
      throw new Error(`TVL API returned ${tvlResponse.status}`);
    }

    const tvlRefs: V3PoolTvlReference[] = await tvlResponse.json();
    this.logger.debug(
      `Got ${tvlRefs.length} pools from TVL API for chain ${chainId}`,
    );

    // 2. 按 TVL 排序，取前 N 个
    const sortedPools = tvlRefs
      .sort((a, b) => parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD))
      .slice(0, limit);

    // 3. 从链上获取池子详细数据
    const client = this.getViemClient(chainId);
    if (!client) {
      throw new Error(`No viem client for chain ${chainId}`);
    }

    const pools: SwapPool[] = [];

    // 批量获取池子数据（每批10个，避免超时）
    const batchSize = 10;
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < sortedPools.length; i += batchSize) {
      const batch = sortedPools.slice(i, i + batchSize);

      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.allSettled(
        batch.map(async (poolRef) => {
          try {
            const poolAddress = getAddress(poolRef.address);

            // 获取池子数据
            const [token0, token1, fee, liquidity, slot0] = await Promise.all([
              client.readContract({
                address: poolAddress as `0x${string}`,
                abi: pancakeV3PoolABI,
                functionName: 'token0',
              }),
              client.readContract({
                address: poolAddress as `0x${string}`,
                abi: pancakeV3PoolABI,
                functionName: 'token1',
              }),
              client.readContract({
                address: poolAddress as `0x${string}`,
                abi: pancakeV3PoolABI,
                functionName: 'fee',
              }),
              client.readContract({
                address: poolAddress as `0x${string}`,
                abi: pancakeV3PoolABI,
                functionName: 'liquidity',
              }),
              client.readContract({
                address: poolAddress as `0x${string}`,
                abi: pancakeV3PoolABI,
                functionName: 'slot0',
              }),
            ]);

            return {
              address: poolAddress,
              token0: {
                address: token0 as string,
                symbol: '', // 需要从 ERC20 获取，这里先留空
                name: '',
                decimals: 18,
              },
              token1: {
                address: token1 as string,
                symbol: '',
                name: '',
                decimals: 18,
              },
              liquidity: (liquidity as bigint).toString(),
              sqrtPriceX96: (slot0[0] as bigint).toString(),
              tick: slot0[1] as number,
              fee: Number(fee) / 10000,
              tvlUsd: poolRef.tvlUSD,
              poolType: 'v3' as const,
            };
          } catch (error) {
            this.logger.debug(
              `Failed to fetch pool ${poolRef.address}:`,
              error,
            );
            return null;
          }
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          pools.push(result.value);
        }
      }
    }

    return pools;
  }

  /**
   * 从 Subgraph 获取 V3 池子
   */
  private async getV3PoolsFromSubgraph(
    chainId: number,
    limit: number,
  ): Promise<SwapPool[]> {
    const subgraphUrl = getV3SubgraphUrl(chainId);
    if (!subgraphUrl) {
      throw new Error(`No V3 subgraph for chain ${chainId}`);
    }

    const client = this.createGraphqlClient(subgraphUrl);
    const pools: SwapPool[] = [];
    let hasMore = true;
    let lastId = '';

    // eslint-disable-next-line no-await-in-loop
    while (hasMore && pools.length < limit) {
      const data = await client.request<{
        pools: Array<{
          id: string;
          tick: string;
          sqrtPrice: string;
          feeTier: string;
          liquidity: string;
          totalValueLockedUSD: string;
          token0: {
            id: string;
            symbol: string;
            decimals: string;
          };
          token1: {
            id: string;
            symbol: string;
            decimals: string;
          };
        }>;
      }>(queryAllV3Pools, {
        pageSize: Math.min(1000, limit - pools.length),
        id: lastId,
      });

      if (!data.pools || data.pools.length === 0) {
        hasMore = false;
        break;
      }

      const formattedPools = data.pools.map((p) => ({
        address: p.id,
        token0: {
          address: p.token0.id,
          symbol: p.token0.symbol,
          name: p.token0.symbol,
          decimals: Number(p.token0.decimals),
        },
        token1: {
          address: p.token1.id,
          symbol: p.token1.symbol,
          name: p.token1.symbol,
          decimals: Number(p.token1.decimals),
        },
        liquidity: p.liquidity,
        sqrtPriceX96: p.sqrtPrice,
        tick: Number(p.tick),
        fee: Number(p.feeTier) / 10000,
        tvlUsd: p.totalValueLockedUSD,
        poolType: 'v3' as const,
      }));

      pools.push(...formattedPools);
      lastId = data.pools[data.pools.length - 1].id;

      if (data.pools.length < 1000) {
        hasMore = false;
      }
    }

    return pools;
  }

  /**
   * 获取 V2 池子 - 从链上获取
   *
   * V2池子没有TVL API，使用热门代币对从Factory获取池子地址
   */
  async getV2Pools(chainId: number, limit = 100): Promise<SwapPool[]> {
    if (!this.isChainSupported(chainId)) {
      return [];
    }

    const cacheKey = `pools:v2:${chainId}`;
    const cached = await this.cacheService.get<SwapPool[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const pools = await this.getV2PoolsFromOnChain(chainId, limit);
      if (pools.length > 0) {
        this.logger.log(
          `Fetched ${pools.length} V2 pools from on-chain for chain ${chainId}`,
        );
        await this.cacheService.set(cacheKey, pools, 300);
        return pools;
      }
    } catch (error) {
      this.logger.error(`Failed to get V2 pools for chain ${chainId}`, error);
    }

    return [];
  }

  /**
   * 从链上获取 V2 池子
   */
  private async getV2PoolsFromOnChain(
    chainId: number,
    limit: number,
  ): Promise<SwapPool[]> {
    // 只支持 BSC
    if (chainId !== ChainId.BSC) {
      return [];
    }

    const client = this.getViemClient(chainId);
    if (!client) {
      throw new Error(`No viem client for chain ${chainId}`);
    }

    // PancakeSwap V2 Factory 地址
    const V2_FACTORY = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';

    // 热门代币对（BSC）
    const HOT_TOKEN_PAIRS: [string, string][] = [
      [
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      ], // USDC/WBNB
      [
        '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      ], // CAKE/WBNB
      [
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      ], // USDC/CAKE
      [
        '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      ], // ETH/WBNB
      [
        '0x1AF3F329e8BE154074D8769D1FFa4eE058B15DB0',
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      ], // BTCB/WBNB
    ];

    // PancakePair ABI - 简化版
    const pancakePairABI = [
      {
        inputs: [],
        name: 'token0',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'token1',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'getReserves',
        outputs: [
          { internalType: 'uint112', name: 'reserve0', type: 'uint112' },
          { internalType: 'uint112', name: 'reserve1', type: 'uint112' },
          {
            internalType: 'uint32',
            name: 'blockTimestampLast',
            type: 'uint32',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const;

    // Factory ABI
    const factoryABI = [
      {
        inputs: [
          { internalType: 'address', name: 'tokenA', type: 'address' },
          { internalType: 'address', name: 'tokenB', type: 'address' },
        ],
        name: 'getPair',
        outputs: [{ internalType: 'address', name: 'pair', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const;

    const pools: SwapPool[] = [];

    // eslint-disable-next-line no-await-in-loop
    for (const [tokenA, tokenB] of HOT_TOKEN_PAIRS.slice(0, limit)) {
      try {
        // 从 Factory 获取池子地址
        // eslint-disable-next-line no-await-in-loop
        const poolAddress = await client.readContract({
          address: V2_FACTORY as `0x${string}`,
          abi: factoryABI,
          functionName: 'getPair',
          args: [
            getAddress(tokenA) as `0x${string}`,
            getAddress(tokenB) as `0x${string}`,
          ],
        });

        if (
          (poolAddress as string).toLowerCase() ===
          '0x0000000000000000000000000000000000000000'
        ) {
          continue;
        }

        // 获取池子数据
        // eslint-disable-next-line no-await-in-loop
        const [token0, token1, reserves] = await Promise.all([
          client.readContract({
            address: poolAddress as `0x${string}`,
            abi: pancakePairABI,
            functionName: 'token0',
          }),
          client.readContract({
            address: poolAddress as `0x${string}`,
            abi: pancakePairABI,
            functionName: 'token1',
          }),
          client.readContract({
            address: poolAddress as `0x${string}`,
            abi: pancakePairABI,
            functionName: 'getReserves',
          }),
        ]);

        const reserve0 = (reserves as readonly [bigint, bigint, number])[0];
        const reserve1 = (reserves as readonly [bigint, bigint, number])[1];

        pools.push({
          address: getAddress(poolAddress as string),
          token0: {
            address: token0 as string,
            symbol: '',
            name: '',
            decimals: 18,
          },
          token1: {
            address: token1 as string,
            symbol: '',
            name: '',
            decimals: 18,
          },
          reserve0: reserve0.toString(),
          reserve1: reserve1.toString(),
          poolType: 'v2' as const,
          tvlUsd: '0',
        });
      } catch (error) {
        this.logger.debug(
          `Failed to fetch V2 pool for ${tokenA}/${tokenB}:`,
          error,
        );
      }
    }

    return pools;
  }

  /**
   * 获取 Stable 池子 - 从 PancakeSwap SDK
   */
  async getStablePools(chainId: number): Promise<SwapPool[]> {
    if (!this.isChainSupported(chainId)) {
      return [];
    }

    const cacheKey = `pools:stable:${chainId}`;
    const cached = await this.cacheService.get<SwapPool[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const stableSwapData = await getStableSwapPools(chainId as ChainId);

      const pools: SwapPool[] = stableSwapData.map((p) => ({
        address: p.lpAddress,
        token0: {
          address: p.token.address,
          symbol: p.token.symbol,
          name: p.token.name,
          decimals: p.token.decimals,
        },
        token1: {
          address: p.quoteToken.address,
          symbol: p.quoteToken.symbol,
          name: p.quoteToken.name,
          decimals: p.quoteToken.decimals,
        },
        tvlUsd: '0',
        poolType: 'stable' as const,
      }));

      this.logger.log(
        `Fetched ${pools.length} Stable pools for chain ${chainId}`,
      );
      await this.cacheService.set(cacheKey, pools, 300);
      return pools;
    } catch (error) {
      this.logger.error(
        `Failed to get Stable pools for chain ${chainId}`,
        error,
      );
      return [];
    }
  }

  /**
   * 获取单个池子详情
   */
  async getPoolDetail(
    chainId: number,
    address: string,
  ): Promise<SwapPool | null> {
    if (!this.isChainSupported(chainId)) {
      return null;
    }

    // 尝试从V3池子中查找
    const v3Pools = await this.getV3Pools(chainId);
    const found = v3Pools.find(
      (p) => p.address.toLowerCase() === address.toLowerCase(),
    );
    if (found) {
      return found;
    }

    // 尝试从V2池子中查找
    const v2Pools = await this.getV2Pools(chainId);
    const v2Found = v2Pools.find(
      (p) => p.address.toLowerCase() === address.toLowerCase(),
    );
    if (v2Found) {
      return v2Found;
    }

    // 尝试从Stable池子中查找
    const stablePools = await this.getStablePools(chainId);
    const stableFound = stablePools.find(
      (p) => p.address.toLowerCase() === address.toLowerCase(),
    );
    if (stableFound) {
      return stableFound;
    }

    return null;
  }

  /**
   * 清除缓存
   */
  clearCache(chainId?: number): void {
    if (chainId) {
      this.poolsCache.delete(chainId);
    } else {
      this.poolsCache.clear();
    }
  }
}
