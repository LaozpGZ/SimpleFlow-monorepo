[根目录](../../CLAUDE.md) > [packages](../) > **v2-sdk**

---

# packages/v2-sdk - V2 协议 SDK

> 最后更新：2025-12-24 19:19:46 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |
| 2025-12-24 19:25:00 | 深度扫描 | 补充核心算法和实现细节 |

---

## 模块职责

`@pancakeswap/v2-sdk` 是 PancakeSwap V2 协议的 TypeScript SDK，提供与 V2 智能合约交互的完整工具集。

**核心功能：**
- V2 配对（Pair）实体和计算
- V2 路由（Route）计算
- V2 交易（Trade）计算
- 配对地址计算（Create2）
- 最优交易算法

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/v2-sdk",
  "version": "7.5.4",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts"
}
```

### 主入口

```typescript
// src/index.ts
export * from './constants'
export * from './entities'      // Pair, Route, Trade
export * from './router'         // 路由器
export * from './fetcher'        // 数据获取
export * from './trade'          // 交易
```

---

## 核心算法与实现

### 1. 配对地址计算 (pair.ts)

**核心算法**：使用 Create2 确定性计算 V2 配对地址。

**实现细节**：

```typescript
const computePairAddress = ({
  factoryAddress,
  tokenA,
  tokenB,
}): Address => {
  // 1. 对代币进行排序
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]

  // 2. 计算 salt（两个代币地址）
  const salt = keccak256(
    encodePacked(
      ['address', 'address'],
      [token0.address, token1.address]
    )
  )

  // 3. 使用 Create2 计算地址
  return getAddress(
    keccak256(
      concat([
        toBytes('0xff'),              // Create2 前缀
        toBytes(factoryAddress),      // 工厂地址
        pad(salt, { size: 32 }),      // salt
        toBytes(INIT_CODE_HASH)       // 初始化代码哈希
      ])
    ).slice(26)                        // 取后 20 字节
  )
}

// 特殊处理 zkSync 的 Create2
function getCreate2AddressZkSync(
  from: Address,
  salt: Hex,
  initCodeHash: Hex
): Address {
  const ZKSYNC_PREFIX = '0x2020dba91b30cc0006188af794c2fb30dd8520db7e2c088b7fc7c103c00ca494'
  const EMPTY_INPU_HASH = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

  return getAddress(
    keccak256(
      concat([
        ZKSYNC_PREFIX,
        pad(from, { size: 32 }),
        salt,
        initCodeHash,
        EMPTY_INPU_HASH
      ])
    ).slice(26)
  )
}
```

### 2. Pair 实体 (pair.ts)

**核心类**：V2 配对的抽象表示。

```typescript
export class Pair {
  public readonly liquidityToken: Token
  public readonly tokenAmounts: [CurrencyAmount<Token>, CurrencyAmount<Token>]

  // 计算储备比例
  public get reserve0(): CurrencyAmount<Token> {
    return this.tokenAmounts[0]
  }

  public get reserve1(): CurrencyAmount<Token> {
    return this.tokenAmounts[1]
  }

  // 计算输入价格（考虑 0.3% 手续费）
  public get token0Price(): Price<Token, Token> {
    return new Price(
      this.token0,
      this.token1,
      this.reserve0.quotient,
      this.reserve1.quotient
    )
  }

  // 计算输出价格
  public get token1Price(): Price<Token, Token> {
    return new Price(
      this.token1,
      this.token0,
      this.reserve1.quotient,
      this.reserve0.quotient
    )
  }

  // 获取给定储备时的配对（缓存优化）
  public static getAddress(
    tokenA: Token,
    tokenB: Token
  ): Address {
    return computePairAddress({
      factoryAddress: FACTORY_ADDRESS_MAP[tokenA.chainId],
      tokenA,
      tokenB
    })
  }

  // 从储备创建配对
  public static fromAmounts(
    tokenA: Token,
    tokenB: Token,
    amount0: BigintIsh,
    amount1: BigintIsh
  ): Pair {
    const tokenAmounts = tokenA.sortsBefore(tokenB)
      ? [CurrencyAmount.fromRawAmount(tokenA, amount0),
         CurrencyAmount.fromRawAmount(tokenB, amount1)]
      : [CurrencyAmount.fromRawAmount(tokenB, amount1),
         CurrencyAmount.fromRawAmount(tokenA, amount0)]

    return new Pair(tokenAmounts[0], tokenAmounts[1])
  }
}
```

### 3. 最优交易算法 (trade.ts)

**核心算法**：寻找最优交易路径。

**比较器**：

```typescript
// 输入输出比较器
function inputOutputComparator<TInput, TOutput>(
  a: InputOutput<TInput, TOutput>,
  b: InputOutput<TInput, TOutput>
): number {
  // 比较输出金额（降序）
  if (!a.outputAmount.equalTo(b.outputAmount)) {
    return a.outputAmount.lessThan(b.outputAmount) ? 1 : -1
  }

  // 输出相同时比较输入金额（升序）
  if (!a.inputAmount.equalTo(b.inputAmount)) {
    return a.inputAmount.lessThan(b.inputAmount) ? -1 : 1
  }

  return 0
}

// 交易比较器
function tradeComparator<TInput, TOutput, TTradeType>(
  a: Trade<TInput, TOutput, TTradeType>,
  b: Trade<TInput, TOutput, TTradeType>
): number {
  // 1. 比较输入输出
  const ioComp = inputOutputComparator(a, b)
  if (ioComp !== 0) return ioComp

  // 2. 比较价格影响（越低越好）
  if (!a.priceImpact.equalTo(b.priceImpact)) {
    return a.priceImpact.lessThan(b.priceImpact) ? -1 : 1
  }

  // 3. 比较 hop 数量（越少越好）
  return a.route.path.length - b.route.path.length
}
```

**寻找最优交易**：

```typescript
// 递归搜索所有可能路径
export function tradeBestIn<TInput extends Currency, TOutput extends Currency>(
  amountIn: CurrencyAmount<TInput>,
  currencyOut: TOutput,
  pools: Pair[],
  maxHops: number
): Trade<TInput, TOutput, TradeType.EXACT_INPUT>[] {
  // 1. 找到所有包含输出代币的配对
  const startingPools = pools.filter(pool => pool.involvesToken(currencyOut))

  // 2. 递归搜索路径
  for (const pool of startingPools) {
    // 递归查找上游路径
    const nextPools = pools.filter(p => p !== pool)
    const trades = tradeBestIn(
      amountIn,
      pool.token0,
      nextPools,
      maxHops - 1
    )

    // 3. 计算交易结果
    for (const trade of trades) {
      const output = pool.getOutputAmount(trade.outputAmount)
      const newTrade = new Trade(/* ... */)
      results.push(newTrade)
    }
  }

  // 4. 排序并返回最优的几个
  return results.sort(tradeComparator).slice(0, maxNumResults)
}
```

---

## 核心接口定义

### Pair 接口

```typescript
export class Pair {
  readonly token0: Token
  readonly token1: Token
  readonly reserve0: CurrencyAmount<Token>
  readonly reserve1: CurrencyAmount<Token>
  readonly liquidityToken: Token

  // 考虑手续费的输出计算
  getOutputAmount(inputAmount: CurrencyAmount<Token>): CurrencyAmount<Token>

  // 获取给定输入的中间价格
  getMidPrice(outgoingToken?: Token): Price<Token, Token>

  // 链式调用
  static getAddress(tokenA: Token, tokenB: Token): Address
  static fromAmounts(tokenA: Token, tokenB: Token, amount0: BigintIsh, amount1: BigintIsh): Pair
}
```

### Route 接口

```typescript
export class Route<TInput extends Currency, TOutput extends Currency> {
  readonly pools: Pair[]
  readonly input: TInput
  readonly output: TOutput

  // 计算中间价格
  get midPrice(): Price<TInput, TOutput>
}
```

### Trade 接口

```typescript
export class Trade<
  TInput extends Currency,
  TOutput extends Currency,
  TTradeType extends TradeType
> {
  readonly route: Route<TInput, TOutput, TTradeType>
  readonly tradeType: TTradeType
  readonly inputAmount: CurrencyAmount<TInput>
  readonly outputAmount: CurrencyAmount<TOutput>
  readonly executionPrice: Price<TInput, TOutput>
  readonly priceImpact: Percent

  // 最小输出（考虑滑点）
  minimumAmountOut(slippageTolerance: Percent): CurrencyAmount<TOutput>

  // 创建交易
  static fromRoute<TInput extends Currency, TOutput extends Currency>(
    route: Route<TInput, TOutput>,
    amount: CurrencyAmount<TInput>,
    tradeType: TradeType
  ): Trade<TInput, TOutput, TradeType>
}
```

---

## 关键常量

```typescript
// 常量
export const FACTORY_ADDRESS_MAP: Record<ChainId, Address> = {
  [ChainId.BSC]: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
  [ChainId.ETHEREUM]: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
  // ...
}

export const INIT_CODE_HASH_MAP: Record<ChainId, Hex> = {
  [ChainId.BSC]: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
  // ...
}

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)  // 最小流动性
```

---

## 文件结构

```
packages/v2-sdk/src/
├── entities/
│   ├── pair.ts              # Pair 实体 ⭐
│   ├── route.ts             # Route 实体
│   └── index.ts
├── trade.ts                 # Trade 类和比较器 ⭐
├── router.ts                # 路由器（旧版）
├── fetcher.ts               # 数据获取
├── constants.ts             # 常量
├── abis/
│   └── IPancakePair.ts      # Pair ABI
└── index.ts                 # 主入口
```

---

## 测试策略

### 测试文件

- `test/entities.test.ts` - 实体测试
- `test/trade.test.ts` - 交易测试
- `test/route.test.ts` - 路由测试
- `test/pair.test.ts` - 配对测试
- `test/miscellaneous.test.ts` - 其他测试
- `test/token.test.ts` - 代币测试

### 测试命令

```bash
pnpm --filter @pancakeswap/v2-sdk test
```

---

## 常见问题 (FAQ)

### Q: V2 和 V3 的主要区别？

A:
- **V2**：流动性在整个价格曲线均匀分布，不需要主动管理
- **V3**：流动性可以集中在特定价格区间，资金效率更高，但需要主动管理

### Q: 为什么 Pair 地址可以预先计算？

A: V2 使用 Create2 创建配对合约。Create2 允许根据：
1. 工厂地址
2. salt（两个代币地址的哈希）
3. 初始化代码哈希

确定性计算合约地址，所以可以在链上计算。

### Q: 手续费如何计算？

A: V2 固定 0.3% 手续费：

```typescript
// 输出金额计算
outputAmount = inputAmount * (997 / 1000) * (reserve1 / reserve0)
//           ^^^^^^^^^^^^^^^^^
//           扣除 0.3% 手续费
```

### Q: 如何防止三明治攻击？

A:
1. 使用滑点保护
2. 设置合理的截止时间
3. 使用 Flashbots 等私有交易池
4. 在路由中考虑 Gas 费用

---

## 相关文件清单

### 核心文件

- `src/entities/pair.ts` - Pair 实体 ⭐
- `src/trade.ts` - 交易类和比较器 ⭐
- `src/entities/route.ts` - Route 实体
- `src/constants.ts` - 常量配置

### 工具文件

- `src/router.ts` - 路由器（旧版）
- `src/fetcher.ts` - 数据获取

---

## 特殊设计模式

### 1. 缓存模式

```typescript
let PAIR_ADDRESS_CACHE: { [key: string]: Address } = {}

const composeKey = (token0, token1) =>
  `${token0.chainId}-${token0.address}-${token1.address}`

// 使用缓存避免重复计算
if (!PAIR_ADDRESS_CACHE[key]) {
  PAIR_ADDRESS_CACHE[key] = computePairAddress(...)
}
```

### 2. 排序不变性

```typescript
// 代币总是按地址排序
const [token0, token1] = tokenA.sortsBefore(tokenB)
  ? [tokenA, tokenB]
  : [tokenB, tokenA]

// 确保相同的代币对总是有相同的顺序
```

---

*本模块文档由 AI 架构师生成，包含核心算法详解。*
