import { Module } from '@nestjs/common';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import { AppCacheModule } from '@/common/cache/cache.module';
import { RpcModule } from '@/common/rpc/rpc.module';

/**
 * Info API 模块
 *
 * 提供 PancakeSwap Info 页面所需的数据接口
 */
@Module({
  imports: [AppCacheModule, RpcModule],
  controllers: [InfoController],
  providers: [InfoService],
  exports: [InfoService],
})
export class InfoModule {}
