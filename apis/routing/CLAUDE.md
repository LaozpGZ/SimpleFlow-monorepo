[根目录](../../CLAUDE.md) > [apis](../) > **routing**

---

# apis/routing - 路由计算 API

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`apis/routing` 是 PancakeSwap 的路由计算 Cloudflare Workers API。

**核心功能：**
- 提供路由计算 REST API
- 获取池子数据
- 子图池数据备份
- 边缘计算优化

---

## 入口与启动

### 包信息

```json
{
  "name": "routing",
  "version": "1.0.0",
  "private": true
}
```

### 部署命令

```bash
# 开发模式
wrangler dev

# 部署
wrangler deploy
```

---

## 对外接口

### API 端点

```typescript
// 路由计算
GET /?from=...&to=...&amount=...

// 池子查询
GET /pools
```

---

## 关键依赖与配置

### 依赖

```json
{
  "dependencies": {
    "@pancakeswap/swap-sdk-core": "workspace:*",
    "@pancakeswap/token-lists": "workspace:*",
    "graphql": "^16.8.1",
    "graphql-request": "5.0.0"
  }
}
```

---

## 数据模型

### 文件结构

```
apis/routing/src/
├── index.ts              # 主入口
├── provider.ts           # 数据提供者
├── pools.ts              # 池子逻辑
├── constants.ts          # 常量
├── queries/
│   └── pools.ts          # 池子查询
├── subgraphPoolBackup.ts # 子图备份
└── bindings.d.ts         # Cloudflare 类型
```

---

## 相关文件清单

- `src/index.ts` - 主入口
- `src/provider.ts` - 数据提供者
- `wrangler.toml` - Cloudflare 配置

---

*本模块文档由 AI 架构师生成。*
