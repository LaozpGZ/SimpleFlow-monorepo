import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Header,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetsService } from './services/assets.service';
import { UploadAssetDto, AssetType } from './dto/asset.dto';

/**
 * 图标 CDN 控制器
 *
 * 功能：代理 CDN 图片，返回图片二进制数据（与 CDN 行为一致）
 *
 * 路由说明:
 * - GET  /assets/token/:chainId/:address     - 返回代币图标（图片二进制）
 * - GET  /assets/symbol/:symbol              - 返回符号图标（图片二进制）
 * - GET  /assets/chain/:chainId              - 返回链图标（图片二进制）
 * - POST /assets/tokens/batch                - 批量获取图标 URL（JSON，用于批量查询）
 * - POST /assets/token/upload                - 上传代币图标
 * - POST /assets/chain/upload                - 上传链图标
 * - POST /assets/symbol/upload               - 上传符号图标
 * - POST /assets/import                      - 批量导入
 * - DELETE /assets/token/:chainId/:address   - 删除代币图标
 * - GET  /assets/stats                       - 获取统计信息
 * - GET  /assets/list                        - 列出资源
 * - GET  /assets/health                      - 健康检查
 * - GET  /assets/                            - API 信息
 */
@Controller('assets')
export class AssetsController {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * 获取代币图标
   * 直接返回图片二进制数据，与 CDN 行为一致
   *
   * 示例: GET /assets/token/56/0x55d398326f99059ff775485246999027b3197955
   *
   * 响应: 图片二进制数据 (image/png)
   *       如果本地没有，会自动从 CDN 下载并缓存
   */
  @Get('token/:chainId/:address')
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=86400, immutable') // 缓存24小时
  async getTokenIcon(
    @Param('chainId') chainIdStr: string,
    @Param('address') address: string,
    @Res() res: Response,
  ) {
    const chainId = parseInt(chainIdStr, 10);
    try {
      const buffer = await this.assetsService.getTokenIcon(chainId, address);
      res.send(buffer);
    } catch (error) {
      // 如果本地没有，尝试从 CDN 代理
      try {
        const proxiedImage = await this.assetsService.proxyTokenIcon(
          chainId,
          address,
        );
        res.send(proxiedImage);
      } catch (proxyError) {
        throw new NotFoundException(`代币图标不存在: ${chainId}/${address}`);
      }
    }
  }

  /**
   * 获取符号图标
   * 直接返回图片二进制数据，与 CDN 行为一致
   *
   * 示例: GET /assets/symbol/CAKE
   *
   * 响应: 图片二进制数据 (image/png)
   */
  @Get('symbol/:symbol')
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=86400, immutable')
  async getSymbolIcon(@Param('symbol') symbol: string, @Res() res: Response) {
    try {
      const buffer = await this.assetsService.getSymbolIcon(symbol);
      res.send(buffer);
    } catch (error) {
      // 如果本地没有，尝试从 CDN 代理
      try {
        const proxiedImage = await this.assetsService.proxySymbolIcon(symbol);
        res.send(proxiedImage);
      } catch (proxyError) {
        throw new NotFoundException(`符号图标不存在: ${symbol}`);
      }
    }
  }

  /**
   * 获取链图标
   * 直接返回图片二进制数据，与 CDN 行为一致
   *
   * 示例: GET /assets/chain/56
   *
   * 响应: 图片二进制数据 (image/png)
   */
  @Get('chain/:chainId')
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=86400, immutable')
  async getChainIcon(
    @Param('chainId') chainIdStr: string,
    @Res() res: Response,
  ) {
    const chainId = parseInt(chainIdStr, 10);
    try {
      const buffer = await this.assetsService.getChainIcon(chainId);
      res.send(buffer);
    } catch (error) {
      // 如果本地没有，尝试从 CDN 代理
      try {
        const proxiedImage = await this.assetsService.proxyChainIcon(chainId);
        res.send(proxiedImage);
      } catch (proxyError) {
        throw new NotFoundException(`链图标不存在: ${chainId}`);
      }
    }
  }

  /**
   * 批量获取代币图标 URL
   * 返回 JSON 格式，用于前端批量查询
   *
   * 示例: POST /assets/tokens/batch
   * Body: { chainId: 56, addresses: ["0x...", "0x..."] }
   *
   * 响应: { success: true, data: [{ url, fallbackUrls[], ... }] }
   */
  @Post('tokens/batch')
  @Header('Cache-Control', 'public, max-age=300') // 批量请求缓存5分钟
  async getBatchTokenIcons(
    @Body() body: { chainId: number; addresses: string[] },
  ) {
    if (!body.chainId || !body.addresses || !Array.isArray(body.addresses)) {
      throw new BadRequestException('Invalid request body');
    }
    return this.assetsService.getBatchTokenUrls(body.chainId, body.addresses);
  }

  /**
   * 上传代币图标
   *
   * 示例: POST /assets/token/upload
   * Content-Type: multipart/form-data
   * Body: chainId, address, file
   */
  @Post('token/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTokenIcon(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAssetDto,
  ) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    // 验证文件类型
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('只支持图片文件');
    }

    const result = await this.assetsService.uploadTokenIcon(
      body.chainId,
      body.address,
      file.buffer,
    );

    return {
      success: true,
      data: result,
      message: `代币图标上传成功: ${body.chainId}/${body.address}`,
    };
  }

  /**
   * 上传链图标
   *
   * 示例: POST /assets/chain/upload
   * Content-Type: multipart/form-data
   * Body: chainId, file
   */
  @Post('chain/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadChainIcon(
    @UploadedFile() file: Express.Multer.File,
    @Body('chainId') chainIdStr: string,
  ) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('只支持图片文件');
    }

    const chainId = parseInt(chainIdStr, 10);
    const result = await this.assetsService.uploadChainIcon(
      chainId,
      file.buffer,
    );

    return {
      success: true,
      data: result,
      message: `链图标上传成功: ${chainId}`,
    };
  }

  /**
   * 上传符号图标
   *
   * 示例: POST /assets/symbol/upload
   * Content-Type: multipart/form-data
   * Body: symbol, file
   */
  @Post('symbol/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSymbolIcon(
    @UploadedFile() file: Express.Multer.File,
    @Body('symbol') symbol: string,
  ) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('只支持图片文件');
    }

    const result = await this.assetsService.uploadSymbolIcon(
      symbol,
      file.buffer,
    );

    return {
      success: true,
      data: result,
      message: `符号图标上传成功: ${symbol}`,
    };
  }

  /**
   * 删除代币图标
   *
   * 示例: DELETE /assets/token/56/0x55d398326f99059ff775485246999027b3197955
   */
  @Delete('token/:chainId/:address')
  async deleteTokenIcon(
    @Param('chainId') chainIdStr: string,
    @Param('address') address: string,
  ) {
    const chainId = parseInt(chainIdStr, 10);
    const result = await this.assetsService.deleteTokenIcon(chainId, address);

    return {
      success: true,
      data: result,
      message: `代币图标已删除: ${chainId}/${address}`,
    };
  }

  /**
   * 删除链图标
   *
   * 示例: DELETE /assets/chain/56
   */
  @Delete('chain/:chainId')
  async deleteChainIcon(@Param('chainId') chainIdStr: string) {
    const chainId = parseInt(chainIdStr, 10);
    const result = await this.assetsService.deleteChainIcon(chainId);

    return {
      success: true,
      data: result,
      message: `链图标已删除: ${chainId}`,
    };
  }

  /**
   * 批量导入代币列表
   *
   * 示例: POST /assets/import
   * Body: { chainId: 56, tokens: [{ address: "0x...", symbol: "CAKE" }] }
   */
  @Post('import')
  async importTokenList(
    @Body()
    dto: {
      chainId: number;
      tokens: Array<{ address: string; symbol: string }>;
    },
  ) {
    const result = await this.assetsService.importTokenList(
      dto.chainId,
      dto.tokens,
    );

    return {
      success: true,
      data: result,
      message: `批量导入完成: 成功 ${result.success}, 失败 ${result.failed}`,
    };
  }

  /**
   * 获取统计信息
   *
   * 示例: GET /assets/stats
   */
  @Get('stats')
  async getStats() {
    const stats = await this.assetsService.getStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * 列出资源
   *
   * 示例: GET /assets/list?type=token&chainId=56
   */
  @Get('list')
  async listAssets(
    @Query('type') type: AssetType,
    @Query('chainId') chainIdStr?: string,
  ) {
    const chainId = chainIdStr ? parseInt(chainIdStr, 10) : undefined;
    const items = await this.assetsService.listAssets(type, chainId);

    return {
      success: true,
      data: {
        type,
        chainId,
        items,
        count: items.length,
      },
    };
  }

  /**
   * 健康检查
   *
   * 示例: GET /assets/health
   */
  // eslint-disable-next-line class-methods-use-this
  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'assets-api',
    };
  }

  /**
   * API 信息
   *
   * 示例: GET /assets/
   */
  // eslint-disable-next-line class-methods-use-this
  @Get()
  async info() {
    return {
      name: 'Assets API',
      version: '1.0.0',
      description: 'Icon CDN proxy - returns image binary like original CDN',
      endpoints: {
        token: 'GET /assets/token/:chainId/:address (returns image)',
        chain: 'GET /assets/chain/:chainId (returns image)',
        symbol: 'GET /assets/symbol/:symbol (returns image)',
        batch: 'POST /assets/tokens/batch (returns JSON)',
        health: 'GET /assets/health',
        info: 'GET /assets/',
      },
    };
  }
}
