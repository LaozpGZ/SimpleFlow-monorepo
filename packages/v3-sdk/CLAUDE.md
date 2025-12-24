[根目录](../../CLAUDE.md) > [packages](../) > **v3-sdk**

---

# packages/v3-sdk - V3 协议 SDK

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/v3-sdk` 是 PancakeSwap V3 协议的 TypeScript SDK，提供与 V3 智能合约交互的完整工具集。

**核心功能：**
- V3 池子（Pool）实体和计算
- V3 头寸（Position）管理
- V3 路由（Route）计算
- V3 交易（Trade）计算
- Tick（价格点）数学运算
- Multicall 集成

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/v3-sdk",
  "version": "3.9.7",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts"
}
```

### 构建命令

```bash
# 开发模式
pnpm --filter @pancakeswap/v3-sdk dev

# 构建
pnpm --filter @pancakeswap/v3-sdk build

# 测试
pnpm --filter @pancakeswap/v3-sdk test
```

---

## 对外接口

### 主要导出

```typescript
// 实体类
export { Pool } from './entities/pool'
export { Position } from './entities/position'
export { Route } from './entities/route'
export { Trade } from './entities/trade'
export { Tick } from './entities/tick'
export { TickListDataProvider } from './entities/tickListDataProvider'

// 路由器
export { SwapRouter } from './swapRouter'
export { V3Migrator } from './v3Migrator'

// Multicall
export { multicall } from './multicall'
```

### 核心类

```typescript
// Pool - V3 池子
class Pool {
  token0: Token
  token1: Token
  fee: number
  sqrtRatioX96: JSBI
  liquidity: JSBI
  tickCurrent: number

  // 计算价格
  get token0Price(): Price
  get token1Price(): Price

  // 获取输出金额
  getOutputAmount(amount: CurrencyAmount): CurrencyAmount
}

// Position - V3 头寸
class Position {
  pool: Pool
  tickLower: number
  tickUpper: number
  liquidity: JSBI

  // 计算头寸价值
  get amount0(): CurrencyAmount
  get amount1(): CurrencyAmount

  // 创建头寸
  static fromAmounts(...): Position
}

// Route - V3 路由
class Route {
  pools: Pool[]
  input: Currency
  output: Currency

  // 计算中间价格
  get midPrice(): Price
}

// Trade - V3 交易
class Trade {
  route: Route
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount

  // 计算价格影响
  get priceImpact(): Percent

  // 创建交易
  static async fromRoutes(...): Promise<Trade>
}
```

---

## 关键依赖与配置

### 依赖

```json
{
  "dependencies": {
    "@pancakeswap/chains": "workspace:*",
    "@pancakeswap/sdk": "workspace:*",
    "@pancakeswap/swap-sdk-core": "workspace:*",
    "big.js": "^5.2.2",
    "decimal.js-light": "^2.5.0",
    "tiny-invariant": "^1.3.0",
    "toformat": "^2.0.0",
    "viem": "catalog:"
  }
}
```

---

## 数据模型

### 文件结构

```
packages/v3-sdk/src/
├── entities/               # 实体类
│   ├── pool.ts            # 池子实体
│   ├── position.ts        # 头寸实体
│   ├── route.ts           # 路由实体
│   ├── trade.ts           # 交易实体
│   ├── tick.ts            # Tick 实体
│   ├── tickDataProvider.ts
│   └── tickListDataProvider.ts
├── swapRouter.ts          # 交换路由器
├── v3Migrator.ts          # V3 迁移器
├── nonfungiblePositionManager.ts  # NFT 头寸管理
├── staker.ts              # 质押者
├── payments.ts            # 支付相关
├── multicall.ts           # Multicall
├── constants.ts           # 常量
├── internalConstants.ts   # 内部常量
└── utils.ts               # 工具函数
```

### 核心概念

**Pool（池子）**
- 包含两个代币、手续费等级、当前价格和流动性
- 用于计算价格和执行交易

**Position（头寸）**
- 用户在特定价格区间提供的流动性
- 由 NFT 表示
- 可以计算价值和奖励

**Tick（价格点）**
- V3 中离散的价格点
- 每个链有不同的 tick 间距

**Route（路由）**
- 多个池子组成的交易路径
- 用于寻找最优交易路径

**Trade（交易）**
- 具体的交易执行计划
- 包含输入、输出、价格影响等

---

## 测试与质量

### 测试覆盖

- `pool.test.ts` - 池子测试
- `position.test.ts` - 头寸测试
- `route.test.ts` - 路由测试
- `trade.test.ts` - 交易测试
- `tick.test.ts` - Tick 测试
- `swapRouter.test.ts` - 路由器测试
- `payments.test.ts` - 支付测试
- `selfPermit.test.ts` - 自授权测试
- `staker.test.ts` - 质押测试

### 测试命令

```bash
# 运行测试
pnpm --filter @pancakeswap/v3-sdk test

# 更新快照
pnpm --filter @pancakeswap/v3-sdk update:snapshot

# 覆盖率
pnpm --filter @pancakeswap/v3-sdk coverage
```

---

## 常见问题 (FAQ)

### Q: V2 和 V3 SDK 有什么区别？

A:
- **V2**：基于配对（Pair），流动性在整个价格曲线均匀分布
- **V3**：基于池子（Pool），流动性集中在特定价格区间，资金效率更高

### Q: 如何创建 V3 交易？

A:
```typescript
import { Trade, Route, Pool } from '@pancakeswap/v3-sdk'

// 1. 创建池子
const pool = new Pool(token0, token1, fee, sqrtPriceX96, liquidity, tickCurrent)

// 2. 创建路由
const route = new Route([pool], token0, token1)

// 3. 创建交易
const trade = await Trade.fromRoutes(route, amount, TradeType.EXACT_INPUT)
```

### Q: 如何计算 V3 头寸价值？

A:
```typescript
import { Position } from '@pancakeswap/v3-sdk'

const position = new Position({
  pool,
  tickLower,
  tickUpper,
  liquidity
})

const amount0 = position.amount0
const amount1 = position.amount1
```

### Q: Tick 是什么？

A: Tick 是 V3 中的价格点，价格空间被离散化为 ticks。每个 tick 对应一个特定价格。用户只能在 tick 边界之间提供流动性。

---

## 相关文件清单

### 核心文件

- `src/entities/pool.ts` - 池子实体
- `src/entities/position.ts` - 头寸实体
- `src/entities/route.ts` - 路由实体
- `src/entities/trade.ts` - 交易实体
- `src/swapRouter.ts` - 路由器
- `src/multicall.ts` - 多链调用

### 测试文件

- `src/entities/pool.test.ts`
- `src/entities/position.test.ts`
- `src/entities/trade.test.ts`

---

*本模块文档由 AI 架构师生成。*
