[根目录](../../CLAUDE.md) > [packages](../) > **solana-clmm-sdk**

---

# packages/solana-clmm-sdk - Solana CLMM SDK

> 最后更新：2025-12-24 19:30:00 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:30:00 | 深度扫描 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/solana-clmm-sdk` 是 PancakeSwap Solana CLMM（Concentrated Liquidity Market Maker）SDK。

**核心功能：**
- 集中流动性头寸管理
- Tick 范围管理
- CLMM 池交互
- 费用收集

**类似 EVM 的 V3**：CLMM 是 Solana 版本的集中流动性做市商，类似于 Uniswap V3。

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/solana-clmm-sdk",
  "version": "0.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs"
}
```

### 主入口

```typescript
// src/index.ts
export * from './utils'          # 工具函数
export * from './constants'      # 常量
export * from './clmm'           # CLMM 核心逻辑
export * from './client'         # API 客户端
```

---

## 核心模块

### 1. CLMM 核心 (clmm/)

**功能**：
- CLMM 池管理
- 头寸创建和管理
- Tick 管理
- 费用计算

**关键文件**：
```
clmm/
├── ammConfigs.ts       # AMM 配置
└── programId.ts        # 程序 ID
```

### 2. 工具函数 (utils/)

**功能**：
- 集群检测
- 工具函数

```typescript
// 获取当前集群
export function getCurrentCluster(): Cluster {
  // mainnet-beta | devnet | testnet
}
```

### 3. 客户端 (client/)

**功能**：
- API 调用
- 数据获取

---

## 关键依赖

```typescript
import {
  Connection,
  PublicKey
} from '@solana/web3.js'

import {
  createClient
} from 'openapi-fetch'  # OpenAPI 客户端
```

---

## CLMM vs V3 对比

| 特性 | CLMM (Solana) | V3 (EVM) |
|------|--------------|-----------|
| 集中流动性 | ✅ | ✅ |
| Tick 管理 | ✅ | ✅ |
| 费用等级 | 固定 | 可配置 |
| 头寸表示 | 账户 | NFT |
| Gas 优化 | 无 Gas | 需要考虑 Gas |

---

## 核心概念

### 1. Tick 范围

```typescript
interface Position {
  pool: PublicKey
  tickLower: number
  tickUpper: number
  liquidity: BN
}
```

### 2. 费用收集

```typescript
// 收集费用
async function collectFees(
  position: PublicKey,
  owner: PublicKey
): Promise<Fees> {
  // 实现细节
}
```

---

## 测试策略

```bash
pnpm --filter @pancakeswap/solana-clmm-sdk test
```

---

## 常见问题 (FAQ)

### Q: CLMM 和 V3 有什么区别？

A:
- **CLMM**：Solana 版本，使用账户模型
- **V3**：EVM 版本，使用 NFT 表示头寸

核心算法相同，但实现细节不同。

---

## 相关文件清单

- `src/clmm/ammConfigs.ts` - AMM 配置 ⭐
- `src/utils/getCurrentCluster.ts` - 集群检测

---

*本模块文档由 AI 架构师生成。*
