import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { AppCacheModule } from '@/common/cache/cache.module';
import { RpcModule } from '@/common/rpc/rpc.module';

/**
 * Pools 模块
 * 提供交易池数据查询功能
 */
@Module({
  imports: [AppCacheModule, RpcModule],
  controllers: [PoolsController],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
