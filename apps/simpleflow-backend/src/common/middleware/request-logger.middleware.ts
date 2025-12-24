import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 请求日志中间件
 * 记录所有 HTTP 请求的详细信息
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '-';

    // 记录请求开始
    this.logger.debug(`→ ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // 监听响应完成事件
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // 根据状态码选择日志级别
      const message = `← ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${ip}`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else if (duration > 1000) {
        // 慢请求警告
        this.logger.warn(`${message} (SLOW)`);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
