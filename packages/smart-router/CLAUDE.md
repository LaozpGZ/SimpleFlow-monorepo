[根目录](../../CLAUDE.md) > [packages](../) > **smart-router**

---

# packages/smart-router - 智能路由 SDK

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/smart-router` 是 PancakeSwap 的智能路由 SDK，负责寻找最优交易路径。

**核心功能：**
- 自动寻找最优交易路径
- 支持 V2、V3、Stable Swap、Infinity 等多种池类型
- 考虑 gas 费用和价格影响
- 支持混合路由（跨不同类型池）
- 集成链上报价（on-chain quote）

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/smart-router",
  "version": "7.5.4",
  "main": "dist/evm.js",
  "module": "dist/evm.mjs",
  "types": "dist/evm/index.d.ts"
}
```

### 构建命令

```bash
# 开发模式
pnpm --filter @pancakeswap/smart-router dev

# 构建
pnpm --filter @pancakeswap/smart-router build

# 测试
pnpm --filter @pancakeswap/smart-router test
```

---

## 对外接口

### 主要导出

```typescript
// 路由器
export { getRouter, getBestRouter } from './evm'

// 类型
export {
  Route,
  RoutingConfig,
  QuoteConfig,
  // ... 更多类型
}

// Legacy 路由器（向后兼容）
export * from './legacy-router'
```

### 核心函数

```typescript
// 获取最佳路由
async function getBestRouter(
  config: RoutingConfig
): Promise<V3Route | V2Route | MixedRoute>

// 获取所有可能的路由
async function getRouter(
  config: RoutingConfig
): Promise<Route[]>

// 获取报价
async function getQuote(
  config: QuoteConfig
): Promise<QuoteResult>
```

---

## 关键依赖与配置

### 依赖

```json
{
  "dependencies": {
    "@pancakeswap/chains": "workspace:*",
    "@pancakeswap/multicall": "workspace:*",
    "@pancakeswap/sdk": "workspace:*",
    "@pancakeswap/stable-swap-sdk": "workspace:*",
    "@pancakeswap/swap-sdk-core": "workspace:*",
    "@pancakeswap/token-lists": "workspace:*",
    "@pancakeswap/tokens": "workspace:*",
    "@pancakeswap/v3-sdk": "workspace:*",
    "@pancakeswap/infinity-sdk": "workspace:*",
    "async-retry": "^1.3.1",
    "debug": "^4.3.4",
    "graphql": "^16.8.1",
    "graphql-request": "5.0.0",
    "lodash": "^4.17.21",
    "viem": "catalog:",
    "zod": "catalog:"
  }
}
```

---

## 数据模型

### 文件结构

```
packages/smart-router/
├── evm/                    # EVM 链路由实现
│   ├── router/            # 路由器
│   ├── quotes/            # 报价
│   ├── v3/                # V3 路由
│   ├── v2/                # V2 路由
│   ├── stable/            # Stable Swap 路由
│   ├── infinity/          # Infinity 路由
│   ├── mixedRoute/        # 混合路由
│   ├── constants/         # 常量
│   │   ├── exchange.ts
│   │   ├── gasModel/
│   │   ├── multicall.ts
│   │   ├── tickQuery.ts
│   │   └── v3.ts
│   ├── providers/         # 提供者
│   │   └── onChainQuoteProvider.ts
│   └── index.ts
├── legacy-router/         # 旧版路由器（向后兼容）
└── abis/                  # 合约 ABI
```

### 核心类型

```typescript
// 路由配置
interface RoutingConfig {
  chainId: number
  fromToken: Token
  toToken: Token
  amount: JSBI
  maxHops?: number
  maxSplits?: number
  gasPrice?: JSBI
  allowedPoolTypes?: PoolType[]
}

// 路由结果
interface V3Route {
  route: Pool[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  gasEstimate: JSBI
}

interface V2Route {
  route: Pair[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  gasEstimate: JSBI
}

interface MixedRoute {
  route: (Pool | Pair)[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  gasEstimate: JSBI
}

// 池类型
enum PoolType {
  V2 = 'V2',
  V3 = 'V3',
  STABLE = 'STABLE',
  STABLE_FACTORY = 'STABLE_FACTORY',
  // ... 更多类型
}
```

---

## 测试与质量

### 测试

- 单元测试覆盖核心路由逻辑
- 测试不同池类型的路由计算
- Gas 模型测试

### 测试命令

```bash
# 运行测试
pnpm --filter @pancakeswap/smart-router test

# 更新快照
pnpm --filter @pancakeswap/smart-router update:snapshot
```

---

## 常见问题 (FAQ)

### Q: 智能路由如何选择最佳路径？

A: 智能路由考虑以下因素：
1. **输出金额**：最大化用户获得的代币
2. **Gas 费用**：考虑不同池类型的 gas 成本
3. **价格影响**：避免大额交易造成过大滑点
4. **池深度**：优先使用流动性更好的池
5. **混合路由**：可以组合使用 V2、V3、Stable 等不同池

### Q: 如何使用智能路由？

A:
```typescript
import { getBestRouter } from '@pancakeswap/smart-router'

const route = await getBestRouter({
  chainId: ChainId.BSC,
  fromToken: CAKE,
  toToken: WBNB,
  amount: parseUnits('100', 18),
  maxHops: 3,
})

console.log(route.outputAmount) // 最优输出
console.log(route.gasEstimate) // 预估 gas
```

### Q: 支持哪些池类型？

A:
- **V2**：传统 AMM 池
- **V3**：集中流动性池
- **Stable Swap**：稳定币互换池
- **Infinity**：PancakeSwap Infinity 池

### Q: 什么是混合路由？

A: 混合路由是指一个交易可以跨越不同类型的池。例如：
`Token A → V2 Pool → Token B → V3 Pool → Token C`

这通常能获得更好的价格。

---

## 相关文件清单

### 核心文件

- `evm/index.ts` - 主入口
- `evm/router/` - 路由器实现
- `evm/quotes/` - 报价逻辑
- `evm/providers/onChainQuoteProvider.ts` - 链上报价提供者
- `evm/constants/` - 常量配置

### 子目录

- `v3/` - V3 路由实现
- `v2/` - V2 路由实现
- `stable/` - Stable Swap 路由实现
- `infinity/` - Infinity 路由实现
- `mixedRoute/` - 混合路由实现

---

*本模块文档由 AI 架构师生成。*
