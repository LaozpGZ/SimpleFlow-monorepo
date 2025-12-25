/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RateLimitMiddleware } from './rate-limit.middleware';
import { RequestLoggerMiddleware } from './request-logger.middleware';

/**
 * 中间件模块
 * 注册全局中间件
 */
@Module({
  providers: [RateLimitMiddleware, RequestLoggerMiddleware],
  exports: [RateLimitMiddleware, RequestLoggerMiddleware],
})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 请求日志中间件应用于所有路由
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');

    // 速率限制中间件应用于所有路由（可根据需要排除特定路由）
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
