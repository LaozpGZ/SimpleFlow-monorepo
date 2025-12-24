[根目录](../../CLAUDE.md) > [packages](../) > **solana-core-sdk**

---

# packages/solana-core-sdk - Solana 核心 SDK

> 最后更新：2025-12-24 19:19:46 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:30:00 | 深度扫描 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/solana-core-sdk` 是 PancakeSwap Solana 生态的核心 SDK，基于 Raydium fork 开发。

**核心功能：**
- Raydium 流动性池交互
- Serum DEX 集成
- Stable Swap（稳定币互换）
- 代币交换
- 账户管理
- 指令构建

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/solana-core-sdk",
  "version": "0.1.139-alpha",
  "license": "GPL-3.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

### 主入口

```typescript
// src/index.ts
export * from "./api"           // API 客户端
export * from "./common"         // 通用工具
export * from "./raydium"        // Raydium 集成
export * from "./solana"         // Solana 工具
export * from "./module"         // 模块加载
export * from "./marshmallow"     // 序列化
```

---

## 核心模块

### 1. Raydium 流动性 (raydium/liquidity)

**核心功能**：
- 流动性池管理
- 添加/移除流动性
- Stable Swap（稳定币互换）

**关键文件**：
```
raydium/liquidity/
├── liquidity.ts       # 主流动性逻辑
├── stable.ts          # 稳定币池
├── layout.ts          # 账户布局
├── type.ts            # 类型定义
├── constant.ts        # 常量
├── instruction.ts     # 指令构建
├── serum.ts           # Serum 集成
└── utils.ts           # 工具函数
```

### 2. Raydium 交易 (raydium/tradeV2)

**核心功能**：
- 代币交换路由
- 交易计算
- 最优路径查找

**关键接口**：
```typescript
interface Trade {
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  route: Pool[]
  executionPrice: Price
  priceImpact: Percent
}
```

### 3. Raydium 账户 (raydium/account)

**核心功能**：
- 账户管理
- 账户布局解析
- 账户数据读取

---

## 关键依赖

```typescript
// Solana 核心
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram
} from '@solana/web3.js'

// SPL Token
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'

// 数学库
import BN from 'bn.js'
import Big from 'big.js'
import Decimal from 'decimal.js'

// 工具
import axios from 'axios'
import dayjs from 'dayjs'
```

---

## 核心算法

### 1. 流动性计算

```typescript
// 计算流动性份额
function calculateLiquidity(
  amountA: Big,
  amountB: Big,
  reserveA: Big,
  reserveB: Big
): Big {
  // 根据当前储备计算 LP 代币数量
  const liquidity = amountA.multiply(reserveB).divide(reserveA)
  return Big.min(liquidity, amountB)
}
```

### 2. 稳定币交换

```typescript
// Stable Swap 算法
function calculateStableSwap(
  amountIn: Big,
  reserves: Big[],
  amplificationCoefficient: Big
): Big {
  // 使用 amplification coefficient 计算稳定币交换
  // 参考 Curve Stable Swap 算法
}
```

---

## 跨链兼容性设计

### 1. 地址转换

```typescript
// SOL 和 WSOL 互换
import { solToWSol, isWSol } from './utils'

const wrapped = solToWSol('So11111111111111111111111111111111111111112')
// => 'WRAPPED_SOL_MINT_ADDRESS'
```

### 2. 代币适配

```typescript
// 统一代币接口
interface SPLToken {
  address: string
  chainId: number
  decimals: number
  symbol: string
  name: string
}
```

### 3. RPC 节点选择

```typescript
// 集群配置
const CLUSTERS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
}
```

---

## 文件结构

```
packages/solana-core-sdk/src/
├── api/                    # API 客户端
├── common/                 # 通用工具
├── raydium/                # Raydium 集成 ⭐
│   ├── liquidity/          # 流动性
│   ├── tradeV2/            # 交易
│   ├── account/            # 账户
│   ├── serum/              # Serum DEX
│   └── launchpad/          # Launchpad
├── solana/                 # Solana 工具
├── module/                 # 模块加载
├── marshmallow/            # 序列化
└── index.ts                # 主入口
```

---

## 测试策略

### 测试命令

```bash
# 运行测试
pnpm --filter @pancakeswap/solana-core-sdk test

# 构建
pnpm --filter @pancakeswap/solana-core-sdk build
```

---

## 常见问题 (FAQ)

### Q: 基于 Raydium fork 的原因？

A: Raydium 是 Solana 生态最成熟的 DEX 之一，具有：
- 完善的流动性提供机制
- Serum 集成（订单簿）
- Stable Swap 支持
- 丰富的开发文档

### Q: 如何处理 SOL 和 WSOL？

A: SOL 是原生代币，WSOL 是 Wrapped SOL。交易时需要转换：
```typescript
const wrapped = solToWSol(nativeSolAddress)
```

### Q: 如何与 EVM 链统一接口？

A: 使用统一的数据结构：
```typescript
interface UnifiedCurrencyAmount<T> {
  currency: T
  quotient: BN
  toFixed(): string
}
```

---

## 相关文件清单

### 核心文件

- `src/raydium/liquidity/liquidity.ts` - 流动性逻辑 ⭐
- `src/raydium/tradeV2/trade.ts` - 交易逻辑
- `src/raydium/account/account.ts` - 账户管理

---

## 特殊设计模式

### 1. Fork 模式

基于 Raydium fork，保持与上游兼容：
- 保留核心算法
- 自定义部分逻辑
- 定期同步更新

### 2. 模块化设计

每个功能独立模块：
```typescript
import { Liquidity } from './liquidity'
import { Trade } from './tradeV2'
import { Account } from './account'
```

### 3. 序列化层

使用 Marshmallow 进行数据序列化：
```typescript
import Marshmallow from './marshmallow'
```

---

*本模块文档由 AI 架构师生成。*
