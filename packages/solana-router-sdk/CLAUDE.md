[根目录](../../CLAUDE.md) > [packages](../) > **solana-router-sdk**

---

# packages/solana-router-sdk - Solana 路由 SDK

> 最后更新：2025-12-24 19:30:00 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:30:00 | 深度扫描 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/solana-router-sdk` 是 PancakeSwap Solana 路由 SDK，集成 Jupiter 聚合器。

**核心功能：**
- 最佳交易路径查找
- Jupiter Ultra Swap 集成
- 多 DEX 路由
- 滑点保护

**关键特性**：类似 EVM 的 smart-router，但使用 Jupiter 聚合器。

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/solana-router-sdk",
  "version": "1.4.9",
  "main": "dist/index.js",
  "module": "dist/index.mjs"
}
```

### 主入口

```typescript
// src/index.ts
export * from './getBestTrade'         # 获取最佳交易 ⭐
export * from './UltraSwapError'       # 错误处理
export * from './UltraSwapService'     # Jupiter 服务
```

---

## 核心算法

### 1. 获取最佳交易 (getBestTrade.ts)

**核心函数**：

```typescript
export const getBestSolanaTrade = async ({
  inputCurrency,      # 输入代币
  outputCurrency,     # 输出代币
  amount,             # 金额
  account,            # 用户账户
  slippageBps = 50,   # 滑点（基点，50 = 0.5%）
  tradeType,          # 交易类型
  excludeRouters,     # 排除的路由
  excludeDexes,       # 排除的 DEX
  priorityFeeLamports, # 优先费用
}: BestSolanaTradeParams): Promise<SolRouterTrade> => {
  // 1. 转换 SOL -> WSOL
  const inputMint = solToWSol(inputCurrency.address)
  const outputMint = solToWSol(outputCurrency.address)

  // 2. 调用 Jupiter API
  const quote = await ultraSwapService.getQuote({
    inputMint,
    outputMint,
    amount: amount.quotient.toString(),
    slippageBps,
    swapMode: tradeType === TradeType.EXACT_INPUT ? 'ExactIn' : 'ExactOut',
    taker: account,
    excludeRouters,
    excludeDexes,
  })

  // 3. 返回交易结果
  return {
    tradeType,
    inputAmount,
    outputAmount,
    routes: quote.routePlan,           # 路由计划
    requestId: quote.requestId,
    otherAmountThreshold: quote.otherAmountThreshold,
    priceImpactPct: quote.priceImpactPct,
    slippageBps,
    transaction: quote.swapTransaction, # 序列化交易
  }
}
```

### 2. Jupiter 集成

**UltraSwapService**：

```typescript
class UltraSwapService {
  private apiUrl = 'https://quote-api.jup.ag/v6/quote'

  async getQuote(request: SolanaQuoteRequest): Promise<UltraQuoteResponse> {
    // 调用 Jupiter API
    const response = await fetch(`${this.apiUrl}?${params}`)
    return response.json()
  }

  async getSwapTransaction(quoteResponse: UltraQuoteResponse): Promise<string> {
    // 获取序列化的交易
    const swapApi = 'https://quote-api.jup.ag/v6/swap'
    const response = await fetch(swapApi, {
      method: 'POST',
      body: JSON.stringify(quoteResponse)
    })
    return response.json().swapTransaction
  }
}
```

---

## 核心接口

### 1. 路由计划

```typescript
interface RouterPlan {
  swapInfo: {
    inputMint: string      # 输入代币地址
    inAmount: string       # 输入数量
    outputMint: string     # 输出代币地址
    outAmount: string      # 输出数量
    ammKey: PublicKey      # AMM 密钥
    label: string          # DEX 标签（如 "Raydium", "Orca"）
    feeAmount: string      # 手续费金额
    feeMint: PublicKey     # 手续费代币
  }
  bps?: number            # 基点（10000 = 0.01%）
  percent: number         # 路由百分比
}
```

### 2. 交易结果

```typescript
interface SolRouterTrade {
  tradeType: TradeType                    # EXACT_INPUT | EXACT_OUTPUT
  inputAmount: UnifiedCurrencyAmount      # 输入金额
  outputAmount: UnifiedCurrencyAmount     # 输出金额
  routes: RouterPlan[]                    # 路由列表
  requestId: string                       # 请求 ID
  otherAmountThreshold: string            # 其他金额阈值
  priceImpactPct: string                  # 价格影响百分比
  slippageBps: number                     # 滑点基点
  transaction: string | null              # 序列化的交易（base64）
}
```

---

## Jupiter 聚合器

**什么是 Jupiter？**

Jupiter 是 Solana 生态最大的 DEX 聚合器，类似 EVM 的 1inch。

**支持的 DEX**：
- Raydium
- Orca
- Serum
- Meteora
- Aldrin
- Cropper
- 等 10+ 个 DEX

**核心功能**：
1. 路由聚合：查找最优路径
2. 滑点保护
3. 交易构建
4. 费用优化

---

## 跨链兼容性设计

### 1. 统一接口

```typescript
// 与 EVM smart-router 类似的接口
interface BestTradeParams {
  inputCurrency: Currency
  outputCurrency: Currency
  amount: CurrencyAmount
  tradeType: TradeType
  slippageBps?: number
}
```

### 2. SOL/WSOL 处理

```typescript
// SOL 需要包装成 WSOL 才能交易
function solToWSol(address: string): string {
  if (isNativeSol(address)) {
    return 'WRAPPED_SOL_MINT_ADDRESS'
  }
  return address
}
```

### 3. 代币类型

```typescript
interface SPLToken {
  address: string        # Solana 代币地址（PublicKey）
  chainId: number        # 链 ID（Solana mainnet = 101）
  decimals: number
  symbol: string
  name: string
}
```

---

## 关键依赖

```typescript
import { PublicKey } from '@solana/web3.js'
import Decimal from 'decimal.js'
import { create } from 'superstruct'  # 数据验证
```

---

## 文件结构

```
packages/solana-router-sdk/src/
├── getBestTrade.ts           # 获取最佳交易 ⭐
├── UltraSwapError.ts         # 错误类型定义
├── UltraSwapService.ts       # Jupiter API 服务
└── FormattedUltraQuoteResponse.ts  # 响应格式化
```

---

## 测试策略

### 测试命令

```bash
# 运行测试
pnpm --filter @pancakeswap/solana-router-sdk test

# 更新快照
pnpm --filter @pancakeswap/solana-router-sdk test:update

# 覆盖率
pnpm --filter @pancakeswap/solana-router-sdk coverage
```

---

## 常见问题 (FAQ)

### Q: 为什么使用 Jupiter 而不是自己实现路由？

A: Jupiter 是 Solana 生态最成熟的聚合器：
- 聚合 10+ 个 DEX
- 最优路由算法
- 高流动性
- 低滑点

### Q: 如何与 EVM 智能路由对比？

A:

| 特性 | Solana Router | EVM Smart Router |
|------|--------------|------------------|
| 聚合器 | Jupiter API | 本地计算 + 子图 |
| 路由计算 | 服务端 | 客户端 |
| 更新速度 | 实时 | 取决于子图 |
| Gas 考虑 | 不需要 | 核心 |

### Q: transaction 字段是什么？

A: 是序列化的 Solana 交易（base64 编码），可以直接签名并发送：

```typescript
import { Transaction } from '@solana/web3.js'

const tx = Transaction.from(Buffer.from(trade.transaction, 'base64'))
tx.sign(signer)
const signature = await connection.sendTransaction(tx)
```

---

## 相关文件清单

### 核心文件

- `src/getBestTrade.ts` - 获取最佳交易 ⭐
- `src/UltraSwapService.ts` - Jupiter API 服务

### 工具文件

- `src/FormattedUltraQuoteResponse.ts` - 响应格式化

---

## 特殊设计模式

### 1. 聚合器模式

不直接计算路由，而是调用 Jupiter API：
```typescript
const quote = await jupiterApi.getQuote(params)
```

### 2. 适配器模式

将 Jupiter 响应适配为统一接口：
```typescript
const trade = adaptJupiterQuote(quote)
```

### 3. 错误处理

自定义错误类型：
```typescript
class UltraSwapError extends Error {
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}
```

---

*本模块文档由 AI 架构师生成。*
