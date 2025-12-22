[根目录](../../CLAUDE.md) > [packages](../) > **smart-router**

# Smart Router - 智能路由SDK

> **包类型**: SDK | **功能**: 最优交易路径算法 | **状态**: 生产就绪
> **入口文件**: `src/evm/index.ts` | **包依赖**: 45个

## 模块职责

Smart Router是PancakeSwap的核心路由算法SDK，负责：
- **最优路径计算**: 寻找最佳交易路径和价格
- **多DEX集成**: 整合V2、V3、Stable Swap等协议
- **实时价格更新**: 基于链上数据的动态定价
- **滑点保护**: 提供精确的滑点和价格影响计算
- **Gas优化**: 最小化交易Gas消耗

## 入口与启动

### 技术架构
```
packages/smart-router/
├── src/
│   ├── evm/            # EVM链路由实现
│   ├── legacy-router/  # 兼容旧版本路由
│   ├── worker/         # Web Worker实现
│   ├── functions/      # 路由算法核心函数
│   ├── hooks/          # React Hooks
│   └── types/          # TypeScript类型定义
├── test/               # 测试文件
├── dist/               # 构建输出
└── package.json        # 包配置
```

### 核心入口文件
- **`src/evm/index.ts`**: EVM链路由主入口
- **`src/worker/index.ts`**: Web Worker实现，避免UI阻塞
- **`src/functions/route-computation.ts`**: 路由计算核心逻辑
- **`src/types/index.ts`**: 完整的类型定义

### 导出接口
```typescript
// 主要导出
export { SmartRouter } from './evm/smart-router'
export { computeRoutes } from './functions/route-computation'
export type { Route, Trade } from './types'

// Worker导出
export { createRouterWorker } from './worker/worker'
```

## 对外接口

### SmartRouter类
```typescript
class SmartRouter {
  // 获取最佳路由
  static async getRoute(
    currencyIn: Currency,
    currencyOut: Currency,
    amount: CurrencyAmount,
    type: TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT,
    config?: RouterConfig
  ): Promise<Route | null>

  // 获取多个路由方案
  static async getRoutes(
    params: GetRoutesParams
  ): Promise<{ routes: Route[]; blocking: boolean }>

  // 价格影响计算
  static getPriceImpact(trade: Trade): Percent

  // Gas估算
  static estimateGas(route: Route): Promise<BigNumber>
}

interface RouterConfig {
  maxHops?: number;           // 最大跳数
  maxSplits?: number;         // 最大分拆数量
  allowedProtocols?: Protocol[]; // 允许的协议
  gasPriceWei?: string;       // Gas价格
  debug?: boolean;            // 调试模式
}
```

### 路由计算参数
```typescript
interface GetRoutesParams {
  currencyIn: Currency
  currencyOut: Currency
  amount: CurrencyAmount
  tradeType: TradeType
  maxHops: number
  maxSplits: number
  distributionPercent: number
  allowedProtocols: Protocol[]
  gasPriceWei?: string
  quoterAddress?: string
  v2QuoterAddress?: string
}

enum Protocol {
  V2 = 'v2',
  V3 = 'v3',
  STABLE_SWAP = 'stable_swap',
  MIXED = 'mixed'
}
```

### 路由结果模型
```typescript
interface Route {
  protocol: Protocol
  path: Currency[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  priceImpact: Percent
  gasEstimate: BigNumber
  quote: Quote
  pools: Pool[]
}

interface Trade {
  route: Route[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  executionPrice: Price
  priceImpact: Percent
  slippage: Percent
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "dependencies": {
    "@pancakeswap/sdk": "workspace:*",
    "@pancakeswap/v3-sdk": "workspace:*",
    "@pancakeswap/stable-swap-sdk": "workspace:*",
    "@pancakeswap/multicall": "workspace:*",
    "@pancakeswap/token-lists": "workspace:*",
    "viem": "catalog:",
    "zod": "catalog:",
    "graphql": "^16.8.1",
    "graphql-request": "5.0.0",
    "lodash": "^4.17.21"
  }
}
```

### GraphQL查询配置
```typescript
// 交易对价格查询
const PAIR_PRICES_QUERY = gql`
  query PairPrices($pairs: [PairInput!]!) {
    pairs(first: 100, where: { or: $pairs }) {
      id
      token0 {
        id
        symbol
        derivedETH
      }
      token1 {
        id
        symbol
        derivedETH
      }
      reserveUSD
      reserve0
      reserve1
    }
  }
`
```

### 环境配置
```typescript
// 路由配置常量
export const DEFAULT_CONFIG: RouterConfig = {
  maxHops: 3,
  maxSplits: 4,
  allowedProtocols: [
    Protocol.V2,
    Protocol.V3,
    Protocol.STABLE_SWAP,
    Protocol.MIXED
  ],
  minLiquidity: 1000,
  gasLimitMultiplier: 1.1
}
```

## 数据模型

### 流动性池模型
```typescript
interface Pool {
  id: string
  protocol: Protocol
  token0: Currency
  token1: Currency
  fee: number
  liquidity: string
  sqrtPriceX96?: string  // V3特有
  tick?: number          // V3特有
  reserve0?: string      // V2特有
  reserve1?: string      // V2特有
  stable?: boolean       // Stable Swap特有
}

interface V3Pool extends Pool {
  protocol: Protocol.V3
  sqrtPriceX96: string
  tick: number
  liquidity: string
  tickSpacing: number
}
```

### 路由算法状态
```typescript
interface RouterState {
  isComputing: boolean
  routes: Route[]
  error: string | null
  bestRoute: Route | null
  gasPrice: BigNumber
  blockNumber: number | null
}

interface RouterCache {
  routes: Map<string, Route[]>
  prices: Map<string, Price>
  pools: Map<string, Pool>
  lastUpdated: number
}
```

### 价格计算模型
```typescript
interface Price {
  baseCurrency: Currency
  quoteCurrency: Currency
  denominator: JSBI
  numerator: JSBI
  toSignificant(significantDigits?: number): string
  toFixed(decimalPlaces?: number): string
}

interface Fraction {
  numerator: JSBI
  denominator: JSBI
  toSignificant(significantDigits?: number): string
  toFixed(decimalPlaces?: number): string
}
```

## 测试与质量

### 测试策略
```typescript
// 核心算法测试
describe('Route Computation', () => {
  test('should compute optimal V2 route', async () => {
    const route = await computeRoutes({
      currencyIn: CAKE,
      currencyOut: BNB,
      amount: new TokenAmount(CAKE, '1000000000000000000'),
      tradeType: TradeType.EXACT_INPUT,
      allowedProtocols: [Protocol.V2]
    })

    expect(route).toBeDefined()
    expect(route.outputAmount.greaterThan(0)).toBeTruthy()
  })

  test('should compute V3 route with tick data', async () => {
    // V3特定测试
  })

  test('should compute mixed protocol route', async () => {
    // 混合协议测试
  })
})
```

### 性能基准测试
```typescript
// 性能测试套件
describe('Performance Tests', () => {
  test('should compute route within 1 second', async () => {
    const start = Date.now()
    await computeRoutes(testParams)
    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000)
  })

  test('should handle concurrent requests', async () => {
    // 并发请求测试
  })
})
```

### 质量指标
```javascript
// package.json scripts
{
  "scripts": {
    "test": "vitest --run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:perf": "vitest --run --reporter=verbose",
    "typechecks": "tsc --noEmit",
    "build": "tsup",
    "benchmark": "node scripts/benchmark.js"
  }
}
```

## 算法核心

### 路由计算流程
```typescript
async function computeRoutes(params: GetRoutesParams): Promise<{ routes: Route[] }> {
  // 1. 获取所有可用的流动性池
  const pools = await getRelevantPools(params.currencyIn, params.currencyOut)

  // 2. 构建所有可能的路径
  const allPaths = buildAllPaths(pools, params.currencyIn, params.currencyOut, params.maxHops)

  // 3. 计算每条路径的输出
  const calculatedPaths = await Promise.all(
    allPaths.map(path => calculatePathOutput(path, params))
  )

  // 4. 应用最优分拆算法
  const optimizedRoutes = applySplits(calculatedPaths, params.maxSplits)

  // 5. 按输出量排序
  return optimizedRoutes.sort((a, b) =>
    b.outputAmount.subtract(a.outputAmount).greaterThan(0) ? 1 : -1
  )
}
```

### 分拆交易算法
```typescript
function applySplits(routes: Route[], maxSplits: number): Route[] {
  // 使用动态规划找到最佳分拆方案
  const bestSplits = findOptimalSplits(routes, maxSplits)

  return bestSplits.map(split => ({
    ...split,
    protocol: Protocol.MIXED,
    gasEstimate: calculateSplitGas(split)
  }))
}
```

### Worker实现
```typescript
// worker.ts - 避免UI阻塞
self.onmessage = async (event) => {
  const { id, params } = event.data

  try {
    const routes = await computeRoutes(params)
    self.postMessage({ id, result: routes })
  } catch (error) {
    self.postMessage({ id, error: error.message })
  }
}
```

## 常见问题 (FAQ)

### Q1: 路由计算太慢怎么办？
**A**: 使用Worker模式，启用缓存，减少maxHops和maxSplits参数。

### Q2: 如何添加新的DEX协议？
**A**: 实现`Pool`接口，添加协议枚举，更新路由计算逻辑。

### Q3: Gas估算不准确？
**A**: 根据网络拥堵情况调整gasLimitMultiplier，使用实时gas价格。

### Q4: 如何处理流动性不足的情况？
**A**: 实现流动性检查，提前返回错误，提供替代交易对建议。

### Q5: 如何优化价格影响计算？
**A**: 使用更精确的数学库，考虑滑点保护机制。

## 相关文件清单

### 核心实现
- `src/evm/smart-router.ts` - 路由主类
- `src/functions/route-computation.ts` - 路由计算核心
- `src/functions/pools.ts` - 流动性池管理
- `src/functions/quotes.ts` - 报价计算

### Worker实现
- `src/worker/worker.ts` - Worker主文件
- `src/worker/worker-pool.ts` - Worker池管理

### 工具函数
- `src/functions/math.ts` - 数学计算工具
- `src/functions/currency.ts` - 货币处理
- `src/functions/validation.ts` - 参数验证

### 测试文件
- `test/smart-router.test.ts` - 主要功能测试
- `test/route-computation.test.ts` - 路由算法测试
- `test/performance.test.ts` - 性能测试

### 配置文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript配置
- `tsup.config.ts` - 构建配置

## 变更记录 (Changelog)

- **2025-12-22**: 初始化模块文档，梳理路由算法和核心接口
- **分析状态**: 算法架构已识别，需深入性能优化细节
- **下一步**: 建议分析Worker实现和缓存策略

---

> ⚡ **性能提示**: 大规模计算建议使用Worker模式，避免阻塞UI线程。