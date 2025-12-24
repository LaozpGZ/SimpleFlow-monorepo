# SimpleFlow Backend API

SimpleFlow 的 NestJS 后端 API 服务，提供 Farms、Routing 和 Token List 功能。

## 技术栈

- **NestJS** - Node.js 框架
- **TypeScript** - 类型安全
- **viem** - 以太坊交互
- **@pancakeswap/*** - 复用 PancakeSwap SDK

## 项目结构

```
apps/simpleflow-backend/
├── src/
│   ├── main.ts                    # 入口文件
│   ├── app.module.ts              # 根模块
│   ├── config/                    # 配置模块
│   ├── common/                    # 通用模块
│   │   ├── cache/                 # 内存缓存
│   │   ├── rpc/                   # RPC 连接池
│   │   ├── logger/                # 日志
│   │   └── filters/               # 异常过滤器
│   └── modules/
│       ├── health/                # 健康检查
│       ├── tokens/                # Token List
│       ├── farms/                 # Farms API
│       └── routing/               # Routing API
├── tokens/                        # Token 数据源
├── scripts/                       # 构建脚本
├── Dockerfile                     # Docker 配置
└── docker-compose.yml             # Docker Compose
```

## 开发

### 安装依赖

```bash
pnpm install
```

### 构建 Token List

```bash
pnpm build:tokens
```

### 运行开发服务器

```bash
pnpm start:dev
```

服务将在 `http://localhost:3000` 启动。

### 构建

```bash
pnpm build
```

## API 端点

### Health

- `GET /health` - 健康检查

### Tokens

- `GET /tokens/list/default` - 获取默认 token list
- `GET /tokens/list/extended` - 获取扩展 token list
- `GET /tokens/:chainId` - 获取指定链的代币
- `GET /tokens/search/:query` - 搜索代币

### Farms

- `GET /farms/:chainId` - 获取农场数据
- `GET /farms/price/cake` - 获取 CAKE 价格
- `GET /farms/v3/:chainId/liquidity/:address` - 获取 V3 流动性

### Routing

- `GET /routing/quote` - 获取报价（GET）
- `POST /routing/quote` - 获取报价（POST）
- `GET /routing/pools?chainId=56` - 获取池子数据

## 部署

### 使用 Docker

```bash
# 构建镜像
docker build -t simpleflow-backend -f apps/simpleflow-backend/Dockerfile .

# 运行容器
docker run -p 3000:3000 --env-file apps/simpleflow-backend/.env.production simpleflow-backend
```

### 使用 Docker Compose

```bash
cd apps/simpleflow-backend
docker-compose up -d
```

## 环境变量

参考 `.env.example` 文件配置环境变量。

```bash
cp .env.example .env.local
```

## 添加新代币

编辑 `tokens/simpleflow-default.json` 或 `tokens/simpleflow-extended.json`，然后运行：

```bash
pnpm build:tokens
```
