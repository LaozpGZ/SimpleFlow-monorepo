import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AssetStorageService } from './asset-storage.service';
import { AssetType } from '../dto/asset.dto';

/* eslint-disable no-await-in-loop */

/**
 * 链ID到TrustWallet路径的映射
 */
const CHAIN_ID_TO_TRUSTWALLET: Record<number, string> = {
  1: 'ethereum',
  56: 'smartchain',
  137: 'polygon',
  250: 'fantom',
  42161: 'arbitrum',
  10: 'optimism',
  43114: 'avalanche',
  25: 'cronos',
  1666600000: 'harmony',
  128: 'heco',
  100: 'xdai',
  1088: 'meter',
  122: 'fuse',
  1285: 'moonriver',
  8217: 'celo',
  1313161554: 'aurora',
  252: 'fraxtal',
  324: 'zksync',
  59144: 'linea',
  8453: 'base',
};

/**
 * 图标 URL 响应接口（用于批量查询）
 */
export interface IconUrlResponse {
  url: string;
  fallbackUrls: string[];
  chainId: number;
  address?: string;
  symbol?: string;
  type: 'token' | 'chain' | 'symbol';
}

/**
 * 批量响应接口
 */
export interface BatchUrlResponse {
  success: true;
  data: IconUrlResponse[];
}

/**
 * 资源服务
 * 负责返回图标图片二进制数据（与 CDN 行为一致）
 */
@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  private readonly pcsTokenCdn: string;

  private readonly pcsAssetsCdn: string;

  private readonly trustWalletCdn: string;

  private readonly proxyEnabled: boolean;

  constructor(
    private readonly storageService: AssetStorageService,
    private readonly configService: ConfigService,
  ) {
    this.pcsTokenCdn = this.configService.get<string>(
      'assets.pcsTokenCdnUrl',
      'https://tokens.pancakeswap.finance',
    );
    this.pcsAssetsCdn = this.configService.get<string>(
      'assets.pcsAssetsCdnUrl',
      'https://assets.pancakeswap.finance',
    );
    this.trustWalletCdn = this.configService.get<string>(
      'assets.trustWalletUrl',
      'https://assets-cdn.trustwallet.com',
    );
    this.proxyEnabled = this.configService.get<boolean>(
      'assets.proxyEnabled',
      true,
    );
  }

  /**
   * 获取代币图标（图片二进制）
   * 优先从本地读取，没有则抛出异常让 controller 去代理
   */
  async getTokenIcon(chainId: number, address: string): Promise<Buffer> {
    const normalizedAddress = address.toLowerCase();
    const icon = await this.storageService.getToken(chainId, normalizedAddress);
    if (icon) {
      return icon;
    }
    throw new NotFoundException('本地没有该图标');
  }

  /**
   * 代理获取代币图标（从 CDN 下载并返回）
   * 如果本地没有，会自动从 CDN 下载并缓存
   */
  async proxyTokenIcon(chainId: number, address: string): Promise<Buffer> {
    const normalizedAddress = address.toLowerCase();

    // 1. 尝试 PancakeSwap Token CDN
    try {
      const url = `${this.pcsTokenCdn}/images/${normalizedAddress}.png`;
      this.logger.debug(`尝试从 PancakeSwap CDN 获取: ${url}`);
      const buffer = await this.downloadImage(url);
      // 异步保存到本地
      this.storageService
        .saveToken(chainId, normalizedAddress, buffer)
        .catch((err) => {
          this.logger.warn(`保存代币图标失败: ${err.message}`);
        });
      return buffer;
    } catch (err) {
      this.logger.debug(`PancakeSwap CDN 失败: ${err.message}`);
    }

    // 2. 尝试 TrustWallet CDN
    const trustPath = CHAIN_ID_TO_TRUSTWALLET[chainId];
    if (trustPath) {
      try {
        const url = `${this.trustWalletCdn}/blockchains/${trustPath}/assets/${normalizedAddress}/logo.png`;
        this.logger.debug(`尝试从 TrustWallet CDN 获取: ${url}`);
        const buffer = await this.downloadImage(url);
        // 异步保存到本地
        this.storageService
          .saveToken(chainId, normalizedAddress, buffer)
          .catch((err) => {
            this.logger.warn(`保存代币图标失败: ${err.message}`);
          });
        return buffer;
      } catch (err) {
        this.logger.debug(`TrustWallet CDN 失败: ${err.message}`);
      }
    }

    // 3. 尝试 PancakeSwap Assets CDN
    try {
      const url = `${this.pcsAssetsCdn}/tokens/${chainId}/${normalizedAddress}.png`;
      this.logger.debug(`尝试从 PancakeSwap Assets CDN 获取: ${url}`);
      const buffer = await this.downloadImage(url);
      // 异步保存到本地
      this.storageService
        .saveToken(chainId, normalizedAddress, buffer)
        .catch((err) => {
          this.logger.warn(`保存代币图标失败: ${err.message}`);
        });
      return buffer;
    } catch (err) {
      this.logger.debug(`PancakeSwap Assets CDN 失败: ${err.message}`);
    }

    throw new NotFoundException(
      `代币图标不存在: ${chainId}/${normalizedAddress}`,
    );
  }

  /**
   * 获取链图标（图片二进制）
   */
  async getChainIcon(chainId: number): Promise<Buffer> {
    const icon = await this.storageService.getChain(chainId);
    if (icon) {
      return icon;
    }
    throw new NotFoundException('本地没有该链图标');
  }

  /**
   * 代理获取链图标（从 CDN 下载并返回）
   */
  async proxyChainIcon(chainId: number): Promise<Buffer> {
    // 1. 尝试 PancakeSwap Assets CDN
    try {
      const url = `${this.pcsAssetsCdn}/images/chains/${chainId}.png`;
      this.logger.debug(`尝试从 PancakeSwap Assets CDN 获取链图标: ${url}`);
      const buffer = await this.downloadImage(url);
      // 异步保存
      this.storageService.saveChain(chainId, buffer).catch((err) => {
        this.logger.warn(`保存链图标失败: ${err.message}`);
      });
      return buffer;
    } catch (err) {
      this.logger.debug(`PancakeSwap Assets CDN 失败: ${err.message}`);
    }

    // 2. 尝试带 eip155 前缀的
    try {
      const url = `${this.pcsAssetsCdn}/images/chains/eip155:${chainId}.png`;
      const buffer = await this.downloadImage(url);
      this.storageService.saveChain(chainId, buffer).catch((err) => {
        this.logger.warn(`保存链图标失败: ${err.message}`);
      });
      return buffer;
    } catch (err) {
      this.logger.debug(`eip155 前缀失败: ${err.message}`);
    }

    // 3. 尝试 TrustWallet CDN
    const trustPath = CHAIN_ID_TO_TRUSTWALLET[chainId];
    if (trustPath) {
      try {
        const url = `${this.trustWalletCdn}/blockchains/${trustPath}/info/logo.png`;
        const buffer = await this.downloadImage(url);
        this.storageService.saveChain(chainId, buffer).catch((err) => {
          this.logger.warn(`保存链图标失败: ${err.message}`);
        });
        return buffer;
      } catch (err) {
        this.logger.debug(`TrustWallet CDN 失败: ${err.message}`);
      }
    }

    throw new NotFoundException(`链图标不存在: ${chainId}`);
  }

  /**
   * 获取符号图标（图片二进制）
   */
  async getSymbolIcon(symbol: string): Promise<Buffer> {
    const normalizedSymbol = symbol.toLowerCase();
    const icon = await this.storageService.getSymbol(normalizedSymbol);
    if (icon) {
      return icon;
    }
    throw new NotFoundException('本地没有该符号图标');
  }

  /**
   * 代理获取符号图标（从 CDN 下载并返回）
   */
  async proxySymbolIcon(symbol: string): Promise<Buffer> {
    const normalizedSymbol = symbol.toLowerCase();

    // 1. 尝试 PancakeSwap Token CDN - symbol/
    try {
      const url = `${this.pcsTokenCdn}/images/symbol/${normalizedSymbol}.png`;
      this.logger.debug(`尝试从 PancakeSwap Token CDN 获取符号图标: ${url}`);
      const buffer = await this.downloadImage(url);
      // 异步保存
      this.storageService.saveSymbol(normalizedSymbol, buffer).catch((err) => {
        this.logger.warn(`保存符号图标失败: ${err.message}`);
      });
      return buffer;
    } catch (err) {
      this.logger.debug(`PancakeSwap Token CDN 失败: ${err.message}`);
    }

    // 2. 尝试 PancakeSwap Assets CDN - coins
    try {
      const url = `${this.pcsAssetsCdn}/images/coins/${normalizedSymbol}.png`;
      const buffer = await this.downloadImage(url);
      this.storageService.saveSymbol(normalizedSymbol, buffer).catch((err) => {
        this.logger.warn(`保存符号图标失败: ${err.message}`);
      });
      return buffer;
    } catch (err) {
      this.logger.debug(`PancakeSwap Assets CDN 失败: ${err.message}`);
    }

    // 3. 尝试直接 /images/
    try {
      const url = `${this.pcsTokenCdn}/images/${normalizedSymbol}.png`;
      const buffer = await this.downloadImage(url);
      this.storageService.saveSymbol(normalizedSymbol, buffer).catch((err) => {
        this.logger.warn(`保存符号图标失败: ${err.message}`);
      });
      return buffer;
    } catch (err) {
      this.logger.debug(`直接 images/ 失败: ${err.message}`);
    }

    throw new NotFoundException(`符号图标不存在: ${symbol}`);
  }

  /**
   * 批量获取代币图标 URL（返回 JSON，用于批量查询）
   */
  getBatchTokenUrls(chainId: number, addresses: string[]): BatchUrlResponse {
    const results: IconUrlResponse[] = [];

    for (const address of addresses) {
      const normalizedAddress = address.toLowerCase();
      const urls: string[] = [];

      // 1. PancakeSwap Token CDN
      urls.push(`${this.pcsTokenCdn}/images/${normalizedAddress}.png`);

      // 2. TrustWallet CDN
      const trustPath = CHAIN_ID_TO_TRUSTWALLET[chainId];
      if (trustPath) {
        urls.push(
          `${this.trustWalletCdn}/blockchains/${trustPath}/assets/${normalizedAddress}/logo.png`,
        );
      }

      // 3. PancakeSwap Assets CDN
      urls.push(
        `${this.pcsAssetsCdn}/tokens/${chainId}/${normalizedAddress}.png`,
      );

      results.push({
        url: urls[0],
        fallbackUrls: urls.slice(1),
        chainId,
        address: normalizedAddress,
        type: 'token',
      });
    }

    return {
      success: true,
      data: results,
    };
  }

  /**
   * 上传代币图标
   */
  async uploadTokenIcon(
    chainId: number,
    address: string,
    file: Buffer,
  ): Promise<{ success: boolean; path: string }> {
    const normalizedAddress = address.toLowerCase();
    const savedPath = await this.storageService.saveToken(
      chainId,
      normalizedAddress,
      file,
    );
    return { success: true, path: savedPath };
  }

  /**
   * 上传链图标
   */
  async uploadChainIcon(
    chainId: number,
    file: Buffer,
  ): Promise<{ success: boolean; path: string }> {
    const savedPath = await this.storageService.saveChain(chainId, file);
    return { success: true, path: savedPath };
  }

  /**
   * 上传符号图标
   */
  async uploadSymbolIcon(
    symbol: string,
    file: Buffer,
  ): Promise<{ success: boolean; path: string }> {
    const savedPath = await this.storageService.saveSymbol(
      symbol.toLowerCase(),
      file,
    );
    return { success: true, path: savedPath };
  }

  /**
   * 删除代币图标
   */
  async deleteTokenIcon(
    chainId: number,
    address: string,
  ): Promise<{ success: boolean }> {
    await this.storageService.deleteToken(chainId, address.toLowerCase());
    return { success: true };
  }

  /**
   * 删除链图标
   */
  async deleteChainIcon(chainId: number): Promise<{ success: boolean }> {
    await this.storageService.deleteChain(chainId);
    return { success: true };
  }

  /**
   * 从 URL 下载图片
   */
  // eslint-disable-next-line class-methods-use-this
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10秒超时
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SimpleFlowAssets/1.0)',
      },
    });

    if (!response.data || response.data.byteLength === 0) {
      throw new Error('下载的图片为空');
    }

    return Buffer.from(response.data);
  }

  /**
   * 批量导入代币列表
   */
  async importTokenList(
    chainId: number,
    tokens: Array<{ address: string; symbol: string }>,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const token of tokens) {
      try {
        await this.proxyTokenIcon(chainId, token.address);
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push(`${token.symbol}(${token.address}): ${err.message}`);
      }
    }

    return { success: successCount, failed: failedCount, errors };
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    return this.storageService.getStats();
  }

  /**
   * 列出所有资源
   */
  async listAssets(type: AssetType, chainId?: number) {
    switch (type) {
      case AssetType.TOKEN:
        return chainId ? this.storageService.listTokens(chainId) : [];
      case AssetType.CHAIN:
        return this.storageService.listChains();
      case AssetType.SYMBOL:
        return this.storageService.listSymbols();
      default:
        return [];
    }
  }
}
