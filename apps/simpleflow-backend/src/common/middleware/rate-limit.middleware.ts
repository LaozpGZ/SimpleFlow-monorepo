import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 速率限制中间件
 * 基于 IP 的简单内存速率限制
 *
 * 注意：生产环境建议使用 Redis 等分布式缓存
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  // 存储每个 IP 的请求计数和时间戳
  private readonly ipRequestMap = new Map<
    string,
    { count: number; resetTime: number }
  >();

  // 配置
  private readonly windowMs = parseInt(
    process.env.RATE_LIMIT_WINDOW || '60000',
    10,
  ); // 时间窗口（默认 60 秒）

  private readonly maxRequests = parseInt(
    process.env.RATE_LIMIT_MAX || '100',
    10,
  ); // 最大请求数（默认 100）

  use(req: Request, res: Response, next: NextFunction): void {
    const ip = this.getClientIp(req);
    const now = Date.now();

    // 获取或创建 IP 记录
    let record = this.ipRequestMap.get(ip);

    // 如果没有记录或时间窗口已过，重置计数
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.ipRequestMap.set(ip, record);
      next();
      return;
    }

    // 增加计数
    record.count++;

    // 检查是否超过限制
    if (record.count > this.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      this.logger.warn(
        `Rate limit exceeded for IP: ${ip}, Count: ${record.count}`,
      );

      res.setHeader('Retry-After', retryAfter.toString());
      res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
        retryAfter,
      });
      return;
    }

    // 设置速率限制响应头
    res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, this.maxRequests - record.count).toString(),
    );
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(record.resetTime).toISOString(),
    );

    next();
  }

  /**
   * 获取客户端 IP
   */
  // eslint-disable-next-line class-methods-use-this
  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * 清理过期记录（可选的维护方法）
   */
  cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.ipRequestMap.entries()) {
      if (now > record.resetTime) {
        this.ipRequestMap.delete(ip);
      }
    }
  }
}
