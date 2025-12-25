import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import BN from 'bignumber.js';

import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';

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
  farms: any[];
}

interface V3FarmsResponse {
  poolLength: number;
  cakePerSecond: string;
  totalAllocPoint: string;
  farms: any[];
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
 * MasterChef 数据
 */
interface MasterChefData {
  poolLength: number;
  totalRegularAllocPoint: string;
  totalSpecialAllocPoint: string;
  cakePerBlock: string;
  updatedAt: string;
}

/**
 * 支持的链ID（V2 农场）
 */
const SUPPORTED_CHAINS_V2 = [1, 56, 97]; // Ethereum, BSC, BSC Testnet

/**
 * 支持的链ID（V3 农场）
 */
const SUPPORTED_CHAINS_V3 = [1, 56]; // Ethereum, BSC

/**
 * 农场价格配置列表（从远程获取）
 */
const FARMS_CONFIG_URL = 'https://farms-config.pages.dev';

/**
 * BSC 出块时间（秒）
 */
const BSC_BLOCK_TIME = 3;

/**
 * CAKE 每年产出（基于每块产出）
 */
const CAKE_PER_YEAR = (365 * 24 * 60 * 60) / BSC_BLOCK_TIME;

@Injectable()
export class FarmsService {
  private readonly logger = new Logger(FarmsService.name);

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  /**
   * 检查链是否支持
   */
  // eslint-disable-next-line class-methods-use-this
  isChainSupported(chainId: number, version: 'v2' | 'v3' = 'v2'): boolean {
    const supported =
      version === 'v2' ? SUPPORTED_CHAINS_V2 : SUPPORTED_CHAINS_V3;
    return supported.includes(chainId);
  }

  /**
   * 获取支持的链列表
   */
  // eslint-disable-next-line class-methods-use-this
  getSupportedChains(): { v2: number[]; v3: number[] } {
    return {
      v2: [...SUPPORTED_CHAINS_V2],
      v3: [...SUPPORTED_CHAINS_V3],
    };
  }

  /**
   * 获取农场配置
   */
  private async fetchFarmsConfig(chainId: number): Promise<any[]> {
    const cacheKey = `farms:config:${chainId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as any[];
    }

    try {
      const response = await fetch(`${FARMS_CONFIG_URL}/${chainId}.json`);
      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch farms config for chain ${chainId}: ${response.statusText}`,
        );
        return [];
      }
      const data = await response.json();

      // 缓存 10 分钟
      await this.cacheService.set(cacheKey, data, 600);
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch farms config for chain ${chainId}`,
        error,
      );
      return [];
    }
  }

  /**
   * 获取农场数据（简化实现）
   */
  async getFarms(chainId: number): Promise<FarmsResponse> {
    const cacheKey = `farms:${chainId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as FarmsResponse;
    }

    const results: FarmsResponse = {
      chainId,
      updatedAt: new Date().toISOString(),
    };

    // 获取 V2 农场配置
    if (this.isChainSupported(chainId, 'v2')) {
      try {
        const farmsConfig = await this.fetchFarmsConfig(chainId);
        results.v2 = {
          poolLength: farmsConfig.length,
          regularCakePerBlock: '40', // 默认值
          totalRegularAllocPoint: '0', // 需要从链上获取
          totalSpecialAllocPoint: '0', // 需要从链上获取
          farms: farmsConfig.map((farm, index) => ({
            pid: index,
            ...farm,
            apr: '0', // TODO: 计算实际 APR
            tvl: '0', // TODO: 计算实际 TVL
          })),
        };
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
    const cached = (await this.cacheService.get(
      cacheKey,
    )) as CakePriceData | null;
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
   * 获取 MasterChef 数据
   */
  async getMasterChefData(chainId: number): Promise<MasterChefData> {
    const cacheKey = `masterchef:data:${chainId}`;
    const cached = (await this.cacheService.get(
      cacheKey,
    )) as MasterChefData | null;
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId, 'v2')) {
      throw new Error(`Unsupported chainId for V2 farms: ${chainId}`);
    }

    // TODO: 从链上获取 MasterChef 数据
    const result: MasterChefData = {
      poolLength: 0,
      totalRegularAllocPoint: '0',
      totalSpecialAllocPoint: '0',
      cakePerBlock: '40',
      updatedAt: new Date().toISOString(),
    };

    await this.cacheService.set(cacheKey, result, 60); // 1分钟缓存
    return result;
  }

  /**
   * 计算农场 APR（简化实现）
   *
   * 公式：APR = (cakePerYear * cakePrice * poolWeight / totalAllocPoint) / tvl * 100
   */
  // eslint-disable-next-line class-methods-use-this
  calculateFarmApr(params: {
    poolWeight: string;
    tvlUsd: string;
    cakePriceUsd: string;
    cakePerBlock?: string;
    precision?: number;
  }): string {
    const {
      poolWeight,
      tvlUsd,
      cakePriceUsd,
      cakePerBlock = '40',
      precision = 2,
    } = params;

    const tvl = new BN(tvlUsd);
    if (tvl.isZero()) {
      return '0';
    }

    const cakePerYear = new BN(cakePerBlock).times(CAKE_PER_YEAR);
    const cakePerYearUsd = cakePerYear.times(new BN(cakePriceUsd));
    const poolRewardsUsd = cakePerYearUsd
      .times(new BN(poolWeight))
      .div(new BN(10000)); // poolWeight 是基点（10000 = 100%）
    const apr = poolRewardsUsd.div(tvl).times(100).decimalPlaces(precision);

    return apr.toString();
  }

  /**
   * 计算池子的 TVL
   */
  // eslint-disable-next-line class-methods-use-this
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
