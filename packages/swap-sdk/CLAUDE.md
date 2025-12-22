[根目录](../../CLAUDE.md) > [packages](../) > **swap-sdk**

# Swap SDK - 核心交易SDK

> **包类型**: SDK | **功能**: 多链交易核心抽象层 | **状态**: 生产就绪
> **入口文件**: `src/index.ts` | **包依赖**: 15个 | **版本**: 5.8.18

## 模块职责

Swap SDK是PancakeSwap的核心交易抽象层，提供：
- **多链统一接口**: 抽象EVM和非EVM链的交易差异
- **协议层封装**: 集成V2、V3、Stable Swap等协议
- **交易计算**: 精确的价格、滑点和Gas计算
- **代币处理**: 代币识别、验证和转换
- **路由抽象**: 统一的路由计算和执行接口

## 入口与启动

### 技术架构
```
packages/swap-sdk/
├── src/
│   ├── index.ts             # 主入口文件
│   ├── evm/                 # EVM链实现
│   ├── solana/              # Solana链实现
│   ├── aptos/               # Aptos链实现
│   ├── constants/           # 常量定义
│   ├── entities/            # 实体模型
│   ├── functions/           # 核心函数
│   └── router/              # 路由逻辑
├── dist/                    # 构建输出
├── test/                    # 测试文件
└── package.json            # 包配置
```

### 核心入口文件
- **`src/index.ts`**: 主入口，导出所有核心类和工具函数
- **`src/constants.ts`**: 常量定义（交易费用、最小金额等）
- **`src/entities/currency.ts`**: 货币和代币实体
- **`src/entities/trade.ts`**: 交易实体和计算逻辑

### 导出结构
```typescript
// 主要导出
export { ChainId } from './constants'
export { Currency, Token, NativeCurrency } from './entities/currency'
export { Trade, TradeType } from './entities/trade'
export { Fraction, Percent, Price } from './entities/fractions'
export { Pair, Route } from './entities/pairs'
export { calculateGasMargin } from './functions/trade'

// 多链支持
export * from './evm'
export * from './solana'
export * from './aptos'
```

## 对外接口

### 核心类和接口
```typescript
// 代币接口
interface Token {
  readonly chainId: ChainId
  readonly address: string
  readonly decimals: number
  readonly symbol: string
  readonly name: string
  equals(other: Token): boolean
  sortsBefore(other: Token): boolean
}

// 交易类
class Trade {
  readonly route: Route
  readonly tradeType: TradeType
  readonly inputAmount: CurrencyAmount
  readonly outputAmount: CurrencyAmount
  readonly executionPrice: Price
  readonly priceImpact: Percent

  // 构造交易
  constructor(route: Route, amount: CurrencyAmount, tradeType: TradeType)

  // 最小输出计算（考虑滑点）
  minimumAmountOut(slippageTolerance: Percent): CurrencyAmount

  // 最大输入计算（考虑滑点）
  maximumAmountIn(slippageTolerance: Percent): CurrencyAmount

  // 创建精确输入交易
  static exactIn(route: Route, amountIn: CurrencyAmount): Trade

  // 创建精确输出交易
  static exactOut(route: Route, amountOut: CurrencyAmount): Trade
}

// 路由类
class Route {
  readonly pairs: Pair[]
  readonly path: Token[]
  readonly input: Token
  readonly output: Token
  readonly midPrice: Price

  constructor(pairs: Pair[], input: Token, output: Token)

  // 获取路径中的所有代币
  get tokenPath(): Token[]

  // 计算路由的中间价格
  get midPrice(): Price
}
```

### 交易类型和计算
```typescript
enum TradeType {
  EXACT_INPUT = 'EXACT_INPUT',   // 精确输入
  EXACT_OUTPUT = 'EXACT_OUTPUT'  // 精确输出
}

enum ChainId {
  ETHEREUM = 1,
  BSC = 56,
  BSC_TESTNET = 97,
  POLYGON = 137,
  APTOS = 'aptos',
  SOLANA = 'solana'
}

// 货币金额类
class CurrencyAmount {
  readonly currency: Currency
  readonly raw: JSBI

  constructor(currency: Currency, raw: JSBI)

  // 静态工厂方法
  static fromRawAmount(currency: Currency, raw: JSBI): CurrencyAmount
  static fromHumanReadableAmount(currency: Currency, amount: string): CurrencyAmount

  // 计算方法
  toSignificant(significantDigits?: number): string
  toFixed(decimalPlaces?: number): string
  toExact(): string

  // 比较操作
  greaterThan(other: CurrencyAmount): boolean
  equals(other: CurrencyAmount): boolean
  lessThan(other: CurrencyAmount): boolean
  add(other: CurrencyAmount): CurrencyAmount
  subtract(other: CurrencyAmount): CurrencyAmount
  multiply(other: Fraction): CurrencyAmount
  divide(other: Fraction): CurrencyAmount
}
```

### 多链适配接口
```typescript
// EVM链接口
export interface EVMProvider {
  chainId: ChainId
  getBalance(address: string): Promise<JSBI>
  getTokenBalance(token: Token, address: string): Promise<CurrencyAmount>
  approve(token: Token, spender: string, amount: CurrencyAmount): Promise<string>
  swap(trade: Trade, recipient: string, slippageTolerance: Percent): Promise<string>
}

// Solana链接口
export interface SolanaProvider {
  getConnection(): Connection
  getTokenBalance(tokenMint: string, owner: string): Promise<CurrencyAmount>
  swap(trade: Trade, wallet: Wallet, slippageTolerance: Percent): Promise<Transaction>
}

// Aptos链接口
export interface AptosProvider {
  getResource(accountAddress: string, resourceType: string): Promise<any>
  swap(trade: Trade, sender: string, slippageTolerance: Percent): Promise<string>
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "dependencies": {
    "@pancakeswap/chains": "workspace:^",
    "@pancakeswap/swap-sdk-core": "workspace:*",
    "@pancakeswap/swap-sdk-evm": "workspace:*",
    "@pancakeswap/swap-sdk-solana": "workspace:*",
    "@pancakeswap/v2-sdk": "workspace:*",
    "big.js": "^5.2.2",
    "decimal.js-light": "^2.5.0",
    "tiny-invariant": "^1.3.0",
    "tiny-warning": "^1.0.3",
    "toformat": "^2.0.0",
    "viem": "catalog:"
  }
}
```

### 常量配置
```typescript
// 交易相关常量
export const BASE_FEE = JSBI.BigInt(200000)          // 基础Gas费
export const GAS_MULTIPLIER = JSBI.BigInt(1200)     // Gas乘数（120%）
export const MAX_UINT160 = '0xffffffffffffffffffffffffffffffffffffffff'
export const SOLIDITY_TYPE_MAXIMA = {
  uint256: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
  uint128: JSBI.BigInt('0xffffffffffffffffffffffffffffffff')
}

// 滑点配置
export const DEFAULT_SLIPPAGE_TOLERANCE = new Percent(50, 10000)  // 0.5%
export const ONE_BIPS = new Percent(1, 10000)                     // 0.01%

// 路由配置
export const MAX_HOPS = 4          // 最大跳数
export const MAX_INPUT = 10000     // 最大输入数量
export const OUTPUT_FRACTION = new Percent(9975, 10000)            // 0.25%手续费
```

### 构建配置
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  onSuccess: async () => {
    console.log('✅ Swap SDK built successfully')
  }
})
```

## 数据模型

### 代币和货币模型
```typescript
// 基础货币抽象类
abstract class Currency {
  readonly decimals: number
  readonly symbol?: string
  readonly name?: string

  constructor(decimals: number, symbol?: string, name?: string) {
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
  }

  abstract equals(other: Currency): boolean
}

// 代币实现
class Token extends Currency {
  readonly chainId: ChainId
  readonly address: string

  constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string) {
    super(decimals, symbol, name)
    this.chainId = chainId
    this.address = address
  }

  equals(other: Currency): boolean {
    if (this.chainId !== other.chainId) return false
    if (this.decimals !== other.decimals) return false
    if (this.address.toLowerCase() !== other.address.toLowerCase()) return false
    return true
  }

  sortsBefore(other: Token): boolean {
    if (this.chainId !== other.chainId) return this.chainId < other.chainId
    return this.address.toLowerCase() < other.address.toLowerCase()
  }
}

// 原生货币（ETH、BNB等）
class NativeCurrency extends Currency {
  readonly chainId: ChainId

  constructor(chainId: ChainId, decimals: number, symbol?: string, name?: string) {
    super(decimals, symbol, name)
    this.chainId = chainId
  }
}
```

### 交易对模型
```typescript
// 流动性池/交易对
class Pair {
  readonly tokenAmounts: [CurrencyAmount, CurrencyAmount]
  readonly liquidityToken: Token

  constructor(tokenAmounts: [CurrencyAmount, CurrencyAmount], liquidityToken: Token)

  // 计算中间价格
  get token0Price(): Price
  get token1Price(): Price
  get chainId(): ChainId
  get tokens(): [Token, Token]

  // 计算输出价格（考虑手续费）
  getOutputAmount(inputAmount: CurrencyAmount): [CurrencyAmount, Pair]

  // 计算输入价格（考虑手续费）
  getInputAmount(outputAmount: CurrencyAmount): [CurrencyAmount, Pair]

  // 创建流动性池
  static getAddress(tokenA: Token, tokenB: Token): string
}

// 路由计算
class Route {
  readonly pairs: Pair[]
  readonly path: Token[]
  readonly input: Token
  readonly output: Token

  // 获取中间价格
  get midPrice(): Price {
    const price = this.pairs.reduce((price, pair) => {
      return price.multiply(pair.token0Price)
    }, new Price(this.input, this.output, JSBI.BigInt(1), JSBI.BigInt(1)))
    return price
  }
}
```

### 分数和百分比计算
```typescript
// 分数类
class Fraction {
  readonly numerator: JSBI
  readonly denominator: JSBI

  constructor(numerator: JSBI, denominator: JSBI)

  // 计算方法
  toSignificant(significantDigits?: number): string
  toFixed(decimalPlaces?: number): string
  invert(): Fraction

  // 算术运算
  add(other: Fraction): Fraction
  subtract(other: Fraction): Fraction
  multiply(other: Fraction | JSBI): Fraction
  divide(other: Fraction | JSBI): Fraction

  // 比较操作
  lessThan(other: Fraction): boolean
  equalTo(other: Fraction): boolean
  greaterThan(other: Fraction): boolean
}

// 百分比类（基于分数）
class Percent extends Fraction {
  constructor(numerator: JSBI, denominator: JSBI)

  // 格式化输出
  toSignificant(significantDigits?: number): string
  toFixed(decimalPlaces?: number): string

  // 静态工厂方法
  static fromBips(bips: JSBI): Percent  // 1/10000为单位
}
```

## 测试与质量

### 测试用例
```typescript
// 代币测试
describe('Token', () => {
  test('should correctly identify equal tokens', () => {
    const tokenA = new Token(ChainId.BSC, '0x1234...', 18, 'CAKE', 'PancakeSwap Token')
    const tokenB = new Token(ChainId.BSC, '0x1234...', 18, 'CAKE', 'PancakeSwap Token')
    expect(tokenA.equals(tokenB)).toBeTruthy()
  })

  test('should correctly sort tokens', () => {
    const tokenA = new Token(ChainId.BSC, '0x1234...', 18, 'CAKE')
    const tokenB = new Token(ChainId.BSC, '0x5678...', 18, 'BNB')
    expect(tokenA.sortsBefore(tokenB)).toBeTruthy()
  })
})

// 交易测试
describe('Trade', () => {
  test('should calculate minimum amount out with slippage', () => {
    const trade = new Trade(route, amountIn, TradeType.EXACT_INPUT)
    const slippageTolerance = new Percent(50, 10000) // 0.5%
    const minAmountOut = trade.minimumAmountOut(slippageTolerance)

    // 验证计算结果
    expect(minAmountOut.lessThan(trade.outputAmount)).toBeTruthy()
  })
})

// 路由测试
describe('Route', () => {
  test('should calculate correct mid price', () => {
    const route = new Route([pair], WETH[ChainId.MAINNET], DAI)
    const midPrice = route.midPrice

    expect(midPrice.denominator).toEqual(WETH[ChainId.MAINNET].raw)
    expect(midPrice.numerator).toEqual(DAI.raw)
  })
})
```

### 质量保证
```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest --run",
    "test:u": "vitest --run -u",
    "clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist"
  }
}
```

## 常见问题 (FAQ)

### Q1: 如何添加新的区块链支持？
**A**: 实现对应的Provider接口，更新ChainId枚举，确保代币格式兼容。

### Q2: 如何处理不同精度的代币？
**A**: 使用CurrencyAmount类自动处理精度转换，JSBI保证大数计算精度。

### Q3: 如何计算滑点保护？
**A**: 使用Trade.minimumAmountOut()和Trade.maximumAmountIn()方法，传入滑点容忍度。

### Q4: 如何验证代币地址？
**A**: 使用Token.equals()方法进行严格比较，或通过链上API验证合约地址。

### Q5: 如何处理跨链桥接？
**A**: 使用专门的跨链SDK（@bnb-chain/canonical-bridge-sdk），不属于本SDK范围。

## 相关文件清单

### 核心实现
- `src/index.ts` - 主入口文件
- `src/constants.ts` - 常量定义
- `src/entities/currency.ts` - 货币和代币实体
- `src/entities/trade.ts` - 交易实体
- `src/entities/fractions.ts` - 分数计算类
- `src/entities/pairs.ts` - 交易对和路由

### 多链支持
- `src/evm/index.ts` - EVM链实现
- `src/solana/index.ts` - Solana链实现
- `src/aptos/index.ts` - Aptos链实现

### 工具函数
- `src/functions/trade.ts` - 交易计算工具
- `src/functions/currency.ts` - 货币处理工具
- `src/functions/validation.ts` - 参数验证

### 测试文件
- `test/trade.test.ts` - 交易逻辑测试
- `test/currency.test.ts` - 货币实体测试
- `test/route.test.ts` - 路由计算测试

## 变更记录 (Changelog)

- **2025-12-22**: 初始化模块文档，梳理核心SDK架构和多链支持
- **分析状态**: 核心接口已识别，需深入多链适配实现
- **下一步**: 建议分析各个链的具体实现和性能优化

---

> 🔄 **多链注意**: 本SDK提供抽象层，具体链的实现请参考对应的子包和适配器。