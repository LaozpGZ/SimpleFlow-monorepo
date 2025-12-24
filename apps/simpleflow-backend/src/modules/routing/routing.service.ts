import { Injectable, Logger } from '@nestjs/common';
import { SmartRouter } from '@pancakeswap/smart-router';
import { ChainId } from '@pancakeswap/chains';

import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  private onChainQuoteProvider = SmartRouter.createQuoteProvider({
    onChainProvider: this.rpcService.getOnChainProvider(),
  });

  // 不同链的缓存时间（秒）
  private readonly CACHE_TIME = {
    [ChainId.ETHEREUM]: 10,
    [ChainId.GOERLI]: 10,
    [ChainId.BSC]: 2,
    [ChainId.BSC_TESTNET]: 2,
  };

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  async getQuote(params: any) {
    const { parseCurrency, parseCurrencyAmount, serializeTrade } =
      SmartRouter.Transformer;

    try {
      // 解析参数
      const currencyAAmount = parseCurrencyAmount(
        params.chainId,
        params.amount,
      );
      const currencyA = currencyAAmount.currency;
      const currencyB = parseCurrency(params.chainId, params.currency);

      // 获取池子缓存
      const cacheKey = `${currencyA.symbol}-${currencyB.symbol}-${params.chainId}:pool-v1`;
      let pools = await this.cacheService.get(cacheKey);

      if (!pools) {
        const pairs = await SmartRouter.getPairCombinations(
          currencyA,
          currencyB,
        );

        this.logger.debug(
          `Fetching pools for ${currencyA.symbol}/${currencyB.symbol} on chain ${params.chainId}`,
        );

        const [v3Pools, v2Pools, stablePools] = await Promise.all([
          SmartRouter.getV3PoolSubgraph({
            provider: this.subgraphProvider,
            pairs,
          }),
          SmartRouter.getV2PoolsOnChain(
            pairs,
            this.rpcService.getOnChainProvider(),
          ),
          SmartRouter.getStablePoolsOnChain(
            pairs,
            this.rpcService.getOnChainProvider(),
          ),
        ]);

        pools = { v3Pools, v2Pools, stablePools };
        await this.cacheService.set(cacheKey, pools, 900); // 15分钟
      }

      // 计算最优交易
      const trade = await SmartRouter.getBestTrade(
        currencyAAmount,
        currencyB,
        params.tradeType || 'EXACT_INPUT',
        {
          gasPriceWei: params.gasPriceWei
            ? BigInt(params.gasPriceWei)
            : undefined,
          poolProvider: SmartRouter.createStaticPoolProvider([
            ...pools.v3Pools,
            ...pools.v2Pools,
            ...pools.stablePools,
          ]),
          quoteProvider: this.onChainQuoteProvider,
          maxHops: params.maxHops,
          maxSplits: params.maxSplits,
          allowedPoolTypes: params.poolTypes,
          quoterOptimization: false,
        },
      );

      return trade ? serializeTrade(trade) : {};
    } catch (error) {
      this.logger.error('Failed to get quote', error);
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getPools(chainId: ChainId) {
    // TODO: 实现获取池子列表的逻辑
    // 参考 apis/routing/src/pools.ts
    return {
      chainId,
      pools: [],
      updatedAt: new Date().toISOString(),
    };
  }

  // 子图提供者（需要实现）
  // eslint-disable-next-line class-methods-use-this
  private subgraphProvider = (_chainId: { chainId?: ChainId }) => {
    // TODO: 实现子图查询逻辑
    // 参考 apis/routing/src/provider.ts 的 v3SubgraphProvider
    return null;
  };
}
