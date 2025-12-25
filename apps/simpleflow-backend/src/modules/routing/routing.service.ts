import { Injectable, Logger } from '@nestjs/common';
import { SmartRouter } from '@pancakeswap/smart-router';
import { GraphQLClient } from 'graphql-request';

import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';

// V3 子图客户端
const v3SubgraphClients: Record<number, GraphQLClient> = {
  56: new GraphQLClient(
    'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc',
  ),
  97: new GraphQLClient(
    'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc-testnet',
  ),
};

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  // 创建链上报价提供者
  private onChainQuoteProvider = SmartRouter.createQuoteProvider({
    onChainProvider: ({ chainId }: { chainId?: number }) =>
      this.rpcService.getClient(chainId || 56),
  });

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  /**
   * 获取最佳报价
   */
  async getQuote(params: any) {
    const {
      amount,
      chainId,
      currency,
      tradeType,
      gasPriceWei,
      maxHops,
      maxSplits,
      poolTypes,
    } = params;

    // 解析货币和数量
    const currencyAAmount = SmartRouter.Transformer.parseCurrencyAmount(
      chainId,
      amount,
    );
    const currencyA = currencyAAmount.currency;
    const currencyB = SmartRouter.Transformer.parseCurrency(chainId, currency);

    // 获取缓存
    const cacheKey = `${currencyA.symbol}-${currencyB.symbol}-${chainId}:pool-v1`;
    const cachedPools = await this.cacheService.get(cacheKey);

    let pools: any;

    if (cachedPools) {
      pools = cachedPools;
    } else {
      const pairs = await SmartRouter.getPairCombinations(currencyA, currencyB);

      this.logger.debug(
        `Fetching pools for ${currencyA.symbol}/${currencyB.symbol} on chain ${chainId}`,
      );

      // 并行获取池子数据
      const [v3Pools, v2Pools, stablePools] = await Promise.all([
        SmartRouter.getV3PoolSubgraph({
          provider: () => v3SubgraphClients[chainId] || v3SubgraphClients[56],
          pairs,
        }),
        SmartRouter.getV2PoolsOnChain(
          pairs,
          ({ chainId }: { chainId?: number }) =>
            this.rpcService.getClient(chainId || 56),
        ),
        SmartRouter.getStablePoolsOnChain(
          pairs,
          ({ chainId }: { chainId?: number }) =>
            this.rpcService.getClient(chainId || 56),
        ),
      ]);

      pools = {
        v3Pools,
        v2Pools,
        stablePools,
      };

      // 缓存 15 分钟
      await this.cacheService.set(cacheKey, pools, 900);
    }

    // 计算最优交易
    const trade = await SmartRouter.getBestTrade(
      currencyAAmount,
      currencyB,
      (tradeType as any) || 'EXACT_INPUT',
      {
        gasPriceWei: gasPriceWei
          ? BigInt(gasPriceWei)
          : () => this.rpcService.getClient(chainId || 56).getGasPrice(),
        poolProvider: SmartRouter.createStaticPoolProvider([
          ...pools.v3Pools,
          ...pools.v2Pools,
          ...pools.stablePools,
        ]),
        quoteProvider: this.onChainQuoteProvider,
        maxHops: maxHops || 3,
        maxSplits: maxSplits || 2,
        allowedPoolTypes: poolTypes as any,
        quoterOptimization: false,
      },
    );

    return trade ? SmartRouter.Transformer.serializeTrade(trade) : {};
  }

  /**
   * 获取池子列表
   */
  // eslint-disable-next-line class-methods-use-this
  async getPools(chainId: number) {
    // TODO: 实现获取池子列表的逻辑
    return {
      chainId,
      pools: [],
      updatedAt: new Date().toISOString(),
    };
  }
}
