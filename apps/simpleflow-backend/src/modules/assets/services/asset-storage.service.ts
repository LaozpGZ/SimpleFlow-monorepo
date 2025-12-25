/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-await-in-loop */
import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

/**
 * 资源存储服务
 * 负责本地文件存储、读取、删除等操作
 */
@Injectable()
export class AssetStorageService {
  private readonly logger = new Logger(AssetStorageService.name);

  private readonly assetsBaseDir: string;

  private readonly tokensDir: string;

  private readonly chainsDir: string;

  private readonly symbolsDir: string;

  constructor(@Optional() private readonly configService?: ConfigService) {
    this.assetsBaseDir = this.getConfig<string>(
      'assets.storagePath',
      './public/assets',
    );
    this.tokensDir = path.join(this.assetsBaseDir, 'tokens');
    this.chainsDir = path.join(this.assetsBaseDir, 'chains');
    this.symbolsDir = path.join(this.assetsBaseDir, 'symbols');

    this.ensureDirectories();
  }

  /**
   * 安全地获取配置值
   */
  private getConfig<T>(key: string, defaultValue: T): T {
    if (!this.configService) {
      return defaultValue;
    }
    return this.configService.get<T>(key, defaultValue);
  }

  /**
   * 确保所有需要的目录都存在
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [this.tokensDir, this.chainsDir, this.symbolsDir];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        this.logger.log(`创建目录: ${dir}`);
      }
    }
  }

  /**
   * 获取代币图标路径
   * 格式: /tokens/{chainId}/{address}.png
   */
  getTokenPath(chainId: number, address: string): string {
    return path.join(
      this.tokensDir,
      chainId.toString(),
      `${address.toLowerCase()}.png`,
    );
  }

  /**
   * 获取链图标路径
   * 格式: /chains/{chainId}.png
   */
  getChainPath(chainId: number): string {
    return path.join(this.chainsDir, `${chainId}.png`);
  }

  /**
   * 获取符号图标路径
   * 格式: /symbols/{symbol}.png
   */
  getSymbolPath(symbol: string): string {
    return path.join(this.symbolsDir, `${symbol.toLowerCase()}.png`);
  }

  /**
   * 保存代币图标
   */
  async saveToken(
    chainId: number,
    address: string,
    buffer: Buffer,
  ): Promise<string> {
    const filePath = this.getTokenPath(chainId, address);

    // 确保链目录存在
    const chainDir = path.join(this.tokensDir, chainId.toString());
    await fs.mkdir(chainDir, { recursive: true });

    // 优化并保存图片
    const optimized = await this.optimizeImage(buffer);
    await fs.writeFile(filePath, optimized);

    this.logger.log(`保存代币图标: ${filePath}`);
    return filePath;
  }

  /**
   * 保存链图标
   */
  async saveChain(chainId: number, buffer: Buffer): Promise<string> {
    const filePath = this.getChainPath(chainId);
    const optimized = await this.optimizeImage(buffer);
    await fs.writeFile(filePath, optimized);

    this.logger.log(`保存链图标: ${filePath}`);
    return filePath;
  }

  /**
   * 保存符号图标
   */
  async saveSymbol(symbol: string, buffer: Buffer): Promise<string> {
    const filePath = this.getSymbolPath(symbol);
    const optimized = await this.optimizeImage(buffer);
    await fs.writeFile(filePath, optimized);

    this.logger.log(`保存符号图标: ${filePath}`);
    return filePath;
  }

  /**
   * 读取文件（如果不存在返回 null）
   */

  async readFile(filePath: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 获取代币图标
   */
  async getToken(chainId: number, address: string): Promise<Buffer | null> {
    const filePath = this.getTokenPath(chainId, address);
    return this.readFile(filePath);
  }

  /**
   * 获取链图标
   */
  async getChain(chainId: number): Promise<Buffer | null> {
    const filePath = this.getChainPath(chainId);
    return this.readFile(filePath);
  }

  /**
   * 获取符号图标
   */
  async getSymbol(symbol: string): Promise<Buffer | null> {
    const filePath = this.getSymbolPath(symbol);
    return this.readFile(filePath);
  }

  /**
   * 删除代币图标
   */
  async deleteToken(chainId: number, address: string): Promise<void> {
    const filePath = this.getTokenPath(chainId, address);
    try {
      await fs.unlink(filePath);
      this.logger.log(`删除代币图标: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 删除链图标
   */
  async deleteChain(chainId: number): Promise<void> {
    const filePath = this.getChainPath(chainId);
    try {
      await fs.unlink(filePath);
      this.logger.log(`删除链图标: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 图片优化：调整大小、转换格式
   */
  private async optimizeImage(
    buffer: Buffer,
    size: number = 128,
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(size, size, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();
    } catch (error) {
      this.logger.warn(`图片优化失败，使用原图: ${error.message}`);
      return buffer;
    }
  }

  /**
   * 从外部 URL 下载图片
   */

  async downloadFromUrl(url: string): Promise<Buffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new NotFoundException(`无法下载图片: ${url}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * 列出某个链的所有代币图标
   */
  async listTokens(chainId: number): Promise<string[]> {
    const chainDir = path.join(this.tokensDir, chainId.toString());
    try {
      const files = await fs.readdir(chainDir);
      return files.filter((f) => f.endsWith('.png'));
    } catch {
      return [];
    }
  }

  /**
   * 列出所有链图标
   */
  async listChains(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.chainsDir);
      return files.filter((f) => f.endsWith('.png'));
    } catch {
      return [];
    }
  }

  /**
   * 列出所有符号图标
   */
  async listSymbols(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.symbolsDir);
      return files.filter((f) => f.endsWith('.png'));
    } catch {
      return [];
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStats(): Promise<{
    tokensCount: number;
    chainsCount: number;
    symbolsCount: number;
    totalSize: number;
  }> {
    let totalSize = 0;
    let tokensCount = 0;
    let chainsCount = 0;
    let symbolsCount = 0;

    // 统计代币图标
    try {
      const chainDirs = await fs.readdir(this.tokensDir);
      for (const chainDir of chainDirs) {
        const chainPath = path.join(this.tokensDir, chainDir);
        const stat = await fs.stat(chainPath);
        if (stat.isDirectory()) {
          const files = await fs.readdir(chainPath);
          tokensCount += files.length;
          for (const file of files) {
            const filePath = path.join(chainPath, file);
            const fileStat = await fs.stat(filePath);
            totalSize += fileStat.size;
          }
        }
      }
    } catch {
      // 目录不存在
    }

    // 统计链图标
    try {
      const chainFiles = await fs.readdir(this.chainsDir);
      chainsCount = chainFiles.length;
      for (const file of chainFiles) {
        const filePath = path.join(this.chainsDir, file);
        const stat = await fs.stat(filePath);
        totalSize += stat.size;
      }
    } catch {
      // 目录不存在
    }

    // 统计符号图标
    try {
      const symbolFiles = await fs.readdir(this.symbolsDir);
      symbolsCount = symbolFiles.length;
      for (const file of symbolFiles) {
        const filePath = path.join(this.symbolsDir, file);
        const stat = await fs.stat(filePath);
        totalSize += stat.size;
      }
    } catch {
      // 目录不存在
    }

    return {
      tokensCount,
      chainsCount,
      symbolsCount,
      totalSize,
    };
  }
}
