/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainId } from '@pancakeswap/chains';
import BN from 'bignumber.js';

import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';

// 导入 PancakeSwap SDK
import {
  createFarmFetcher,
  createFarmFetcherV3,
  fetchAllUniversalFarms,
  defineFarmV3ConfigsFromUniversalFarm,
  Protocol,
  UniversalFarmConfig,
  UniversalFarmConfigV3,
} from '@pancakeswap/farms';

// 类型守卫函数
function isUniversalFarmConfigV3(
  farm: UniversalFarmConfig,
): farm is UniversalFarmConfigV3 {
  return farm.protocol === Protocol.V3;
}

/**
 * 农场数据响应类型
 */
interface FarmsResponse {
  chainId: number;
  updatedAt: string;
  v2?: V2FarmsResponse;
  v3?: V3FarmsResponse;
}

interface V2FarmsResponse {
  poolLength: number;
  regularCakePerBlock: string;
  totalRegularAllocPoint: string;
  totalSpecialAllocPoint: string;
  farms: V2FarmData[];
}

interface V3FarmsResponse {
  poolLength: number;
  cakePerSecond: string;
  totalAllocPoint: string;
  farms: V3FarmData[];
}

interface V2FarmData {
  pid: number;
  lpAddress: string;
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  quoteToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  tvlUsd: string;
  apr: string;
}

interface V3FarmData {
  pid: number;
  lpAddress: string;
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  quoteToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  tvlUsd: string;
  apr: string;
  poolWeight: string;
  multiplier: string;
  tokenPriceUsd: string;
  quoteTokenPriceUsd: string;
}

/**
 * CAKE 价格数据
 */
interface CakePriceData {
  price: string;
  source: string;
  updatedAt: string;
}

/**
 * 支持的链ID（V2 农场）
 */
const SUPPORTED_CHAINS_V2 = [56, 97, 1]; // BSC, BSC Testnet, Ethereum

/**
 * 支持的链ID（V3 农场）
 */
const SUPPORTED_CHAINS_V3 = [56, 1]; // BSC, Ethereum

@Injectable()
export class FarmsService implements OnModuleInit {
  private readonly logger = new Logger(FarmsService.name);

  // V3 农场配置缓存
  private v3FarmConfigs: Map<number, any[]> = new Map();

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  async onModuleInit() {
    this.logger.log('FarmsService initialized');
    // 预加载 V3 农场配置
    await this.loadV3FarmConfigs();
  }

  /**
   * 创建 Provider 函数，用于 SDK
   */
  private createProvider() {
    return ({ chainId }: { chainId: number }) => {
      const client = this.rpcService.getClient(chainId as ChainId);
      if (!client) {
        throw new Error(`No RPC client for chainId: ${chainId}`);
      }
      return client;
    };
  }

  /**
   * 加载 V3 农场配置
   */
  private async loadV3FarmConfigs() {
    try {
      const universalFarms = await fetchAllUniversalFarms();
      this.logger.log(`Loaded ${universalFarms.length} universal farm configs`);

      // 按链ID分组，只选择 V3 协议的农场
      for (const chainId of SUPPORTED_CHAINS_V3) {
        const chainFarms = universalFarms
          .filter((f) => f.chainId === chainId)
          .filter(isUniversalFarmConfigV3);
        const computedFarms = defineFarmV3ConfigsFromUniversalFarm(chainFarms);
        this.v3FarmConfigs.set(chainId, computedFarms);
        this.logger.log(
          `Loaded ${computedFarms.length} V3 farms for chain ${chainId}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to load V3 farm configs', error);
    }
  }

  /**
   * 检查链是否支持
   */
  isChainSupported(chainId: number, version: 'v2' | 'v3' = 'v2'): boolean {
    const supported =
      version === 'v2' ? SUPPORTED_CHAINS_V2 : SUPPORTED_CHAINS_V3;
    return supported.includes(chainId);
  }

  /**
   * 获取支持的链列表
   */
  getSupportedChains(): { v2: number[]; v3: number[] } {
    return {
      v2: [...SUPPORTED_CHAINS_V2],
      v3: [...SUPPORTED_CHAINS_V3],
    };
  }

  /**
   * 获取农场数据
   */
  async getFarms(chainId: number): Promise<FarmsResponse> {
    const cacheKey = `farms:${chainId}`;
    const cached = await this.cacheService.get<FarmsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const results: FarmsResponse = {
      chainId,
      updatedAt: new Date().toISOString(),
    };

    const provider = this.createProvider();

    // 获取 V3 农场数据
    if (this.isChainSupported(chainId, 'v3')) {
      try {
        const farmFetcherV3 = createFarmFetcherV3(provider);
        const farms = this.v3FarmConfigs.get(chainId) || [];

        if (farms.length > 0) {
          // 获取代币价格（空对象表示使用默认价格）
          const v3Data = await farmFetcherV3.fetchFarms({
            farms,
            chainId: chainId as any,
            commonPrice: {},
          });

          results.v3 = {
            poolLength: v3Data.poolLength,
            cakePerSecond: v3Data.cakePerSecond,
            totalAllocPoint: v3Data.totalAllocPoint,
            farms: v3Data.farmsWithPrice.map((farm: any) => ({
              pid: farm.pid,
              lpAddress: farm.lpAddress,
              token: {
                address: farm.token.address,
                symbol: farm.token.symbol,
                name: farm.token.name,
                decimals: farm.token.decimals,
              },
              quoteToken: {
                address: farm.quoteToken.address,
                symbol: farm.quoteToken.symbol,
                name: farm.quoteToken.name,
                decimals: farm.quoteToken.decimals,
              },
              tvlUsd: farm.tvlUsd || '0',
              apr: farm.apr || '0',
              poolWeight: farm.poolWeight || '0',
              multiplier: farm.multiplier || '0X',
              tokenPriceUsd: farm.tokenPriceUsd || '0',
              quoteTokenPriceUsd: farm.quoteTokenPriceUsd || '0',
            })),
          };

          this.logger.log(
            `Fetched ${results.v3.farms.length} V3 farms for chain ${chainId}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch V3 farms for chain ${chainId}`,
          error,
        );
      }
    }

    // 获取 V2 农场数据
    if (this.isChainSupported(chainId, 'v2')) {
      try {
        const farmFetcher = createFarmFetcher(provider);
        const isTestnet = chainId === ChainId.BSC_TESTNET;

        // 使用空数组作为farms配置，SDK会返回所有池子信息
        const v2Data = await farmFetcher.fetchFarms({
          isTestnet,
          farms: [],
          chainId,
        });

        // 获取详细信息（需要farms配置）
        // 这里先用简化版本，后续可以从配置文件加载
        results.v2 = {
          poolLength: v2Data.poolLength,
          regularCakePerBlock: v2Data.regularCakePerBlock.toString(),
          totalRegularAllocPoint: v2Data.totalRegularAllocPoint,
          totalSpecialAllocPoint: '0', // V2 特殊分配点，暂时返回0
          farms: [], // TODO: 添加实际农场配置
        };

        this.logger.log(
          `Fetched V2 master chef data for chain ${chainId}: ${v2Data.poolLength} pools`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to fetch V2 farms for chain ${chainId}`,
          error,
        );
      }
    }

    // 缓存 2 分钟
    await this.cacheService.set(cacheKey, results, 120);

    return results;
  }

  /**
   * 获取 CAKE 价格（从 Binance API 获取）
   */
  async getCakePrice(): Promise<CakePriceData> {
    const cacheKey = 'price:cake';
    const cached = await this.cacheService.get<CakePriceData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 从 Binance API 获取 CAKE/USDT 价格
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=CAKEUSDT',
      );
      if (!response.ok) {
        throw new Error(`Binance API failed: ${response.statusText}`);
      }
      const data = (await response.json()) as { price: string };

      const result: CakePriceData = {
        price: data.price,
        source: 'binance',
        updatedAt: new Date().toISOString(),
      };

      await this.cacheService.set(cacheKey, result, 30); // 30秒缓存
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch CAKE price from Binance API', error);

      // 失败时返回默认价格
      const result: CakePriceData = {
        price: '2.5',
        source: 'fallback',
        updatedAt: new Date().toISOString(),
      };

      await this.cacheService.set(cacheKey, result, 10);
      return result;
    }
  }

  /**
   * 获取 MasterChef V2 数据
   */
  async getMasterChefData(chainId: number): Promise<any> {
    const cacheKey = `masterchef:v2:data:${chainId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId, 'v2')) {
      throw new Error(`Unsupported chainId for V2 farms: ${chainId}`);
    }

    try {
      const farmFetcher = createFarmFetcher(this.createProvider());
      const isTestnet = chainId === ChainId.BSC_TESTNET;

      const v2Data = await farmFetcher.fetchFarms({
        isTestnet,
        farms: [],
        chainId,
      });

      const result = {
        poolLength: v2Data.poolLength,
        totalRegularAllocPoint: v2Data.totalRegularAllocPoint,
        cakePerBlock: v2Data.regularCakePerBlock.toString(),
        updatedAt: new Date().toISOString(),
      };

      await this.cacheService.set(cacheKey, result, 60); // 1分钟缓存
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch MasterChef V2 data for chain ${chainId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 获取 MasterChef V3 数据
   */
  async getMasterChefV3Data(chainId: number): Promise<any> {
    const cacheKey = `masterchef:v3:data:${chainId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId, 'v3')) {
      throw new Error(`Unsupported chainId for V3 farms: ${chainId}`);
    }

    try {
      const farmFetcherV3 = createFarmFetcherV3(this.createProvider());
      const farms = this.v3FarmConfigs.get(chainId) || [];

      if (farms.length === 0) {
        throw new Error(`No V3 farm configs for chain ${chainId}`);
      }

      const v3Data = await farmFetcherV3.fetchFarms({
        farms,
        chainId: chainId as any,
        commonPrice: {},
      });

      const result = {
        poolLength: v3Data.poolLength,
        totalAllocPoint: v3Data.totalAllocPoint,
        cakePerSecond: v3Data.cakePerSecond,
        updatedAt: new Date().toISOString(),
      };

      await this.cacheService.set(cacheKey, result, 60);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch MasterChef V3 data for chain ${chainId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 计算 V3 农场的 APR 和 TVL
   */
  async getFarmV3AprAndTvl(
    chainId: number,
    pid: number,
  ): Promise<{ apr: string; tvlUsd: string } | null> {
    try {
      // const farmFetcherV3 = createFarmFetcherV3(this.createProvider()); // TODO: 待实现
      const farms = this.v3FarmConfigs.get(chainId) || [];
      const farm = farms.find((f) => f.pid === pid);

      if (!farm) {
        return null;
      }

      // 这里需要调用 SDK 的 getCakeAprAndTVL 方法
      // 暂时返回默认值
      return {
        apr: '0',
        tvlUsd: '0',
      };
    } catch (error) {
      this.logger.error(`Failed to get farm APR/TVL for pid ${pid}`, error);
      return null;
    }
  }

  /**
   * 计算农场 APR（简化实现）
   */
  calculateFarmApr(params: {
    poolWeight: string;
    tvlUsd: string;
    cakePriceUsd: string;
    cakePerSecond?: string;
    precision?: number;
  }): string {
    const {
      poolWeight,
      tvlUsd,
      cakePriceUsd,
      cakePerSecond = '1',
      precision = 2,
    } = params;

    const tvl = new BN(tvlUsd);
    if (tvl.isZero()) {
      return '0';
    }

    // CAKE 每秒产出转换为 USD
    const cakePerSecondUsd = new BN(cakePerSecond).times(new BN(cakePriceUsd));
    const cakePerYearUsd = cakePerSecondUsd.times(31536000); // 一年的秒数

    // 根据池权重分配奖励
    const poolRewardsUsd = cakePerYearUsd.times(new BN(poolWeight));

    const apr = poolRewardsUsd.div(tvl).times(100).decimalPlaces(precision);

    return apr.toString();
  }

  /**
   * 计算池子的 TVL
   */
  calculateTvl(params: {
    token0Amount: string;
    token0Price: string;
    token1Amount: string;
    token1Price: string;
  }): string {
    const token0Value = new BN(params.token0Amount).times(
      new BN(params.token0Price),
    );
    const token1Value = new BN(params.token1Amount).times(
      new BN(params.token1Price),
    );
    return token0Value.plus(token1Value).toString();
  }
}
