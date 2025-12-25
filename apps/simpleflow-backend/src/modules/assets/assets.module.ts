import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { AssetsController } from './assets.controller';
import { AssetsService } from './services/assets.service';
import { AssetStorageService } from './services/asset-storage.service';

/**
 * 资源/图标管理模块
 *
 * 提供以下功能:
 * - 本地存储代币、链、符号图标
 * - 从外部CDN代理下载并缓存
 * - 上传/删除图标管理
 * - 图片优化处理
 */
@Module({
  imports: [
    ConfigModule,
    // Multer 配置，用于处理文件上传
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetStorageService],
  exports: [AssetsService, AssetStorageService],
})
export class AssetsModule {}
