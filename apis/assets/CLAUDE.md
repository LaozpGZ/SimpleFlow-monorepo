[根目录](../../CLAUDE.md) > [apis](../) > **assets**

---

# apis/assets - 图标 CDN API

> 最后更新：2025-12-25 12:41:00

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-25 12:41:00 | 初始化 | 首次创建模块文档，实现与 NestJS 后端格式统一的 JSON API |

---

## 模块职责

`apis/assets` 是 PancakeSwap 的图标 CDN Cloudflare Workers API。

**核心功能：**
- 提供代币图标 URL（JSON 格式）
- 提供链图标 URL（JSON 格式）
- 提供符号图标 URL（JSON 格式）
- 批量获取图标 URL
- **重要**：返回格式与 NestJS 后端保持完全一致

---

## 入口与启动

### 包信息

```json
{
  "name": "assets",
  "version": "1.0.0",
  "private": true
}
```

### 部署命令

```bash
# 开发模式
wrangler dev

# 部署
wrangler publish
```

---

## 对外接口

### API 端点

```typescript
// 获取代币图标 URL
GET /assets/token/:chainId/:address
// 响应: { url, fallbackUrls[], chainId, address, symbol?, type: "token" }

// 获取链图标 URL
GET /assets/chain/:chainId
// 响应: { url, fallbackUrls[], chainId, type: "chain" }

// 获取符号图标 URL
GET /assets/symbol/:symbol
// 响应: { url, fallbackUrls[], chainId: 0, symbol, type: "symbol" }

// 批量获取代币图标
POST /assets/tokens/batch
// Body: { chainId: number, addresses: string[] }
// 响应: { success: true, data: IconResponse[] }

// 健康检查
GET /assets/health
// 响应: { status, timestamp, service }

// API 信息
GET /assets/
// 响应: { name, version, description, endpoints }
```

**重要：** 所有路由都带有 `/assets` 前缀，与 NestJS 后端完全一致！

---

## 响应格式

### IconResponse（与 NestJS 后端一致）

```typescript
interface IconResponse {
  url: string           // 主图标 URL
  fallbackUrls: string[] // 备用图标 URL 列表
  chainId: number       // 链 ID
  address?: string      // 代币地址（token 类型）
  symbol?: string       // 代币符号
  type: 'token' | 'chain' | 'symbol'
}
```

---

## 关键依赖与配置

### 依赖

```json
{
  "dependencies": {
    "@pancakeswap/worker-utils": "workspace:*",
    "itty-router": "^4.0.20",
    "itty-router-extras": "^0.1.3"
  }
}
```

---

## 数据模型

### 文件结构

```
apis/assets/src/
├── index.ts         # 主入口
└── bindings.d.ts    # Cloudflare 类型
```

---

## CDN 源

### 图标来源优先级

1. **PancakeSwap Token CDN**: `https://tokens.pancakeswap.finance`
2. **TrustWallet CDN**: `https://assets-cdn.trustwallet.com`
3. **PancakeSwap Assets CDN**: `https://assets.pancakeswap.finance`

---

## 相关文件清单

- `src/index.ts` - 主入口
- `wrangler.toml` - Cloudflare 配置

---

*本模块文档由 AI 架构师生成。*
