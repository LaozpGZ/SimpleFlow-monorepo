# Backend API 迁移规划

> Cloudflare Workers → NestJS (华为云 Docker)
> 创建时间：2025-12-25

---

## 📋 项目概述

### 迁移目标

将现有 Cloudflare Workers API 迁移到 NestJS 架构，部署到华为云服务器。

| 维度 | 现状 | 目标 |
|------|------|------|
| 运行环境 | Cloudflare Workers (边缘计算) | 华为云 Docker (4核8G) |
| 框架 | itty-router / Hono | NestJS |
| 缓存 | Cloudflare KV | 内存缓存 |
| 部署 | `wrangler publish` | Docker + PM2 |
| 域名 | `farms-api.pancakeswap.com` | `api.simpleflow.finance` |

### 迁移动机

- ✅ **统一架构**：团队更熟悉传统 Node.js
- ✅ **开发效率**：NestJS 生态更完善，调试更方便
- ✅ **成本控制**：自建服务器可控成本

---

## 🏗️ 架构设计

### 项目结构

```
apps/backend-api/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── app.module.ts              # 根模块
│   ├── config/                    # 配置
│   │   ├── chain.config.ts        # 链配置
│   │   ├── cache.config.ts        # 缓存配置
│   │   └── rpc.config.ts          # RPC 配置
│   ├── common/                    # 通用模块
│   │   ├── cache/                 # 内存缓存服务
│   │   ├── rpc/                   # RPC 客户端
│   │   ├── logger/                # 日志
│   │   ├── filters/               # 异常过滤器
│   │   ├── interceptors/          # 拦截器
│   │   └── decorators/            # 自定义装饰器
│   ├── modules/
│   │   ├── farms/                 # 农场数据模块
│   │   │   ├── farms.controller.ts
│   │   │   ├── farms.service.ts
│   │   │   ├── farms.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   ├── routing/               # 路由计算模块
│   │   │   ├── routing.controller.ts
│   │   │   ├── routing.service.ts
│   │   │   ├── routing.module.ts
│   │   │   └── dto/
│   │   ├── pools/                 # 池子数据模块
│   │   │   ├── pools.controller.ts
│   │   │   ├── pools.service.ts
│   │   │   └── pools.module.ts
│   │   └── health/                # 健康检查模块
│   │       ├── health.controller.ts
│   │       └── health.module.ts
│   └── providers/                 # 外部服务
│       ├── subgraph/              # 子图查询
│       └── onchain/               # 链上数据
├── test/
│   ├── unit/
│   └── e2e/
├── .env.example                   # 环境变量示例
├── .env.local                     # 本地开发环境
├── Dockerfile                     # Docker 配置
├── docker-compose.yml             # Docker Compose
├── nest-cli.json                  # NestJS CLI 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json
└── README.md
```

### 技术栈

```json
{
  "框架": "NestJS 10.x",
  "HTTP": "@nestjs/platform-express",
  "验证": "class-validator + class-transformer",
  "缓存": "cache-manager",
  "日志": "nestjs-pino",
  "配置": "@nestjs/config",
  "调度": "@nestjs/schedule",
  "SDK复用": [
    "@pancakeswap/smart-router",
    "@pancakeswap/farms",
    "@pancakeswap/v3-sdk",
    "@pancakeswap/chains",
    "@pancakeswap/tokens"
  ],
  "区块链": "viem",
  "测试": "jest"
}
```

---

## 🔄 API 接口映射

### Farms API

| Cloudflare Workers | NestJS | 说明 |
|-------------------|--------|------|
| `GET /:chainId` | `GET /farms/:chainId` | 获取农场数据 |
| `GET /price/cake` | `GET /farms/price/cake` | CAKE 价格 |
| `GET /v3/:chainId/liquidity/:address` | `GET /farms/v3/:chainId/liquidity/:address` | V3 流动性 |

### Routing API

| Cloudflare Workers | NestJS | 说明 |
|-------------------|--------|------|
| `GET /v0/quote` | `GET /routing/quote` | 获取报价（GET） |
| `POST /v0/quote` | `POST /routing/quote` | 获取报价（POST） |
| `GET /pools` | `GET /routing/pools` | 池子数据 |

### Health Check

| 端点 | 说明 |
|------|------|
| `GET /health` | 健康检查 |

---

## 📦 数据格式约定

### Farms API 响应格式

```typescript
// GET /farms/:chainId
interface FarmsResponse {
  updatedAt: string           // ISO 时间戳
  poolLength: number          // 池子数量
  regularCakePerBlock: number // 每块奖励
  data: FarmData[]            // 农场数据
}

interface FarmData {
  pid: number
  lpAddress: string
  lpSymbol: string
  lpTotalInQuoteToken: string
  quoteTokenPriceBusd: string
  cakeApr: string
  // ... 其他字段
}
```

### Routing API 响应格式

```typescript
// POST /routing/quote
interface QuoteResponse {
  trade?: {
    route: Route[]
    inputAmount: CurrencyAmount
    outputAmount: CurrencyAmount
    executionPrice: Price
    // ...
  }
}
```

---

## 🚀 迁移路线图

### Phase 1: 基础架构搭建 (1-2周)

- [x] 创建 NestJS 项目
- [ ] 配置 workspace 依赖
- [ ] 搭建缓存层（内存缓存）
- [ ] 搭建 RPC 连接池
- [ ] 配置日志系统
- [ ] 配置 Docker 环境
- [ ] 健康检查端点

### Phase 2: Farms API 迁移 (1周)

- [ ] 创建 FarmsModule
- [ ] 迁移 `GET /:chainId` 端点
- [ ] 迁移 CAKE 价格查询
- [ ] 迁移 V3 流动性查询
- [ ] 单元测试
- [ ] 并行测试验证

### Phase 3: Routing API 迁移 (2周)

- [ ] 创建 RoutingModule
- [ ] 迁移 `GET /v0/quote`
- [ ] 迁移 `POST /v0/quote`
- [ ] 迁移池子查询端点
- [ ] 单元测试
- [ ] 性能测试对比
- [ ] 并行测试验证

### Phase 4: 部署上线 (1周)

- [ ] Docker 镜像构建
- [ ] 华为云服务器部署
- [ ] Nginx 反向代理配置
- [ ] 域名解析配置
- [ ] 监控告警配置
- [ ] 灰度切换流量
- [ ] 下线 Cloudflare Workers

---

## 🔧 环境配置

### 服务器配置

```
服务商：华为云
配置：4核 8G
操作系统：Ubuntu 22.04 LTS
```

### 域名配置

```
域名：api.simpleflow.finance
DNS A 记录 → 华为云公网 IP
```

### 环境变量

```bash
# .env.production
NODE_ENV=production
PORT=3000

# RPC 配置
RPC_BSC_MAINNET=https://bsc-dataseed.binance.org
RPC_ETHEREUM_MAINNET=https://eth.llamarpc.com
# ... 其他链 RPC

# 子图配置
SUBGRAPH_BSC_V3=https://api.thegraph.com/subgraphs/name/...
SUBGRAPH_BSC_V2=https://api.thegraph.com/subgraphs/name/...

# 缓存配置
CACHE_TTL=900
```

---

## 📝 前端配置修改

### 修改文件

```typescript
// apps/web/src/config/constants/endpoints.ts

// 修改前：
export const FARMS_API = 'https://farms-api.pancakeswap.com'

// 修改后（使用环境变量）：
export const FARMS_API = process.env.NEXT_PUBLIC_FARMS_API || 'https://api.simpleflow.finance'
```

### 环境变量

```bash
# .env.production
NEXT_PUBLIC_FARMS_API=https://api.simpleflow.finance
```

---

## ⚠️ 注意事项

### 1. SDK 复用

所有业务逻辑都在 `packages/` 中，API 层只是 HTTP 包装：

```typescript
// ✅ 正确：复用 SDK
import { SmartRouter } from '@pancakeswap/smart-router'
const trade = await SmartRouter.getBestTrade(...)

// ❌ 错误：重写业务逻辑
// 不要在 API 层重写路由计算逻辑！
```

### 2. 返回格式一致性

必须保证和 Cloudflare Workers 返回格式完全一致，前端才能无缝切换。

### 3. 缓存策略

- Workers：KV 缓存（持久化）
- NestJS：内存缓存（重启丢失）

可以接受，因为缓存丢失后会重新计算。

### 4. CORS 配置

```typescript
// main.ts
app.enableCors({
  origin: ['https://simpleflow.finance'],
  methods: ['GET', 'POST', 'OPTIONS'],
})
```

---

## 🔍 测试策略

### 单元测试

```bash
# 运行单元测试
pnpm test

# 覆盖率
pnpm test:cov
```

### E2E 测试

```bash
# 运行 E2E 测试
pnpm test:e2e
```

### 并行测试

同时运行 Workers 和 NestJS，对比返回结果：

```typescript
const [workersResult, nestjsResult] = await Promise.all([
  fetch('https://farms-api.pancakeswap.com/56').then(r => r.json()),
  fetch('http://localhost:3000/farms/56').then(r => r.json()),
])

console.log(deepEqual(workersResult, nestjsResult))
```

---

## 📚 参考资料

- [NestJS 官方文档](https://nestjs.com/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [@pancakeswap/smart-router](../../packages/smart-router/README.md)
- [@pancakeswap/farms](../../packages/farms/README.md)

---

## 📝 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-25 | 创建 | 初始规划文档 |
