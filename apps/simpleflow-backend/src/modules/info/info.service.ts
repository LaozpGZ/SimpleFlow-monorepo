/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChainId } from '@pancakeswap/chains';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CacheService } from '@/common/cache/cache.service';
import { RpcService } from '@/common/rpc/rpc.service';
import {
  TopTokenResponse,
  TopPoolResponse,
  TokenDetailResponse,
  PoolDetailResponse,
  ChartDataPoint,
  TokenChartResponse,
  ProtocolStatsResponse,
  SearchResponse,
  SearchToken,
  SearchPool,
  PoolTokenInfo,
} from './dto/info.dto';

// V3 池子 ABI
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
] as const;

// ERC20 ABI（用于获取代币信息）
const ERC20_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Farms 配置中的池子类型
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

// 链上池子数据
interface PoolOnChainData {
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
  token0Address: string;
  token1Address: string;
}

// 代币信息缓存
interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

// 价格缓存（用于计算统计数据）
interface PriceData {
  priceUSD: number;
  timestamp: number;
}

// 统计数据缓存
interface TokenStats {
  tvlUSD: number;
  volumeUSD: number;
  feeUSD: number;
  txCount: number;
  timestamp: number;
}

@Injectable()
export class InfoService implements OnModuleInit {
  private readonly logger = new Logger(InfoService.name);

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
    ChainId.SIMPLECHAIN_TESTNET, // SimpleChain 测试网
    ChainId.ZKSYNC,
  ];

  // 链名称映射
  private readonly chainIdToChainName: Record<number, string> = {
    [ChainId.BSC]: 'bsc',
    [ChainId.BSC_TESTNET]: 'bsc-testnet',
    [ChainId.ETHEREUM]: 'ethereum',
    [ChainId.ARBITRUM_ONE]: 'arbitrum',
    [ChainId.OPBNB]: 'opbnb',
    [ChainId.BASE]: 'base',
    [ChainId.LINEA]: 'linea',
    [ChainId.SIMPLECHAIN]: 'simplechain',
    [ChainId.SIMPLECHAIN_TESTNET]: 'simplechainTestnet',
    [ChainId.ZKSYNC]: 'zksync',
  };

  // 缓存 farms 配置数据
  private farmsConfig: Map<number, FarmPoolConfig[]> = new Map();

  // 代币信息缓存
  private tokenInfoCache: Map<string, TokenInfo> = new Map();

  // 价格数据缓存（用于模拟历史数据）
  private priceHistory: Map<string, PriceData[]> = new Map();

  // 统计数据缓存
  private tokenStats: Map<string, TokenStats[]> = new Map();

  private poolStats: Map<string, TokenStats[]> = new Map();

  // USDC 代币地址（各链）
  private readonly stableCoins: Record<number, string[]> = {
    [ChainId.BSC]: [
      '0x55d398326f99059fF775485246999027B3197955', // USDT
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
    ],
    [ChainId.ETHEREUM]: [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    ],
    [ChainId.SIMPLECHAIN]: [
      '0x55d398326f99059fF775485246999027B3197955', // USDT (BSC 地址，可能需要调整)
    ],
  };

  // 默认代币价格（用于没有价格数据的代币）
  private readonly defaultPrices: Record<string, number> = {
    // BNB Chain
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': 600, // WBNB
    bnb: 600, // BNB (native, 使用小写标识符)
    // Ethereum
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 3500, // WETH
    eth: 3500, // ETH (native, 使用小写标识符)
    // Stablecoins
    '0x55d398326f99059fF775485246999027B3197955': 1, // USDT (BSC)
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': 1, // USDC (BSC)
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 1, // USDC (ETH)
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 1, // USDT (ETH)
  };

  constructor(
    private cacheService: CacheService,
    private rpcService: RpcService,
  ) {}

  async onModuleInit() {
    this.logger.log('InfoService initialized');
    await this.loadFarmsConfig();
    await this.initializeStatsData();
  }

  /**
   * 从 @pancakeswap/farms 包加载配置
   */
  private async loadFarmsConfig() {
    const configPaths = [
      join(process.cwd(), '../../packages/farms/lists/56.json'),
      join(process.cwd(), '../../packages/farms/dist/lists/56.json'),
      join(process.cwd(), '../../packages/farms/lists/5600.json'), // SimpleChain 配置
    ];

    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          const data = JSON.parse(
            readFileSync(configPath, 'utf-8'),
          ) as FarmPoolConfig[];
          const chainId = data[0]?.chainId || ChainId.BSC;
          this.farmsConfig.set(chainId, data);

          // 预加载代币信息
          for (const pool of data) {
            this.cacheTokenInfo(
              pool.token0.address || 'native',
              pool.token0.symbol,
              pool.token0.name,
              pool.token0.decimals,
            );
            this.cacheTokenInfo(
              pool.token1.address || 'native',
              pool.token1.symbol,
              pool.token1.name,
              pool.token1.decimals,
            );
          }

          this.logger.log(`Loaded ${data.length} pools from ${configPath}`);
        } catch (e) {
          this.logger.error(`Failed to load ${configPath}: ${e}`);
        }
      }
    }

    // 如果 SimpleChain 主网没有配置，使用 BSC 的配置作为演示数据
    if (
      !this.farmsConfig.has(ChainId.SIMPLECHAIN) &&
      this.farmsConfig.has(ChainId.BSC)
    ) {
      const bscPools = this.farmsConfig.get(ChainId.BSC);
      if (bscPools && bscPools.length > 0) {
        // 复制 BSC 的池子数据，但修改 chainId 为 SimpleChain
        const simpleChainPools = bscPools.slice(0, 50).map((pool) => ({
          ...pool,
          chainId: ChainId.SIMPLECHAIN,
        }));
        this.farmsConfig.set(ChainId.SIMPLECHAIN, simpleChainPools);

        // 预加载代币信息
        for (const pool of simpleChainPools) {
          this.cacheTokenInfo(
            pool.token0.address || 'native',
            pool.token0.symbol,
            pool.token0.name,
            pool.token0.decimals,
          );
          this.cacheTokenInfo(
            pool.token1.address || 'native',
            pool.token1.symbol,
            pool.token1.name,
            pool.token1.decimals,
          );
        }

        this.logger.log(
          `Using BSC pools as demo data for SimpleChain (${simpleChainPools.length} pools)`,
        );
      }
    }

    // 如果 SimpleChain 测试网没有配置，也使用 BSC 的配置作为演示数据
    if (
      !this.farmsConfig.has(ChainId.SIMPLECHAIN_TESTNET) &&
      this.farmsConfig.has(ChainId.BSC)
    ) {
      const bscPools = this.farmsConfig.get(ChainId.BSC);
      if (bscPools && bscPools.length > 0) {
        // 复制 BSC 的池子数据，但修改 chainId 为 SimpleChain 测试网
        const testnetPools = bscPools.slice(0, 30).map((pool) => ({
          ...pool,
          chainId: ChainId.SIMPLECHAIN_TESTNET,
        }));
        this.farmsConfig.set(ChainId.SIMPLECHAIN_TESTNET, testnetPools);

        // 预加载代币信息
        for (const pool of testnetPools) {
          this.cacheTokenInfo(
            pool.token0.address || 'native',
            pool.token0.symbol,
            pool.token0.name,
            pool.token0.decimals,
          );
          this.cacheTokenInfo(
            pool.token1.address || 'native',
            pool.token1.symbol,
            pool.token1.name,
            pool.token1.decimals,
          );
        }

        this.logger.log(
          `Using BSC pools as demo data for SimpleChain Testnet (${testnetPools.length} pools)`,
        );
      }
    }
  }

  /**
   * 初始化统计数据（模拟历史数据）
   */
  private async initializeStatsData() {
    const now = Date.now();
    const intervals = [
      { ago: 24 * 60 * 60 * 1000, label: '24h' },
      { ago: 48 * 60 * 60 * 1000, label: '48h' },
      { ago: 7 * 24 * 60 * 60 * 1000, label: '7d' },
    ];

    // 为每个代币初始化模拟的历史数据
    for (const [address, price] of Object.entries(this.defaultPrices)) {
      const history: PriceData[] = [];
      for (const interval of intervals) {
        // 模拟价格波动 (±5%)
        const variance = 1 + (Math.random() - 0.5) * 0.1;
        history.push({
          priceUSD: price * variance,
          timestamp: now - interval.ago,
        });
      }
      this.priceHistory.set(address.toLowerCase(), history);
    }
  }

  /**
   * 缓存代币信息
   */
  private cacheTokenInfo(
    address: string,
    symbol: string,
    name: string,
    decimals: number,
  ) {
    const key = address.toLowerCase();
    this.tokenInfoCache.set(key, { address: key, symbol, name, decimals });
  }

  /**
   * 获取代币信息
   */
  private getTokenInfo(address: string): TokenInfo | undefined {
    return this.tokenInfoCache.get(address.toLowerCase());
  }

  /**
   * 从链上获取代币信息
   */
  private async fetchTokenInfo(
    chainId: number,
    address: string,
  ): Promise<TokenInfo> {
    const cached = this.getTokenInfo(address);
    if (cached) return cached;

    try {
      const client = this.rpcService.getClient(chainId as ChainId);
      if (!client) {
        throw new Error('No RPC client available');
      }

      const addr = address.startsWith('0x') ? address : `0x${address}`;
      const [name, symbol, decimals] = await Promise.all([
        client
          .readContract({
            address: addr as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'name',
          })
          .catch(() => Promise.resolve('Unknown')),
        client
          .readContract({
            address: addr as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'symbol',
          })
          .catch(() => Promise.resolve('UNK')),
        client
          .readContract({
            address: addr as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'decimals',
          })
          .catch(() => Promise.resolve(18)),
      ]);

      const info: TokenInfo = {
        address: addr.toLowerCase(),
        symbol: (symbol as string) || 'UNK',
        name: (name as string) || 'Unknown',
        decimals: (decimals as number) || 18,
      };

      this.tokenInfoCache.set(addr.toLowerCase(), info);
      return info;
    } catch (error) {
      this.logger.warn(`Failed to fetch token info for ${address}: ${error}`);
      return {
        address: address.toLowerCase(),
        symbol: 'UNK',
        name: 'Unknown',
        decimals: 18,
      };
    }
  }

  /**
   * 获取代币价格（USD）
   * 对于稳定链，可以从池子计算价格
   * 对于新链，返回默认价格或从池子推断
   */
  private getTokenPrice(address: string, _chainId: number): number {
    const key = address.toLowerCase();
    if (this.defaultPrices[key]) {
      return this.defaultPrices[key];
    }

    // 尝试从价格历史获取
    const history = this.priceHistory.get(key);
    if (history && history.length > 0) {
      return history[history.length - 1].priceUSD;
    }

    // 默认价格
    return 1;
  }

  /**
   * 计算池子中代币的价格
   */
  private async calculatePoolPrices(
    poolData: PoolOnChainData,
    token0Info: TokenInfo,
    token1Info: TokenInfo,
    chainId: number,
  ): Promise<{
    price0: number;
    price1: number;
    priceUSD0: number;
    priceUSD1: number;
  }> {
    // 计算 token0 相对 token1 的价格
    // sqrtPriceX96 = sqrt(token1/token0) * 2^96
    const sqrtPrice = Number(poolData.sqrtPriceX96) / 2 ** 96;
    const price0 = 1 / (sqrtPrice * sqrtPrice); // token0 价格 (以 token1 计价)
    const price1 = sqrtPrice * sqrtPrice; // token1 价格 (以 token0 计价)

    // 获取 USD 价格
    const priceUSD0 = this.getTokenPrice(token0Info.address, chainId);
    const priceUSD1 = priceUSD0 * price1; // token1 价格 = token0 价格 * price1

    return { price0, price1, priceUSD0, priceUSD1 };
  }

  /**
   * 从链上获取池子数据
   */
  private async getPoolOnChainData(
    poolAddress: string,
    chainId: number,
  ): Promise<PoolOnChainData | null> {
    try {
      const client = this.rpcService.getClient(chainId as ChainId);
      if (!client) {
        return null;
      }

      const addr = poolAddress.startsWith('0x')
        ? poolAddress
        : `0x${poolAddress}`;

      const [slot0, liquidity, token0Address, token1Address] =
        await Promise.all([
          client.readContract({
            address: addr as `0x${string}`,
            abi: V3_POOL_ABI,
            functionName: 'slot0',
          }),
          client.readContract({
            address: addr as `0x${string}`,
            abi: V3_POOL_ABI,
            functionName: 'liquidity',
          }),
          client.readContract({
            address: addr as `0x${string}`,
            abi: V3_POOL_ABI,
            functionName: 'token0',
          }),
          client.readContract({
            address: addr as `0x${string}`,
            abi: V3_POOL_ABI,
            functionName: 'token1',
          }),
        ]);

      return {
        sqrtPriceX96: slot0[0] as bigint,
        tick: slot0[1] as number,
        liquidity: liquidity as bigint,
        token0Address: (token0Address as string).toLowerCase(),
        token1Address: (token1Address as string).toLowerCase(),
      };
    } catch (error) {
      this.logger.debug(
        `Failed to fetch pool data for ${poolAddress}: ${error}`,
      );
      return null;
    }
  }

  /**
   * 生成模拟的统计数据（24h/48h/7d）
   * 对于新链，我们基于当前数据生成合理的历史数据
   */

  private generateHistoricalStats(
    currentValue: number,
    variance: number = 0.2,
  ): {
    current: number;
    day: number;
    twoDays: number;
    week: number;
  } {
    const randomVariance = () => 1 + (Math.random() - 0.5) * variance;
    return {
      current: currentValue,
      day: currentValue * randomVariance(),
      twoDays: currentValue * randomVariance() * randomVariance(),
      week:
        currentValue * randomVariance() * randomVariance() * randomVariance(),
    };
  }

  /**
   * 检查链是否支持
   */
  isChainSupported(chainId: number): boolean {
    return this.supportedChains.includes(chainId as ChainId);
  }

  /**
   * 获取链名称
   */
  getChainName(chainId: number): string | undefined {
    return this.chainIdToChainName[chainId];
  }

  // ============ Top Tokens ============

  /**
   * 获取 Top Tokens 列表
   * GET /cached/tokens/v3/{chainName}/list/top
   */
  async getTopTokens(chainId: number): Promise<TopTokenResponse[]> {
    const cacheKey = `info:topTokens:v3:${chainId}`;
    const cached = await this.cacheService.get<TopTokenResponse[]>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId)) {
      return [];
    }

    const pools = this.farmsConfig.get(chainId) || [];
    const tokenMap = new Map<string, TopTokenResponse>();

    // 收集所有代币
    for (const pool of pools) {
      if (pool.protocol !== 'v3') continue;

      const tokens = [
        { info: pool.token0, isNative: pool.token0.isNative },
        { info: pool.token1, isNative: pool.token1.isNative },
      ];

      for (const token of tokens) {
        const address = (token.info.address || 'native').toLowerCase();
        if (tokenMap.has(address)) continue;

        // 获取代币价格
        const priceUSD = this.getTokenPrice(address, chainId);
        const historical = this.generateHistoricalStats(priceUSD, 0.1);

        // 生成模拟统计数据
        const tvl = Math.floor(Math.random() * 1000000 * 10 ** 18);
        const tvlStats = this.generateHistoricalStats(tvl, 0.15);
        const volume = Math.floor(Math.random() * 100000 * 10 ** 18);
        const volumeStats = this.generateHistoricalStats(volume, 0.3);
        const fee = volume * 0.0025; // 0.25% 手续费
        const feeStats = this.generateHistoricalStats(fee, 0.3);

        tokenMap.set(address, {
          id: address,
          symbol: token.info.symbol,
          name: token.info.name,
          decimals: token.info.decimals,
          totalTxCount: Math.floor(Math.random() * 100000) + 1000,
          txCount24h: Math.floor(Math.random() * 1000) + 10,
          txCount48h: Math.floor(Math.random() * 2000) + 20,
          txCount7d: Math.floor(Math.random() * 5000) + 100,
          priceUSD: priceUSD.toFixed(18),
          priceUSD24h: historical.day.toFixed(18),
          priceUSD48h: historical.twoDays.toFixed(18),
          priceUSD7d: historical.week.toFixed(18),
          totalVolumeUSD: volume.toFixed(0),
          volumeUSD24h: volumeStats.day.toFixed(0) || null,
          volumeUSD48h: volumeStats.twoDays.toFixed(0) || null,
          volumeUSD7d: volumeStats.week.toFixed(0) || null,
          tvlUSD: (tvl / 10 ** 18).toFixed(0),
          tvlUSD24h: (tvlStats.day / 10 ** 18).toFixed(0),
          tvlUSD48h: (tvlStats.twoDays / 10 ** 18).toFixed(0),
          tvlUSD7d: (tvlStats.week / 10 ** 18).toFixed(0),
          tvl: tvl.toString(),
          tvl24h: tvlStats.day.toString(),
          tvl48h: tvlStats.twoDays.toString(),
          tvl7d: tvlStats.week.toString(),
          totalFeeUSD: fee.toFixed(0),
          feeUSD24h: feeStats.day.toFixed(0),
          feeUSD48h: feeStats.twoDays.toFixed(0),
          feeUSD7d: feeStats.week.toFixed(0),
        });
      }
    }

    // 转换为数组并按 TVL 排序
    const result = Array.from(tokenMap.values())
      .sort((a, b) => parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD))
      .slice(0, 100); // 限制返回 100 个

    // 缓存 5 分钟
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  // ============ Top Pools ============

  /**
   * 获取 Top Pools 列表
   * GET /cached/pools/v3/{chainName}/list/top
   */
  async getTopPools(
    chainId: number,
    options: { token?: string; minTxCount24h?: number } = {},
  ): Promise<TopPoolResponse[]> {
    const cacheKey = `info:topPools:v3:${chainId}:${options.token || 'all'}`;
    const cached = await this.cacheService.get<TopPoolResponse[]>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId)) {
      return [];
    }

    const pools = this.farmsConfig.get(chainId) || [];
    const results: TopPoolResponse[] = [];

    for (const pool of pools) {
      if (pool.protocol !== 'v3') continue;

      // 过滤条件
      if (options.token) {
        const token0 = (pool.token0.address || 'native').toLowerCase();
        const token1 = (pool.token1.address || 'native').toLowerCase();
        const searchToken = options.token.toLowerCase();
        if (token0 !== searchToken && token1 !== searchToken) {
          continue;
        }
      }

      const poolAddress = pool.lpAddress || '';
      if (!poolAddress || poolAddress.length !== 42) continue; // 跳过非标准地址

      // 尝试获取链上数据
      const onChainData = await this.getPoolOnChainData(poolAddress, chainId);

      // 获取代币信息
      const token0Address =
        onChainData?.token0Address || pool.token0.address || 'native';
      const token1Address =
        onChainData?.token1Address || pool.token1.address || 'native';

      const token0Info: PoolTokenInfo = {
        id: token0Address,
        symbol: pool.token0.symbol,
        name: pool.token0.name,
        decimals: pool.token0.decimals,
      };

      const token1Info: PoolTokenInfo = {
        id: token1Address,
        symbol: pool.token1.symbol,
        name: pool.token1.name,
        decimals: pool.token1.decimals,
      };

      // 计算价格
      let price0 = '1';
      let price1 = '1';
      let tvlToken0 = '0';
      let tvlToken1 = '0';
      let tvlUSD = '0';
      let liquidity = '0';
      let sqrtPrice = '79228162514264337593543950336'; // 1 << 96
      let tick = 0;

      if (onChainData) {
        const prices = await this.calculatePoolPrices(
          onChainData,
          {
            address: token0Address,
            symbol: pool.token0.symbol,
            name: pool.token0.name,
            decimals: pool.token0.decimals,
          },
          {
            address: token1Address,
            symbol: pool.token1.symbol,
            name: pool.token1.name,
            decimals: pool.token1.decimals,
          },
          chainId,
        );

        price0 = prices.price0.toFixed(18);
        price1 = prices.price1.toFixed(18);

        // 计算 TVL

        liquidity = onChainData.liquidity.toString();

        sqrtPrice = onChainData.sqrtPriceX96.toString();

        tick = onChainData.tick;

        // 简化的 TVL 计算

        const liquidityFloat = Number(onChainData.liquidity);
        const tvl0 = liquidityFloat / 10 ** 18;
        const tvl1 = tvl0 * prices.price1;
        tvlToken0 = tvl0.toFixed(0);
        tvlToken1 = tvl1.toFixed(0);
        tvlUSD = (tvl0 * prices.priceUSD0).toFixed(0);
      } else {
        // 使用配置数据
        tvlUSD = (Math.random() * 1000000).toFixed(0);
      }

      // 生成统计数据
      const tvlStats = this.generateHistoricalStats(parseFloat(tvlUSD), 0.15);
      const volume = Math.random() * 100000;
      const volumeStats = this.generateHistoricalStats(volume, 0.3);
      const fee = volume * 0.0025;
      const feeStats = this.generateHistoricalStats(fee, 0.3);

      results.push({
        id: poolAddress,
        token0: token0Info,
        token1: token1Info,
        totalVolumeUSD: volume.toFixed(0),
        token0Price: price0,
        token1Price: price1,
        tvlToken0,
        tvlToken1,
        volumeUSD24h: volumeStats.day.toFixed(0),
        volumeUSD48h: volumeStats.twoDays.toFixed(0),
        volumeUSD7d: volumeStats.week.toFixed(0),
        tvlUSD,
        tvlUSD24h: tvlStats.day.toFixed(0),
        tvlUSD48h: tvlStats.twoDays.toFixed(0),
        tvlUSD7d: tvlStats.week.toFixed(0),
        createdAtTimestamp: Math.floor(
          Date.now() / 1000 - Math.random() * 365 * 24 * 60 * 60,
        ).toString(),
        feeTier: pool.feeAmount || 3000,
        liquidity,
        sqrtPrice,
        tick,
        totalFeeUSD: fee.toFixed(0),
        feeUSD24h: feeStats.day.toFixed(0),
        feeUSD48h: feeStats.twoDays.toFixed(0),
        feeUSD7d: feeStats.week.toFixed(0),
      });
    }

    // 按 TVL 排序
    results.sort((a, b) => parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD));

    // 缓存 5 分钟
    await this.cacheService.set(cacheKey, results, 300);

    return results;
  }

  // ============ Token Detail ============

  /**
   * 获取 Token 详情
   * GET /cached/tokens/v3/{chainName}/{address}
   */
  async getTokenDetail(
    chainId: number,
    address: string,
  ): Promise<TokenDetailResponse | null> {
    const cacheKey = `info:tokenDetail:v3:${chainId}:${address}`;
    const cached = await this.cacheService.get<TokenDetailResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId)) {
      return null;
    }

    // 获取代币信息
    const tokenInfo = await this.fetchTokenInfo(chainId, address);
    const priceUSD = this.getTokenPrice(address, chainId);
    const historical = this.generateHistoricalStats(priceUSD, 0.1);

    // 生成统计数据
    const tvl = Math.floor(Math.random() * 1000000 * 10 ** 18);
    const tvlStats = this.generateHistoricalStats(tvl, 0.15);
    const volume = Math.floor(Math.random() * 100000 * 10 ** 18);
    const volumeStats = this.generateHistoricalStats(volume, 0.3);
    const fee = volume * 0.0025;
    const feeStats = this.generateHistoricalStats(fee, 0.3);

    // 获取关联的池子
    const pools = this.farmsConfig.get(chainId) || [];
    const relatedPools: TokenDetailResponse['pools'] = [];

    for (const pool of pools) {
      if (pool.protocol !== 'v3') continue;

      const token0 = (pool.token0.address || 'native').toLowerCase();
      const token1 = (pool.token1.address || 'native').toLowerCase();
      const searchAddr = address.toLowerCase();

      if (token0 === searchAddr || token1 === searchAddr) {
        const poolTvl = Math.random() * 500000;
        const poolVolume = Math.random() * 50000;

        relatedPools.push({
          id: pool.lpAddress,
          token0: {
            id: pool.token0.address || 'native',
            symbol: pool.token0.symbol,
            name: pool.token0.name,
            decimals: pool.token0.decimals,
          },
          token1: {
            id: pool.token1.address || 'native',
            symbol: pool.token1.symbol,
            name: pool.token1.name,
            decimals: pool.token1.decimals,
          },
          feeTier: pool.feeAmount || 3000,
          tvlUSD: poolTvl.toFixed(0),
          totalVolumeUSD: poolVolume.toFixed(0),
          tvlToken0: (poolTvl / 2).toFixed(0),
          tvlToken1: (poolTvl / 2).toFixed(0),
        });
      }
    }

    const result: TokenDetailResponse = {
      id: address.toLowerCase(),
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      decimals: tokenInfo.decimals,
      totalTxCount: Math.floor(Math.random() * 100000) + 1000,
      txCount24h: Math.floor(Math.random() * 1000) + 10,
      txCount48h: Math.floor(Math.random() * 2000) + 20,
      txCount7d: Math.floor(Math.random() * 5000) + 100,
      priceUSD: priceUSD.toFixed(18),
      priceUSD24h: historical.day.toFixed(18),
      priceUSD48h: historical.twoDays.toFixed(18),
      priceUSD7d: historical.week.toFixed(18),
      totalVolumeUSD: volume.toFixed(0),
      volumeUSD24h: volumeStats.day.toFixed(0) || null,
      volumeUSD48h: volumeStats.twoDays.toFixed(0) || null,
      volumeUSD7d: volumeStats.week.toFixed(0) || null,
      tvlUSD: (tvl / 10 ** 18).toFixed(0),
      tvlUSD24h: (tvlStats.day / 10 ** 18).toFixed(0),
      tvlUSD48h: (tvlStats.twoDays / 10 ** 18).toFixed(0),
      tvlUSD7d: (tvlStats.week / 10 ** 18).toFixed(0),
      tvl: tvl.toString(),
      tvl24h: tvlStats.day.toString(),
      tvl48h: tvlStats.twoDays.toString(),
      tvl7d: tvlStats.week.toString(),
      totalFeeUSD: fee.toFixed(0),
      feeUSD24h: feeStats.day.toFixed(0),
      feeUSD48h: feeStats.twoDays.toFixed(0),
      feeUSD7d: feeStats.week.toFixed(0),
      pools: relatedPools,
    };

    // 缓存 2 分钟
    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  // ============ Pool Detail ============

  /**
   * 获取 Pool 详情
   * GET /cached/pools/v3/{chainName}/{address}
   */
  async getPoolDetail(
    chainId: number,
    address: string,
  ): Promise<PoolDetailResponse | null> {
    const cacheKey = `info:poolDetail:v3:${chainId}:${address}`;
    const cached = await this.cacheService.get<PoolDetailResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId)) {
      return null;
    }

    // 从配置中查找池子
    const pools = this.farmsConfig.get(chainId) || [];
    const poolConfig = pools.find(
      (p) => (p.lpAddress || '').toLowerCase() === address.toLowerCase(),
    );

    if (!poolConfig) {
      return null;
    }

    // 获取链上数据
    const onChainData = await this.getPoolOnChainData(address, chainId);

    const token0Info: PoolTokenInfo = {
      id: poolConfig.token0.address || 'native',
      symbol: poolConfig.token0.symbol,
      name: poolConfig.token0.name,
      decimals: poolConfig.token0.decimals,
    };

    const token1Info: PoolTokenInfo = {
      id: poolConfig.token1.address || 'native',
      symbol: poolConfig.token1.symbol,
      name: poolConfig.token1.name,
      decimals: poolConfig.token1.decimals,
    };

    // 计算价格
    let price0 = '1';
    let price1 = '1';
    let tvlToken0 = '0';
    let tvlToken1 = '0';
    let tvlUSD = '0';
    let liquidity = '0';
    let sqrtPrice = '79228162514264337593543950336';
    let tick: number | null = 0;

    if (onChainData) {
      const prices = await this.calculatePoolPrices(
        onChainData,
        {
          address: token0Info.id,
          symbol: token0Info.symbol,
          name: token0Info.name,
          decimals: token0Info.decimals,
        },
        {
          address: token1Info.id,
          symbol: token1Info.symbol,
          name: token1Info.name,
          decimals: token1Info.decimals,
        },
        chainId,
      );

      price0 = prices.price0.toFixed(18);
      price1 = prices.price1.toFixed(18);

      liquidity = onChainData.liquidity.toString();

      sqrtPrice = onChainData.sqrtPriceX96.toString();

      tick = onChainData.tick;

      const liquidityFloat = Number(onChainData.liquidity);
      const tvl0 = liquidityFloat / 10 ** 18;
      const tvl1 = tvl0 * prices.price1;
      tvlToken0 = tvl0.toFixed(0);
      tvlToken1 = tvl1.toFixed(0);
      tvlUSD = (tvl0 * prices.priceUSD0).toFixed(0);
    }

    // 生成统计数据
    const tvlStats = this.generateHistoricalStats(
      parseFloat(tvlUSD) || 0,
      0.15,
    );
    const volume = Math.random() * 100000;
    const volumeStats = this.generateHistoricalStats(volume, 0.3);
    const fee = volume * 0.0025;
    const feeStats = this.generateHistoricalStats(fee, 0.3);

    const result: PoolDetailResponse = {
      id: address.toLowerCase(),
      token0: token0Info,
      token1: token1Info,
      totalVolumeUSD: volume.toFixed(0),
      token0Price: price0,
      token1Price: price1,
      tvlToken0,
      tvlToken1,
      volumeUSD24h: volumeStats.day.toFixed(0),
      volumeUSD48h: volumeStats.twoDays.toFixed(0),
      volumeUSD7d: volumeStats.week.toFixed(0),
      tvlUSD,
      tvlUSD24h: tvlStats.day.toFixed(0),
      tvlUSD48h: tvlStats.twoDays.toFixed(0),
      tvlUSD7d: tvlStats.week.toFixed(0),
      createdAtTimestamp: Math.floor(
        Date.now() / 1000 - Math.random() * 365 * 24 * 60 * 60,
      ).toString(),
      feeTier: poolConfig.feeAmount || 3000,
      liquidity,
      sqrtPrice,
      tick,
      totalFeeUSD: fee.toFixed(0),
      feeUSD24h: feeStats.day.toFixed(0),
      feeUSD48h: feeStats.twoDays.toFixed(0),
      feeUSD7d: feeStats.week.toFixed(0),
    };

    // 缓存 2 分钟
    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  // ============ Token Chart ============

  /**
   * 获取 Token TVL 图表数据
   * GET /cached/tokens/chart/{chainName}/{address}/tvl
   */
  async getTokenChart(
    chainId: number,
    address: string,
  ): Promise<TokenChartResponse> {
    const cacheKey = `info:tokenChart:v3:${chainId}:${address}`;
    const cached = await this.cacheService.get<TokenChartResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // 生成模拟的图表数据（7天，每小时一个点）
    const data: ChartDataPoint[] = [];
    const now = Math.floor(Date.now() / 1000);
    const oneHour = 3600;
    const points = 7 * 24; // 7天，每小时

    const baseTVL = Math.random() * 1000000 + 100000;

    for (let i = points; i >= 0; i--) {
      const timestamp = now - i * oneHour;
      // 模拟波动
      const variance = 1 + Math.sin(i / 10) * 0.2 + (Math.random() - 0.5) * 0.1;
      const tvlUSD = baseTVL * variance;
      const volumeUSD = tvlUSD * (Math.random() * 0.1);

      data.push({
        date: timestamp,
        tvlUSD,
        volumeUSD,
      });
    }

    const result: TokenChartResponse = { data };

    // 缓存 5 分钟
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  // ============ Protocol Stats ============

  /**
   * 获取协议统计数据
   * GET /cached/protocol/{protocol}/{chainName}/stats
   */
  async getProtocolStats(
    chainId: number,
    protocol: string,
  ): Promise<ProtocolStatsResponse | null> {
    const cacheKey = `info:protocolStats:${protocol}:${chainId}`;
    const cached = await this.cacheService.get<ProtocolStatsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isChainSupported(chainId)) {
      return null;
    }

    // 从所有池子汇总统计数据
    const pools = this.farmsConfig.get(chainId) || [];
    const v3Pools = pools.filter(
      (p) =>
        p.protocol === protocol || (protocol === 'v3' && p.protocol === 'v3'),
    );

    // 模拟汇总数据
    const baseTVL = v3Pools.length * 500000;
    const tvlStats = this.generateHistoricalStats(baseTVL, 0.15);
    const volume = baseTVL * 0.5;
    const volumeStats = this.generateHistoricalStats(volume, 0.3);
    const fee = volume * 0.0025;
    const feeStats = this.generateHistoricalStats(fee, 0.3);

    const result: ProtocolStatsResponse = {
      tvlUSD: baseTVL.toFixed(0),
      totalVolumeUSD: (volume * 10).toFixed(0),
      totalProtocolFeeUSD: (fee * 10).toFixed(0),
      totalProtocolFeeUSD24h: feeStats.day.toFixed(0),
      totalProtocolFeeUSD48h: feeStats.twoDays.toFixed(0),
      totalProtocolFeeUSD30d: (fee * 30).toFixed(0),
      totalTxCount: Math.floor(Math.random() * 1000000) + 10000,
      totalFeeUSD: (fee * 10).toFixed(0),
      totalFeeUSD24h: feeStats.day.toFixed(0),
      totalFeeUSD48h: feeStats.twoDays.toFixed(0),
      totalFeeUSD30d: (fee * 30).toFixed(0),
      tvlUSD24h: tvlStats.day.toFixed(0),
      tvlUSD48h: tvlStats.twoDays.toFixed(0),
      tvlUSD30d: tvlStats.week.toFixed(0),
      volumeUSD24h: volumeStats.day.toFixed(0),
      volumeUSD48h: volumeStats.twoDays.toFixed(0),
      volumeUSD30d: volumeStats.week.toFixed(0),
      txCount24h: Math.floor(Math.random() * 10000) + 100,
      txCount48h: Math.floor(Math.random() * 20000) + 200,
      txCount30d: Math.floor(Math.random() * 50000) + 1000,
    };

    // 缓存 5 分钟
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  // ============ Search ============

  /**
   * 搜索代币和池子
   * GET /cached/protocol/{protocol}/{chainName}/search
   */
  async search(
    chainId: number,
    protocol: string,
    query: string,
  ): Promise<SearchResponse> {
    if (!this.isChainSupported(chainId)) {
      return { tokens: [], pools: [] };
    }

    const lowerQuery = query.toLowerCase();
    const tokens: SearchToken[] = [];
    const pools: SearchPool[] = [];

    // 搜索代币
    const seenTokens = new Set<string>();
    const farmPools = this.farmsConfig.get(chainId) || [];

    for (const pool of farmPools) {
      if (
        pool.protocol !== protocol &&
        !(protocol === 'v3' && pool.protocol === 'v3')
      )
        continue;

      // 检查 token0
      const token0Addr = (pool.token0.address || 'native').toLowerCase();
      if (
        !seenTokens.has(token0Addr) &&
        (pool.token0.symbol.toLowerCase().includes(lowerQuery) ||
          pool.token0.name.toLowerCase().includes(lowerQuery) ||
          token0Addr.includes(lowerQuery))
      ) {
        const price = this.getTokenPrice(token0Addr, chainId);
        tokens.push({
          id: token0Addr,
          name: pool.token0.name,
          symbol: pool.token0.symbol,
          decimals: pool.token0.decimals,
          priceUSD: price.toFixed(18),
          totalVolumeUSD: (Math.random() * 1000000).toFixed(0),
          tvlUSD: (Math.random() * 500000).toFixed(0),
          tvl: (Math.random() * 500000 * 10 ** 18).toFixed(0),
          totalTxCount: Math.floor(Math.random() * 10000),
        });
        seenTokens.add(token0Addr);
      }

      // 检查 token1
      const token1Addr = (pool.token1.address || 'native').toLowerCase();
      if (
        !seenTokens.has(token1Addr) &&
        (pool.token1.symbol.toLowerCase().includes(lowerQuery) ||
          pool.token1.name.toLowerCase().includes(lowerQuery) ||
          token1Addr.includes(lowerQuery))
      ) {
        const price = this.getTokenPrice(token1Addr, chainId);
        tokens.push({
          id: token1Addr,
          name: pool.token1.name,
          symbol: pool.token1.symbol,
          decimals: pool.token1.decimals,
          priceUSD: price.toFixed(18),
          totalVolumeUSD: (Math.random() * 1000000).toFixed(0),
          tvlUSD: (Math.random() * 500000).toFixed(0),
          tvl: (Math.random() * 500000 * 10 ** 18).toFixed(0),
          totalTxCount: Math.floor(Math.random() * 10000),
        });
        seenTokens.add(token1Addr);
      }

      // 搜索池子
      if (
        pool.token0.symbol.toLowerCase().includes(lowerQuery) ||
        pool.token1.symbol.toLowerCase().includes(lowerQuery) ||
        (pool.token0.address || 'native').toLowerCase().includes(lowerQuery) ||
        (pool.token1.address || 'native').toLowerCase().includes(lowerQuery) ||
        `${pool.token0.symbol}/${pool.token1.symbol}`
          .toLowerCase()
          .includes(lowerQuery) ||
        `${pool.token1.symbol}/${pool.token0.symbol}`
          .toLowerCase()
          .includes(lowerQuery)
      ) {
        const tvl = Math.random() * 500000;
        pools.push({
          id: pool.lpAddress,
          token0: {
            id: pool.token0.address || 'native',
            symbol: pool.token0.symbol,
            name: pool.token0.name,
            decimals: pool.token0.decimals,
          },
          token1: {
            id: pool.token1.address || 'native',
            symbol: pool.token1.symbol,
            name: pool.token1.name,
            decimals: pool.token1.decimals,
          },
          feeTier: pool.feeAmount || 3000,
          tvlUSD: tvl.toFixed(0),
          totalVolumeUSD: (tvl * 0.5).toFixed(0),
          tvlToken0: (tvl / 2).toFixed(0),
          tvlToken1: (tvl / 2).toFixed(0),
        });
      }
    }

    return { tokens, pools };
  }
}
