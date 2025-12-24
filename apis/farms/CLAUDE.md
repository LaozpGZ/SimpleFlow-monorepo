[根目录](../../CLAUDE.md) > [apis](../) > **farms**

---

# apis/farms - 农场数据 API

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`apis/farms` 是 PancakeSwap 的农场数据 Cloudflare Workers API。

**核心功能：**
- 提供 V3 农场数据 API
- KV 存储集成
- 边缘计算优化
- 多链农场数据

---

## 入口与启动

### 包信息

```json
{
  "name": "farms",
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
// V3 农场数据
GET /v3/:chainId

// 农场配置
GET /config
```

---

## 关键依赖与配置

### 依赖

```json
{
  "dependencies": {
    "hono": "^4.0.0"
  }
}
```

---

## 数据模型

### 文件结构

```
apis/farms/src/
├── index.ts      # 主入口
├── handler.ts    # 请求处理器
├── provider.ts   # 数据提供者
├── helper.ts     # 工具函数
├── v3.ts         # V3 农场逻辑
├── kv.ts         # KV 存储
└── bindings.d.ts # Cloudflare 类型
```

---

## 相关文件清单

- `src/index.ts` - 主入口
- `src/v3.ts` - V3 农场逻辑
- `wrangler.toml` - Cloudflare 配置

---

*本模块文档由 AI 架构师生成。*
