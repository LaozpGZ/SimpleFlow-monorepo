[根目录](../../CLAUDE.md) > [packages](../) > **routing-sdk**

---

# packages/routing-sdk - 路由计算 SDK

> 最后更新：2025-12-24 19:19:46 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |
| 2025-12-24 19:25:00 | 深度扫描 | 补充核心算法和实现细节 |

---

## 模块职责

`@pancakeswap/routing-sdk` 是 PancakeSwap 的路由计算核心 SDK，提供通用的路由计算算法。

**核心功能：**
- 图算法路由计算
- 最优交易路径搜索
- 流（Stream）分拆算法
- 路由合并和比较
- 价格计算器

---

## 入口与启动

### 主入口

```typescript
// src/index.ts
export * from './types'
export * from './graph'
export * from './findBestTrade'
export * from './route'
export * from './utils'
export * from './constants'
export * from './findKBestTrades'
```

---

## 核心算法与实现

### 1. 最优交易算法 (findBestTrade.ts)

**核心思想**：使用图算法和流分拆找到最优交易路径。

**算法流程**：

```typescript
async function findBestTrade(params: FindBestTradeParams) {
  let bestTrade: TradeWithGraph | undefined

  // 1. 尝试单路径（无分拆）
  try {
    bestTrade = await findBestTradeByStreams({
      ...params,
      streams: 1  // 单一路径
    })
  } catch (e) {
    // 2. 如果失败，使用默认流配置
    bestTrade = await findBestTradeByStreams({
      ...params,
      streams: DEFAULT_STREAM  // 通常是 4
    })
  }

  // 3. 如果允许分拆，尝试多路径分拆
  if (maxSplits !== 0) {
    const streams = getBestStreamsConfig(bestTrade)
    if (streams > 1) {
      const bestTradeWithStreams = await findBestTradeByStreams({
        ...params,
        streams  // [1, 1, 1] 或其他分配
      })

      // 4. 比较并选择更好的交易
      return getBetterTrade(bestTrade, bestTradeWithStreams)
    }
  }

  return bestTrade
}
```

### 2. 流分拆算法 (stream.ts)

**核心思想**：将大额交易分成多个小交易，减少价格影响。

**流配置**：

```typescript
export const DEFAULT_STREAM = [1, 1, 1, 1]  // 平均分成 4 份

// 根据交易量动态调整流数量
function getBestStreamsConfig(trade: TradeWithGraph): number[] {
  const outputAmount = trade.outputAmount.toFixed()

  // 小额交易：1 个流
  if (parseFloat(outputAmount) < 1000) {
    return 1
  }

  // 中等交易：2 个流
  if (parseFloat(outputAmount) < 10000) {
    return [1, 1]
  }

  // 大额交易：4 个流
  return [1, 1, 1, 1]
}
```

### 3. 图算法 (graph/index.ts)

**核心数据结构**：

```typescript
// 图
interface Graph {
  vertices: Map<string, Vertice>
  edges: Edge[]
}

// 顶点（代币）
interface Vertice {
  id: string           // 代币地址
  currency: Currency
}

// 边（池子）
interface Edge {
  id: string
  from: string         // 来源代币
  to: string           // 目标代币
  pool: Pool
  type: PoolType
  reserve0: CurrencyAmount
  reserve1: CurrencyAmount
  tvl: number          // 总锁仓价值
}

// 路由
interface Route {
  pools: Pool[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  gasUseEstimate: number
  gasUseEstimateBase?: CurrencyAmount
  gasUseEstimateQuote?: CurrencyAmount
}
```

**价格计算器**：

```typescript
class PriceCalculator {
  // 计算经过一条边后的输出
  calculateEdgeOutput(
    edge: Edge,
    inputAmount: CurrencyAmount
  ): CurrencyAmount {
    // 根据池类型使用不同的计算公式
    if (edge.type === PoolType.V2) {
      // V2 公式: x * y = k
      return this.calculateV2Output(edge, inputAmount)
    } else if (edge.type === PoolType.V3) {
      // V3 公式
      return this.calculateV3Output(edge, inputAmount)
    }
    // ...
  }

  // 计算完整路径的输出
  calculateRouteOutput(
    route: Route,
    inputAmount: CurrencyAmount
  ): CurrencyAmount {
    let amount = inputAmount
    for (const pool of route.pools) {
      amount = this.calculatePoolOutput(pool, amount)
    }
    return amount
  }
}
```

### 4. 路由合并 (route.ts)

**核心算法**：合并相同的路由以优化 Gas。

```typescript
// 判断两个路由是否相同
function isSameRoute(one: Route, another: Route): boolean {
  if (one.pools.length !== another.pools.length) {
    return false
  }

  for (const [index, p] of one.pools.entries()) {
    if (p.type !== another.pools[index].type) {
      return false
    }
    if (p.getId() !== another.pools[index].getId()) {
      return false
    }
  }

  return true
}

// 合并相同路由
function mergeRoute(one: Route, another: Route): Route {
  return {
    ...one,
    // 累加输入输出
    inputAmount: one.inputAmount.add(another.inputAmount),
    outputAmount: one.outputAmount.add(another.outputAmount),
    // 累加 Gas
    gasUseEstimate: one.gasUseEstimate + another.gasUseEstimate,
    // 合并百分比
    percent: one.percent + another.percent,
  }
}
```

---

## 核心类型定义

```typescript
// 交易配置
interface TradeConfig {
  maxHops?: number              // 最大跳数
  maxSplits?: number            // 最大分拆数
  allowedPoolTypes?: PoolType[] // 允许的池类型
}

// 路由参数
interface RoutingParams {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  candidatePools: Pool[]        // 候选池
  gasPrice?: BigintIsh
}

// 交易结果
interface TradeWithGraph<TTradeType extends TradeType> {
  route: Route
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  executionPrice: Price
  priceImpact: Percent
  graph: Graph                  // 交易图
  streams?: number[]            // 流分配
}

// 池类型
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

## 文件结构

```
packages/routing-sdk/src/
├── findBestTrade.ts          # 最优交易算法 ⭐
├── findKBestTrades.ts        # K 个最优交易
├── route.ts                  # 路由合并和比较
├── stream.ts                 # 流配置和算法
├── graph/
│   ├── graph.ts              # 图数据结构
│   ├── edge.ts               # 边
│   ├── vertice.ts            # 顶点
│   └── priceCalculator.ts    # 价格计算器
├── utils/
│   ├── groupPoolsByType.ts   # 按类型分组池
│   ├── getBetterTrade.ts     # 比较交易
│   ├── transformer.ts        # 数据转换
│   ├── loggers.ts            # 日志工具
│   └── logCurrency.ts        # 货币日志
├── types.ts                  # 类型定义
├── constants.ts              # 常量
└── index.ts                  # 主入口
```

---

## 关键常量

```typescript
// 默认配置
export const DEFAULT_MAX_HOPS = 3           // 最大跳数
export const DEFAULT_STREAM = [1, 1, 1, 1]  // 默认 4 个流
export const DEFAULT_MAX_SPLITS = 4         // 最大分拆数

// Gas 成本
export const BASE_SWAP_COST = 100000
export const COST_PER_HOP = 50000
```

---

## 测试策略

### 测试文件

- `index.test.ts` - 主测试

### 测试命令

```bash
pnpm --filter @pancakeswap/routing-sdk test
```

---

## 常见问题 (FAQ)

### Q: 什么是流（Stream）？

A: 流是指将一个大额交易分成多个小交易，通过不同路径执行。这样可以：
1. 减少价格影响（滑点）
2. 利用不同池子的流动性
3. 优化 Gas 成本

例如：1000 USDT → BNB 可以分成：
- 500 USDT → V2 Pool → BNB
- 300 USDT → V3 Pool → BNB
- 200 USDT → Stable Pool → BNB

### Q: 图算法如何工作？

A:
1. **构建图**：
   - 顶点 = 代币
   - 边 = 池子
   - 权重 = 输出金额（考虑 Gas）

2. **寻找路径**：
   - 使用 Dijkstra 或 BFS 寻找路径
   - 限制最大跳数（maxHops）

3. **优化路径**：
   - 尝试流分拆
   - 合并相同路径
   - 选择最优结果

### Q: 如何选择最优路由？

A: 考虑以下因素：
1. **输出金额**：最大化输出
2. **Gas 成本**：最小化 Gas
3. **价格影响**：最小化滑点
4. **跳数**：减少 hop 数量

最终计算：
```
净输出 = 计算输出 - Gas 费用（转为代币）
```

---

## 相关文件清单

### 核心文件

- `src/findBestTrade.ts` - 最优交易算法 ⭐
- `src/route.ts` - 路由合并和比较
- `src/stream.ts` - 流配置
- `src/graph/graph.ts` - 图数据结构

### 工具文件

- `src/utils/getBetterTrade.ts` - 交易比较
- `src/utils/transformer.ts` - 数据转换

---

## 特殊设计模式

### 1. 图算法模式

使用图论算法解决路由问题：
- 带权有向图
- 最短路径算法
- 流网络算法

### 2. 分治策略

将大额交易分成多个小交易：
- 降低滑点
- 利用多个池子
- 提高成功率

### 3. 动态规划

使用动态规划优化流分配：
- 计算每种分配的输出
- 选择最优分配
- 缓存计算结果

---

*本模块文档由 AI 架构师生成，包含核心算法详解。*
