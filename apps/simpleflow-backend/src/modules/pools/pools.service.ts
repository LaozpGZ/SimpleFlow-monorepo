import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChainId } from '@pancakeswap/chains';
import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';
import {
  V3PoolInfo,
  V2PoolInfo,
  StablePoolInfo,
  PoolsResponse,
} from './dto/pool-response.dto';

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

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  onModuleInit() {
    this.logger.log(
      `PoolsService initialized for ${this.supportedChains.length} chains`,
    );
  }

  /**
   * 检查链是否支持
   */
  isChainSupported(chainId: number): boolean {
    return this.supportedChains.includes(chainId as ChainId);
  }

  /**
   * 获取指定链的所有池子数据
   */
  async getPools(chainId: number): Promise<PoolsResponse> {
    if (!this.isChainSupported(chainId)) {
      return this.emptyResponse(chainId);
    }

    const cacheKey = `pools:${chainId}`;
    const cached = await this.cacheService.get<PoolsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // 并行获取各类池子数据
    const [v3Pools, v2Pools, stablePools] = await Promise.allSettled([
      this.getV3Pools(chainId),
      this.getV2Pools(chainId),
      this.getStablePools(chainId),
    ]);

    const response: PoolsResponse = {
      chainId,
      v3Pools: v3Pools.status === 'fulfilled' ? v3Pools.value : [],
      v2Pools: v2Pools.status === 'fulfilled' ? v2Pools.value : [],
      stablePools: stablePools.status === 'fulfilled' ? stablePools.value : [],
      _cache: {
        maxAge: 600, // 10分钟缓存
      },
    };

    // 缓存结果
    await this.cacheService.set(cacheKey, response, 600);

    return response;
  }

  /**
   * 获取 V3 池子
   * TODO: 从子图或链上获取实际数据
   */
  async getV3Pools(chainId: number): Promise<V3PoolInfo[]> {
    this.logger.debug(`Fetching V3 pools for chain ${chainId}`);

    // 这里应该从子图或链上获取数据
    // 暂时返回空数组，等待后续实现
    return [];
  }

  /**
   * 获取 V2 池子
   * TODO: 从子图或链上获取实际数据
   */
  async getV2Pools(chainId: number): Promise<V2PoolInfo[]> {
    this.logger.debug(`Fetching V2 pools for chain ${chainId}`);

    // 这里应该从子图或链上获取数据
    // 暂时返回空数组，等待后续实现
    return [];
  }

  /**
   * 获取 Stable 池子
   * TODO: 从子图或链上获取实际数据
   */
  async getStablePools(chainId: number): Promise<StablePoolInfo[]> {
    this.logger.debug(`Fetching Stable pools for chain ${chainId}`);

    // 这里应该从子图或链上获取数据
    // 暂时返回空数组，等待后续实现
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
   * 返回空响应
   */
  // eslint-disable-next-line class-methods-use-this
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
