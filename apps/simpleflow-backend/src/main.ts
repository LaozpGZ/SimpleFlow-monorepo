/**
 * ⚠️ 必须作为第一行导入！
 * NestJS 依赖注入完全依赖 reflect-metadata 来获取类型元数据
 * 没有它，@Injectable() 装饰器的类无法正确注入依赖
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * 解析 CORS_ORIGIN 环境变量
 * 支持格式：
 * - * 或未设置：允许所有来源
 * - https://example.com：单个域名
 * - https://a.com,https://b.com：多个域名
 */
// eslint-disable-next-line import/no-default-export
const parseCorsOrigin = (
  origin: string | undefined,
): string | RegExp | string[] | boolean => {
  if (!origin || origin === '*') return '*';

  const origins = origin.split(',').map((o) => o.trim());
  if (origins.length === 1) return origins[0];

  return origins;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS 配置（支持多域名白名单）
  app.enableCors({
    origin: parseCorsOrigin(process.env.CORS_ORIGIN),
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86_400, // 24小时预检缓存
  });

  // Swagger API 文档配置
  const config = new DocumentBuilder()
    .setTitle('SimpleFlow Backend API')
    .setDescription(
      'SimpleFlow DEX 后端 API 服务，提供交易池、代币列表、Info Analytics 等功能',
    )
    .setVersion('1.0')
    .addTag('health', '健康检查')
    .addTag('tokens', '代币列表')
    .addTag('pools', '交易池数据')
    .addTag('farms', '农场数据')
    .addTag('routing', '交易路由')
    .addTag('assets', '资源文件')
    .addTag('info', 'Info Analytics 数据')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'SimpleFlow API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on http://localhost:${port}`);

  // eslint-disable-next-line no-console
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`);

  // eslint-disable-next-line no-console
  console.log(
    `📍 CORS: ${
      process.env.CORS_ORIGIN === '*' || !process.env.CORS_ORIGIN
        ? '允许所有来源'
        : process.env.CORS_ORIGIN
    }`,
  );
}
bootstrap();
