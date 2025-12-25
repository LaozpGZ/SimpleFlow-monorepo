import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config';
import { AppCacheModule } from './common/cache/cache.module';
import { RpcModule } from './common/rpc/rpc.module';
import { AppLoggerModule } from './common/logger/logger.module';
import { MiddlewareModule } from './common/middleware/middleware.module';
import { HealthModule } from './modules/health/health.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { PoolsModule } from './modules/pools/pools.module';
import { FarmsModule } from './modules/farms/farms.module';
import { RoutingModule } from './modules/routing/routing.module';
import { AssetsModule } from './modules/assets/assets.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config.app],
      envFilePath: ['.env.local', '.env'],
    }),

    // 通用模块
    AppCacheModule,
    RpcModule,
    AppLoggerModule,
    MiddlewareModule,

    // 功能模块
    HealthModule,
    TokensModule,
    PoolsModule,
    FarmsModule,
    RoutingModule,
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
