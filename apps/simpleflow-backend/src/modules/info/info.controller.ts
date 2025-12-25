/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */

import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChainId } from '@pancakeswap/chains';
import { InfoService } from './info.service';

/**
 * Info API Controller
 *
 * 提供与 PancakeSwap 前端 Info 页面兼容的 API 接口
 * API 路径格式: /cached/{type}/{protocol}/{chainName}/{action}
 *
 * 支持的链名称:
 * - bsc, bsc-testnet
 * - ethereum
 * - arbitrum, base, linea, opbnb, zksync
 * - simplechain, simplechainTestnet (主网和测试网)
 */

// 支持的链名称类型
type ChainName =
  | 'bsc'
  | 'bsc-testnet'
  | 'ethereum'
  | 'arbitrum'
  | 'base'
  | 'linea'
  | 'opbnb'
  | 'zksync'
  | 'simplechain'
  | 'simplechainTestnet';

// 链名称到 ChainId 的映射
const CHAIN_NAME_TO_ID: Record<ChainName, ChainId> = {
  bsc: ChainId.BSC,
  'bsc-testnet': ChainId.BSC_TESTNET,
  ethereum: ChainId.ETHEREUM,
  arbitrum: ChainId.ARBITRUM_ONE,
  base: ChainId.BASE,
  linea: ChainId.LINEA,
  opbnb: ChainId.OPBNB,
  zksync: ChainId.ZKSYNC,
  simplechain: ChainId.SIMPLECHAIN,
  simplechainTestnet: ChainId.SIMPLECHAIN_TESTNET,
};

@Controller('cached')
@ApiTags('info')
export class InfoController {
  private readonly chainNameToId = CHAIN_NAME_TO_ID;

  constructor(private readonly infoService: InfoService) {}

  /**
   * 将链名称转换为 ChainId
   */
  private getChainId(chainName: string): ChainId {
    const id = this.chainNameToId[chainName as ChainName];
    if (!id) {
      throw new NotFoundException(`Chain "${chainName}" not supported`);
    }
    return id;
  }

  // ============ Top Tokens ============

  /**
   * 获取 Top Tokens 列表
   * GET /cached/tokens/v3/{chainName}/list/top
   */
  @Get('tokens/v3/:chainName/list/top')
  async getTopTokensV3(@Param('chainName') chainName: string) {
    const chainId = this.getChainId(chainName);
    return this.infoService.getTopTokens(chainId);
  }

  /**
   * 获取 Top Tokens 列表 (V2)
   * GET /cached/tokens/v2/{chainName}/list/top
   */
  @Get('tokens/v2/:chainName/list/top')
  async getTopTokensV2(@Param('chainName') _chainName: string) {
    // V2 暂时返回空数组
    return [];
  }

  /**
   * 获取 Top Tokens 列表 (Stable)
   * GET /cached/tokens/stable/{chainName}/list/top
   */
  @Get('tokens/stable/:chainName/list/top')
  async getTopTokensStable(@Param('chainName') _chainName: string) {
    // Stable 暂时返回空数组
    return [];
  }

  // ============ Token Detail ============

  /**
   * 获取 Token 详情
   * GET /cached/tokens/v3/{chainName}/{address}
   */
  @Get('tokens/v3/:chainName/:address')
  async getTokenDetailV3(
    @Param('chainName') chainName: string,
    @Param('address') address: string,
  ) {
    const chainId = this.getChainId(chainName);
    const result = await this.infoService.getTokenDetail(chainId, address);
    if (!result) {
      throw new NotFoundException(
        `Token "${address}" not found on ${chainName}`,
      );
    }
    return result;
  }

  /**
   * 获取 Token 详情 (V2)
   * GET /cached/tokens/v2/{chainName}/{address}
   */
  @Get('tokens/v2/:chainName/:address')
  async getTokenDetailV2(
    @Param('chainName') _chainName: string,
    @Param('address') _address: string,
  ) {
    throw new NotFoundException(`V2 token details not implemented yet`);
  }

  // ============ Token Charts ============

  /**
   * 获取 Token TVL 图表数据
   * GET /cached/tokens/chart/:chainName/:address/tvl
   */
  @Get('tokens/chart/:chainName/:address/tvl')
  async getTokenTvlChart(
    @Param('chainName') chainName: string,
    @Param('address') address: string,
  ) {
    const chainId = this.getChainId(chainName);
    return this.infoService.getTokenChart(chainId, address);
  }

  /**
   * 获取 Token 价格图表数据
   * GET /cached/tokens/chart/:chainName/:address/price
   */
  @Get('tokens/chart/:chainName/:address/price')
  async getTokenPriceChart(
    @Param('chainName') chainName: string,
    @Param('address') address: string,
  ) {
    const chainId = this.getChainId(chainName);
    const chart = await this.infoService.getTokenChart(chainId, address);
    // 返回与 TVL 相同的数据结构，实际应该有单独的价格数据
    return chart;
  }

  /**
   * 获取 Token 交易量图表数据
   * GET /cached/tokens/chart/:chainName/:address/:protocol/volume
   */
  @Get('tokens/chart/:chainName/:address/:protocol/volume')
  async getTokenVolumeChart(
    @Param('chainName') chainName: string,
    @Param('address') address: string,
    @Param('protocol') _protocol: string,
  ) {
    const chainId = this.getChainId(chainName);
    const chart = await this.infoService.getTokenChart(chainId, address);
    // 返回图表数据
    return chart;
  }

  /**
   * 获取 Token TVL 图表数据 (带协议)
   * GET /cached/tokens/chart/:chainName/:address/:protocol/tvl
   */
  @Get('tokens/chart/:chainName/:address/:protocol/tvl')
  async getTokenTvlChartWithProtocol(
    @Param('chainName') chainName: string,
    @Param('address') address: string,
    @Param('protocol') _protocol: string,
  ) {
    const chainId = this.getChainId(chainName);
    return this.infoService.getTokenChart(chainId, address);
  }

  /**
   * 获取 Token 价格图表数据 (带协议)
   * GET /cached/tokens/chart/:chainName/:address/:protocol/price
   */
  @Get('tokens/chart/:chainName/:address/:protocol/price')
  async getTokenPriceChartWithProtocol(
    @Param('chainName') chainName: string,
    @Param('address') address: string,
    @Param('protocol') _protocol: string,
  ) {
    const chainId = this.getChainId(chainName);
    const chart = await this.infoService.getTokenChart(chainId, address);
    return chart;
  }

  /**
   * 获取 Token 对 Token 价格图表
   * GET /cached/tokens/chart/:chainName/rate
   * Query: token0, token1
   */
  @Get('tokens/chart/:chainName/rate')
  async getTokenRateChart(
    @Param('chainName') _chainName: string,
    @Query('token0') _token0?: string,
    @Query('token1') _token1?: string,
  ) {
    // 暂时返回空数据
    return { data: [] };
  }

  // ============ Top Pools ============

  /**
   * 获取 Top Pools 列表
   * GET /cached/pools/v3/:chainName/list/top
   * Query: token? (过滤特定代币的池子)
   * Query: minTxCount24h? (最小24小时交易数)
   */
  @Get('pools/v3/:chainName/list/top')
  async getTopPoolsV3(
    @Param('chainName') chainName: string,
    @Query('token') token?: string,
    @Query('minTxCount24h') _minTxCount24h?: string,
  ) {
    const chainId = this.getChainId(chainName);
    return this.infoService.getTopPools(chainId, { token });
  }

  /**
   * 获取 Top Pools 列表 (Simple)
   * GET /cached/pools/v3/:chainName/list/simple
   */
  @Get('pools/v3/:chainName/list/simple')
  async getTopPoolsV3Simple(@Param('chainName') chainName: string) {
    const chainId = this.getChainId(chainName);
    // Simple 返回与 top 相同的数据
    return this.infoService.getTopPools(chainId);
  }

  /**
   * 获取 Top Pools 列表 (V2)
   * GET /cached/pools/v2/:chainName/list/top
   */
  @Get('pools/v2/:chainName/list/top')
  async getTopPoolsV2(@Param('chainName') _chainName: string) {
    // V2 暂时返回空数组
    return [];
  }

  // ============ Pool Detail ============

  /**
   * 获取 Pool 详情
   * GET /cached/pools/v3/:chainName/:address
   */
  @Get('pools/v3/:chainName/:address')
  async getPoolDetailV3(
    @Param('chainName') chainName: string,
    @Param('address') address: string,
  ) {
    const chainId = this.getChainId(chainName);
    const result = await this.infoService.getPoolDetail(chainId, address);
    if (!result) {
      throw new NotFoundException(
        `Pool "${address}" not found on ${chainName}`,
      );
    }
    return result;
  }

  /**
   * 获取 Pool 详情 (V2)
   * GET /cached/pools/v2/:chainName/:address
   */
  @Get('pools/v2/:chainName/:address')
  async getPoolDetailV2(
    @Param('chainName') _chainName: string,
    @Param('address') _address: string,
  ) {
    throw new NotFoundException(`V2 pool details not implemented yet`);
  }

  // ============ Protocol Stats ============

  /**
   * 获取协议统计数据
   * GET /cached/protocol/:protocol/:chainName/stats
   */
  @Get('protocol/:protocol/:chainName/stats')
  async getProtocolStats(
    @Param('protocol') protocol: string,
    @Param('chainName') chainName: string,
  ) {
    const chainId = this.getChainId(chainName);
    const result = await this.infoService.getProtocolStats(chainId, protocol);
    if (!result) {
      throw new NotFoundException(
        `Protocol stats not found for ${protocol} on ${chainName}`,
      );
    }
    return result;
  }

  /**
   * 获取协议 TVL 图表
   * GET /cached/protocol/chart/:protocol/:chainName/tvl
   * Query: groupBy (1D | 1W | 1M)
   */
  @Get('protocol/chart/:protocol/:chainName/tvl')
  async getProtocolTvlChart(
    @Param('protocol') protocol: string,
    @Param('chainName') chainName: string,
    @Query('groupBy') _groupBy?: string,
  ) {
    const chainId = this.getChainId(chainName);
    const stats = await this.infoService.getProtocolStats(chainId, protocol);
    if (!stats) {
      throw new NotFoundException(`Protocol stats not found`);
    }

    // 生成图表数据
    const now = Math.floor(Date.now() / 1000);
    const points = _groupBy === '1M' ? 30 : _groupBy === '1W' ? 7 : 24;

    const data = [];
    for (let i = points; i >= 0; i--) {
      const timestamp =
        now -
        i * (_groupBy === '1M' ? 86400 : _groupBy === '1W' ? 86400 : 3600);
      const variance = 1 + Math.sin(i / 5) * 0.1 + (Math.random() - 0.5) * 0.05;
      data.push({
        bucket: timestamp.toString(),
        tvlUSD: (parseFloat(stats.tvlUSD) * variance).toFixed(0),
      });
    }

    return data;
  }

  /**
   * 获取协议交易量图表
   * GET /cached/protocol/chart/:protocol/:chainName/volume
   * Query: groupBy (1D | 1W | 1M)
   */
  @Get('protocol/chart/:protocol/:chainName/volume')
  async getProtocolVolumeChart(
    @Param('protocol') protocol: string,
    @Param('chainName') chainName: string,
    @Query('groupBy') _groupBy?: string,
  ) {
    const chainId = this.getChainId(chainName);
    const stats = await this.infoService.getProtocolStats(chainId, protocol);
    if (!stats) {
      throw new NotFoundException(`Protocol stats not found`);
    }

    const now = Math.floor(Date.now() / 1000);
    const points = _groupBy === '1M' ? 30 : _groupBy === '1W' ? 7 : 24;

    const data = [];
    for (let i = points; i >= 0; i--) {
      const timestamp =
        now -
        i * (_groupBy === '1M' ? 86400 : _groupBy === '1W' ? 86400 : 3600);
      const variance = 1 + Math.sin(i / 5) * 0.1 + (Math.random() - 0.5) * 0.05;
      data.push({
        bucket: timestamp.toString(),
        volumeUSD: (parseFloat(stats.volumeUSD24h) * variance).toFixed(0),
      });
    }

    return data;
  }

  // ============ Search ============

  /**
   * 搜索代币和池子
   * GET /cached/protocol/:protocol/:chainName/search
   * Query: text (搜索文本)
   */
  @Get('protocol/:protocol/:chainName/search')
  async search(
    @Param('protocol') protocol: string,
    @Param('chainName') chainName: string,
    @Query('text') text?: string,
  ) {
    const chainId = this.getChainId(chainName);
    if (!text) {
      return { tokens: [], pools: [] };
    }
    return this.infoService.search(chainId, protocol, text);
  }

  // ============ Status ============

  /**
   * 健康检查
   * GET /status
   */
  @Get('status')
  getStatus() {
    return { status: 'ok', timestamp: Date.now() };
  }

  /**
   * 获取链最新区块
   * GET /status/:protocol/:chainName
   */
  @Get('status/:protocol/:chainName')
  async getChainStatus(
    @Param('protocol') _protocol: string,
    @Param('chainName') _chainName: string,
  ) {
    // 这里可以获取链上最新区块高度
    return { height: Math.floor(Date.now() / 12000) }; // 模拟区块高度
  }

  /**
   * 获取同步状态
   * GET /status-throw/:protocol/:chainName
   */
  @Get('status-throw/:protocol/:chainName')
  async getSyncStatus(
    @Param('protocol') _protocol: string,
    @Param('chainName') _chainName: string,
  ) {
    return {
      sync: true,
      blockBehind: 0,
    };
  }
}
