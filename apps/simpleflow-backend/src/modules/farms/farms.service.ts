import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainId } from '@pancakeswap/chains';
import { createFarmFetcher } from '@pancakeswap/farms';

import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';

@Injectable()
export class FarmsService {
  private readonly logger = new Logger(FarmsService.name);

  private farmFetcher = createFarmFetcher(this.rpcService.getOnChainProvider());

  private readonly TESTNET_CHAINS = [ChainId.BSC_TESTNET, ChainId.GOERLI];

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  isTestnet(chainId: ChainId): boolean {
    return this.TESTNET_CHAINS.includes(chainId);
  }

  async getFarms(chainId: ChainId) {
    const cacheKey = `farms:${chainId}`;

    // 检查缓存
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.updatedAt).getTime();
      if (cacheAge < 2 * 60 * 1000) {
        // 2分钟
        this.logger.debug(`Using cached farms data for chain ${chainId}`);
        return cached;
      }
    }

    try {
      // 获取农场配置 - 这里使用 PancakeSwap 的配置源
      // TODO: 后续可以改用本地配置
      const farmsConfig = await fetch(
        `https://farms-config.pages.dev/${chainId}.json`,
      ).then((r) => r.json());

      // 获取农场数据
      const { farmsWithPrice, poolLength, regularCakePerBlock } =
        await this.farmFetcher.fetchFarms({
          chainId,
          isTestnet: this.isTestnet(chainId),
          farms: farmsConfig.filter((f: any) => f.pid !== 0),
        });

      const result = {
        updatedAt: new Date().toISOString(),
        poolLength,
        regularCakePerBlock,
        data: farmsWithPrice,
      };

      // 缓存结果
      await this.cacheService.set(cacheKey, result, 120); // 2分钟

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch farms for chain ${chainId}`, error);

      // 如果有缓存，即使过期也返回
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        this.logger.warn(`Using stale cache for chain ${chainId}`);
        return cached;
      }

      throw error;
    }
  }

  async getCakePrice() {
    const cacheKey = 'price:cake';
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const price = await this.getCakePriceInternal();
      const result = {
        price,
        updatedAt: new Date().toISOString(),
      };

      await this.cacheService.set(cacheKey, result, 10); // 10秒
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch CAKE price', error);
      throw error;
    }
  }

  private async getCakePriceInternal(): Promise<string> {
    // 从 CAKE/USDT 池子获取价格
    // TODO: 实现获取 CAKE 价格的逻辑
    // 参考 apis/farms/src/handler.ts 的 getCakePrice 函数
    const client = this.rpcService.getClient(ChainId.BSC);

    // CAKE/USDT 池子地址
    // eslint-disable-next-line
    const pairAddress = '0x16b9a82891338f9BA80e2D6970FDDA79D1Eb0DAE';

    const reserves = await client!.readContract({
      address: pairAddress as `0x${string}`,
      abi: [
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
      ],
      functionName: 'getReserves',
    });

    const [reserve0, reserve1] = reserves as [bigint, bigint];

    // CAKE 是 token0, USDT 是 token1
    // 价格 = reserve1 / reserve0
    const price = Number(reserve1) / Number(reserve0);

    return price.toString();
  }

  async getV3Liquidity(chainId: ChainId, address: string) {
    const cacheKey = `v3:liquidity:${chainId}:${address}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      const cacheAge = Date.now() - new Date(cached.updatedAt).getTime();
      if (cacheAge < 5 * 60 * 1000) {
        // 5分钟
        return cached;
      }
    }

    try {
      // TODO: 实现 V3 流动性计算逻辑
      // 参考 apis/farms/src/v3.ts 的 fetchLiquidityFromExplorer 函数
      const result = {
        tvl: {
          token0: '0',
          token1: '0',
        },
        formatted: {
          token0: '0',
          token1: '0',
        },
        updatedAt: new Date().toISOString(),
      };

      await this.cacheService.set(cacheKey, result, 300); // 5分钟

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch V3 liquidity for ${address}`, error);

      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      throw error;
    }
  }
}
