[根目录](../../CLAUDE.md) > [packages](../) > **smart-router**

---

# packages/smart-router/evm - 智能路由核心逻辑

> 最后更新：2025-12-24 19:19:46 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |
| 2025-12-24 19:25:00 | 深度扫描 | 补充核心算法和实现细节 |

---

## 模块职责

`@pancakeswap/smart-router/evm` 是 PancakeSwap 智能路由的核心实现，负责寻找最优交易路径。

**核心功能：**
- 多池类型路由计算（V2、V3、Stable、Infinity）
- 混合路由（跨不同池类型）
- Gas 模型和费用优化
- 链上报价提供者
- 流动性池提供者
- 价格影响计算

---

## 入口与启动

### 主入口

```typescript
// evm/index.ts
export * from './constants'
export * from './v3-router'          // V3 路由器
export * from './infinity-router'     // Infinity 路由器
export * from './fot'                  // Fee-on-Transfer 检测
```

### 核心导出

```typescript
// 路由器导出
export {
  getBestTrade,           // 获取最佳交易
  getPairCombinations,    // 获取配对组合
  v2PoolTvlSelector,      // V2 池 TVL 选择器
  v3PoolTvlSelector       // V3 池 TVL 选择器
} from './v3-router'

// 工具函数
export {
  buildBaseRoute,           // 构建基础路由
  encodeMixedRouteToPath,    // 编码混合路由
  getPriceImpact,            // 价格影响
  maximumAmountIn,           // 最大输入
  minimumAmountOut           // 最小输出
} from './v3-router/utils'

// 提供者
export * from './v3-router/providers'
```

---

## 关键依赖与配置

### 依赖结构

```typescript
// 核心依赖
import { ChainId } from '@pancakeswap/chains'
import { Currency, CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { Pair } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/v3-sdk'
import { StablePool } from '@pancakeswap/stable-swap-sdk'
import { InfinityPool } from '@pancakeswap/infinity-sdk'
import { multicall } from '@pancakeswap/multicall'

// 外部依赖
import { PublicClient } from 'viem'
import { request } from 'graphql-request'
```

---

## 核心算法与实现

### 1. Gas 模型 (gasModel.ts)

**核心思想**：将 Gas 费用转换为代币金额，在路由计算中考虑 Gas 成本。

**关键常量**：
```typescript
BASE_SWAP_COST_V2 = 100000           // V2 基础 Gas 成本
BASE_SWAP_COST_V3 = 150000           // V3 基础 Gas 成本
BASE_SWAP_COST_STABLE_SWAP = 180000  // Stable Swap 基础 Gas 成本

COST_PER_HOP_V3 = 50000              // V3 每个 hop 的额外 Gas
COST_PER_EXTRA_HOP_V2 = 30000        // V2 额外 hop 的 Gas
COST_PER_INIT_TICK = 30000           // V3 初始化 tick 的 Gas
COST_PER_UNINIT_TICK = 15000         // V3 未初始化 tick 的 Gas
```

**Gas 成本计算**：
```typescript
estimateGasCost(route, { initializedTickCrossedList }): GasCost {
  let gasCost = BASE_SWAP_COST

  // 计算每个池的 Gas 成本
  for (const pool of route.pools) {
    if (isV3Pool(pool)) {
      gasCost += COST_PER_HOP_V3
      // 计算跨越的 tick 数量
      gasCost += initializedTickCrossedList * COST_PER_INIT_TICK
    } else if (isV2Pool(pool)) {
      gasCost += COST_PER_EXTRA_HOP_V2
    }
    // ...
  }

  // 将 Gas 转换为代币金额
  const gasCostInToken = gasCost * gasPrice * tokenPrice

  return {
    gasCostUsd: gasCostInToken * usdPrice,
    gasCostInToken,
    gasCostInUsd
  }
}
```

### 2. 路由计算算法

**核心流程**：

1. **获取候选池**：
   - V2 池：从子图或链上获取
   - V3 池：从子图或链上获取
   - Stable 池：从链上获取
   - Infinity 池：从链上获取

2. **构建交易图**：
   - 池 = 边
   - 代币 = 顶点
   - 使用图算法寻找路径

3. **计算报价**：
   - 链上报价：使用 multicall 获取实时价格
   - 离线报价：使用池子储备计算

4. **选择最优路由**：
   - 考虑输出金额
   - 考虑 Gas 成本
   - 考虑价格影响
   - 支持路由分拆（split）

### 3. 混合路由编码

**核心函数**：

```typescript
// 编码混合路由为 Path
encodeMixedRouteToPath(route: MixedRoute): Hex {
  const path: string[] = []

  for (const pool of route.pools) {
    if (isV2Pool(pool)) {
      path.push(pool.token0.address, pool.token1.address)
    } else if (isV3Pool(pool)) {
      path.push(pool.token0.address, pool.fee.toString(), pool.token1.address)
    }
    // ...
  }

  return encodePacked(...path)
}

// 编码 Infinity 混合路由
encodeInfinityMixedRouteParams(route: InfinityMixedRoute): {
  path: Hex
  types: string[]
} {
  // 特殊编码逻辑
}
```

### 4. 价格影响计算

```typescript
getPriceImpact(
  inputAmount: CurrencyAmount,
  outputAmount: CurrencyAmount,
  route: Route
): Percent {
  // 计算无滑点时的预期价格
  const midPrice = route.getMidPrice()
  const expectedOutput = midPrice.quote(inputAmount)

  // 计算实际输出与预期的差异
  const priceImpact = expectedOutput.subtract(outputAmount).divide(expectedOutput)

  return new Percent(priceImpact.numerator, priceImpact.denominator)
}
```

---

## 文件结构详解

```
packages/smart-router/evm/
├── v3-router/                    # V3 路由器（主路由器）
│   ├── smartRouter.ts           # 智能路由主入口
│   ├── getBestTrade.ts          # 获取最佳交易
│   ├── gasModel.ts              # Gas 模型 ⭐
│   ├── functions/               # 核心函数
│   │   ├── computeAllRoutes.ts          # 计算所有路由
│   │   ├── getBestRouteCombinationByQuotes.ts  # 获取最佳路由组合
│   │   ├── getPairCombinations.ts         # 获取配对组合
│   │   ├── getAmountDistribution.ts       # 获取金额分配
│   │   └── split4Percents.ts              # 分拆百分比
│   ├── utils/                   # 工具函数
│   │   ├── encodeMixedRouteToPath.ts      # 编码混合路由
│   │   ├── encodeInfinityRouteToPath.ts   # 编码 Infinity 路由
│   │   ├── getPriceImpact.ts              # 价格影响
│   │   ├── getOutputOfPools.ts            # 获取池子输出
│   │   ├── route.ts                       # 路由工具
│   │   └── pool.ts                        # 池子工具
│   ├── providers/               # 提供者
│   │   ├── offChainQuoteProvider.ts       # 离线报价提供者
│   │   ├── poolProviders/                 # 池子提供者
│   │   │   ├── hybridPoolProvider.ts      # 混合池提供者
│   │   │   ├── subgraphPoolProviders.ts   # 子图池提供者
│   │   │   └── poolTvlSelectors.ts        # 池 TVL 选择器
│   │   └── index.ts
│   └── index.ts
├── infinity-router/             # Infinity 路由器
├── fot.ts                       # Fee-on-Transfer 检测
├── constants.ts                 # 常量
└── index.ts                     # 主入口
```

---

## 核心接口定义

### 路由配置

```typescript
interface RoutingConfig {
  chainId: number
  fromToken: Token
  toToken: Token
  amount: BigintIsh
  maxHops?: number              // 最大跳数，默认 3
  maxSplits?: number            // 最大分拆数，默认 4
  gasPrice?: BigintIsh          // Gas 价格
  allowedPoolTypes?: PoolType[] // 允许的池类型
  swapConfig?: {
    maxCrossSize?: number       // 最大交叉数量
    topN?: number               // 获取前 N 个最优路由
    topNWithInOut?: number      // 带输入输出的前 N 个
  }
}
```

### 路由结果

```typescript
interface V3Route {
  type: 'v3'
  route: Pool[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  gasEstimate: {
    gasCostUsd: number
    gasCostInToken: CurrencyAmount
    gasCostInUsd: CurrencyAmount
  }
  priceImpact: Percent
}

interface V2Route {
  type: 'v2'
  route: Pair[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  // ...
}

interface MixedRoute {
  type: 'mixed'
  route: (Pool | Pair | StablePool | InfinityPool)[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  // ...
}
```

### 池类型

```typescript
enum PoolType {
  V2 = 'V2',
  V3 = 'V3',
  STABLE = 'STABLE',
  STABLE_FACTORY = 'STABLE_FACTORY',
  INFINITY_BIN = 'INFINITY_BIN',
  INFINITY_CL = 'INFINITY_CL'
}
```

---

## 测试策略

### 单元测试

- `gasModel.test.ts` - Gas 模型测试
- `swapRouter.test.ts` - 路由器测试
- `paymentsExtended.test.ts` - 支付扩展测试
- `multicallExtended.test.ts` - Multicall 扩展测试

### 测试命令

```bash
pnpm --filter @pancakeswap/smart-router test
```

---

## 常见问题 (FAQ)

### Q: 混合路由是如何工作的？

A: 混合路由允许一个交易跨越不同类型的池。例如：
```
Token A → V2 Pool → Token B → V3 Pool → Token C
```
这通常能获得更好的价格，因为可以利用不同池类型的优势。

实现时，需要：
1. 构建包含不同池类型的交易图
2. 寻找跨池类型的路径
3. 编码时需要分别处理每种池类型

### Q: Gas 模型如何影响路由选择？

A: Gas 模型将 Gas 费用转换为代币金额，然后从输出中扣除：

```
最终输出 = 计算输出 - Gas 费用（转为代币）
```

这样，即使某个路由的原始输出更高，但如果 Gas 费用太高，可能不会被选择。

### Q: 什么是路由分拆（split）？

A: 路由分拆是指将一个大额交易分成多个小交易，通过不同路径执行，以减少价格影响。

例如：
```
1000 USDT → BNB
  = 500 USDT → V2 Pool → BNB
  + 500 USDT → V3 Pool → BNB
```

### Q: Fee-on-Transfer 是什么？

A: 某些代币在转账时会自动扣除一部分费用（如 Reflect.finance）。这种代币需要特殊处理，因为实际收到的金额少于预期。

智能路由通过 `fetchTokenFeeOnTransfer` 检测并处理这些代币。

---

## 相关文件清单

### 核心文件

- `evm/v3-router/smartRouter.ts` - 智能路由主入口
- `evm/v3-router/gasModel.ts` - Gas 模型 ⭐
- `evm/v3-router/getBestTrade.ts` - 获取最佳交易
- `evm/v3-router/functions/computeAllRoutes.ts` - 计算所有路由

### 关键算法

- `evm/v3-router/functions/getBestRouteCombinationByQuotes.ts` - 最佳路由组合
- `evm/v3-router/functions/getAmountDistribution.ts` - 金额分配算法
- `evm/v3-router/utils/encodeMixedRouteToPath.ts` - 混合路由编码

### 提供者

- `evm/v3-router/providers/offChainQuoteProvider.ts` - 离线报价
- `evm/v3-router/providers/poolProviders/hybridPoolProvider.ts` - 混合池提供者

---

## 特殊设计模式

### 1. 提供者模式 (Provider Pattern)

使用不同的提供者获取池子和报价：
- `PoolProvider` - 提供池子数据
- `QuoteProvider` - 提供报价数据

### 2. 策略模式 (Strategy Pattern)

不同池类型使用不同的计算策略：
- V2 策略
- V3 策略
- Stable 策略
- Infinity 策略

### 3. 图算法 (Graph Algorithm)

使用图论算法寻找最优路径：
- 顶点：代币
- 边：池子
- 权重：Gas 调整后的价格

---

*本模块文档由 AI 架构师生成，包含核心算法详解。*
