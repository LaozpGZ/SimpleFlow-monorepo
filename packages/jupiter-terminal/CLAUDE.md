[根目录](../../CLAUDE.md) > [packages](../) > **jupiter-terminal**

# Jupiter Terminal - Solana路由终端

> **包类型**: Solana集成 | **功能**: Jupiter聚合路由 | **状态**: 生产就绪
> **入口文件**: `src/index.tsx` | **包依赖**: 20+ | **版本**: 4.0.1

## 模块职责

Jupiter Terminal是PancakeSwap Solana生态的核心路由组件：
- **聚合路由**: 集成Jupiter协议聚合器
- **最优路径**: 寻找Solana生态最佳交易路径
- **多DEX支持**: Raydium, Orca, Serum等主流DEX
- **UI组件**: 提供完整的交易界面组件
- **钱包集成**: 支持主流Solana钱包

## 入口与启动

### 技术架构
```
packages/jupiter-terminal/
├── src/
│   ├── index.tsx              # 主入口组件
│   ├── components/            # UI组件
│   │   ├── JupiterWidget.tsx  # 主交易组件
│   │   ├── TokenSelect.tsx    # 代币选择
│   │   ├── SwapButton.tsx     # 交易按钮
│   │   └── PriceDisplay.tsx   # 价格显示
│   ├── hooks/                 # React Hooks
│   │   ├── useJupiter.ts      # Jupiter API集成
│   │   ├── useWallet.ts       # 钱包管理
│   │   └── useQuote.ts        # 报价查询
│   ├── utils/                 # 工具函数
│   ├── types/                 # 类型定义
│   └── styles/                # 样式文件
├── dist/                      # 构建输出
├── scripts/                   # 构建脚本
└── package.json               # 包配置
```

### 核心入口文件
- **`src/index.tsx`**: 主入口，导出核心组件和Hook
- **`src/components/JupiterWidget.tsx`**: 完整的交易界面组件
- **`src/hooks/useJupiter.ts`**: Jupiter API集成Hook

### 导出结构
```typescript
// 主要导出
export { JupiterWidget } from './components/JupiterWidget'
export { TokenSelect } from './components/TokenSelect'
export { SwapButton } from './components/SwapButton'

// Hooks
export { useJupiter } from './hooks/useJupiter'
export { useQuote } from './hooks/useQuote'
export { useTokenMap } from './hooks/useTokenMap'

// 工具函数
export { getMintInfo, getAssociatedTokenAddress } from './utils'
export { calculateSlippage } from './utils/slippage'

// 类型定义
export * from './types'

// 样式
export './styles/global.css'
```

## 对外接口

### 主要组件接口
```typescript
// Jupiter Widget组件
interface JupiterWidgetProps {
  // 必需属性
  wallet: Wallet | null
  onSwapSuccess?: (txid: string) => void
  onSwapError?: (error: Error) => void

  // 可选配置
  initialInputMint?: string     // 初始输入代币mint
  initialOutputMint?: string    // 初始输出代币mint
  slippagePercent?: number      // 滑点容忍度 (1-20)
  feeAccount?: string           // 费用账户
  feeBps?: number               // 费用基点

  // UI配置
  theme?: 'light' | 'dark'
  showFooter?: boolean
  showHeader?: boolean
  containerStyles?: CSSProperties

  // 交易配置
  wrapUnwrapSOL?: boolean       // 是否允许SOL包装/解包
  maxAccounts?: number          // 最大账户数
}

const JupiterWidget: React.FC<JupiterWidgetProps>

// 代币选择组件
interface TokenSelectProps {
  value?: TokenInfo
  onChange: (token: TokenInfo) => void
  disabled?: boolean
  placeholder?: string
  showBalance?: boolean
  wallet?: Wallet | null
}

const TokenSelect: React.FC<TokenSelectProps>

// 交易按钮组件
interface SwapButtonProps {
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

const SwapButton: React.FC<SwapButtonProps>
```

### Jupiter API Hooks
```typescript
// Jupiter主Hook
interface UseJupiterReturn {
  // 连接状态
  isConnected: boolean
  isLoading: boolean
  error: Error | null

  // 交易状态
  inputToken: TokenInfo | null
  outputToken: TokenInfo | null
  inputAmount: string
  outputAmount: string
  quote: Quote | null

  // 操作方法
  setInputToken: (token: TokenInfo) => void
  setOutputToken: (token: TokenInfo) => void
  setInputAmount: (amount: string) => void
  swap: () => Promise<string>

  // 价格信息
  priceImpact: number | null
  route: Route | null
}

const useJupiter = (config?: JupiterConfig): UseJupiterReturn

// 报价Hook
interface UseQuoteReturn {
  quote: Quote | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

const useQuote = (
  inputMint: string,
  outputMint: string,
  amount: string,
  slippage?: number
): UseQuoteReturn

// 代币映射Hook
const useTokenMap = (): Map<string, TokenInfo>
```

### 类型定义
```typescript
// 代币信息
interface TokenInfo {
  address: string                // Mint地址
  chainId: number               // 链ID (Solana为101)
  decimals: number              // 精度
  name: string                  // 代币名称
  symbol: string                // 代币符号
  logoURI?: string              // Logo链接
  tags?: string[]               // 标签
  extensions?: {
    coingeckoId?: string
    serumProgramId?: string
  }
}

// 报价信息
interface Quote {
  inputMint: string
  inputAmount: string           // 输入数量（最小单位）
  outputMint: string
  outputAmount: string          // 输出数量（最小单位）
  otherAmountThreshold?: string
  swapMode: 'ExactIn' | 'ExactOut'
  slippageBps: number
  priceImpactPct: number

  // 路由信息
  routePlan: Route[]
  timeTaken: number             // 计算耗时(ms)
  computeUnitPrice?: number     // 计算单元价格

  // 费用信息
  platformFee?: {
    amount: string
    mint: string
    pct: number
  }
}

// 路由信息
interface Route {
  swapInfo: SwapInfo
  marketInfo: MarketInfo
  percent: number               // 在总路径中的占比
}

interface SwapInfo {
  inputMint: string
  outputMint: string
  inputAmount: string
  outputAmount: string
  feeAmount?: string
  feeMint?: string
}

interface MarketInfo {
  id: string
  label: string
  inputMint: string
  outputMint: string
  notEnoughLiquidity: boolean
  inAmount: string
  outAmount: string
  priceImpactPct: number
  lpFee: {
    amount: string
    mint: string
    pct: number
  }
}

// Jupiter配置
interface JupiterConfig {
  rpcEndpoint?: string          // RPC端点
  slippage?: number             // 默认滑点 (1-20)
  feeAccount?: string           // 费用账户
  feeBps?: number               // 费用基点
  maxAccounts?: number          // 最大账户数
  wrapUnwrapSOL?: boolean       // 是否包装SOL
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "dependencies": {
    "@jup-ag/react-hook": "6.2.0",           // Jupiter React Hook
    "@jup-ag/wallet-adapter": "0.2.0",       // Jupiter钱包适配器
    "@jup-ag/common": "6.0.0-beta.9",        // Jupiter通用工具
    "@solana/spl-token": "0.1.8",            // SPL Token
    "@solana/spl-token-registry": "~0.2.4574", // 代币注册表
    "@solana/wallet-adapter-wallets": "^0.19.22", // 钱包适配器
    "@tanstack/react-query": "^4.36.1",       // 数据获取
    "bn.js": "5.2.1",                         // 大数计算
    "clsx": "^2.1.1",                         // CSS类名工具
    "decimal.js": "10.4.3",                   // 精确计算
    "jotai": "catalog:",                      // 状态管理
    "jazzicon": "^1.5.0",                     // 头像生成
    "react-use": "^17.5.1"                    // React工具Hook
  },
  "peerDependencies": {
    "@solana/spl-token": "^0.1.8",
    "@solana/web3.js": "^1.87.6",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

### 环境配置
```typescript
// 默认配置
const JUPITER_CONFIG = {
  // Jupiter API
  JUPITER_API_BASE: 'https://quote-api.jup.ag',
  JUPITER_SWAP_API: 'https://swap.jup.ag',

  // Solana配置
  SOLANA_CHAIN_ID: 101,
  SOLANA_RPC: 'https://api.mainnet-beta.solana.com',

  // 交易配置
  DEFAULT_SLIPPAGE: 3,          // 3%默认滑点
  MAX_SLIPPAGE: 20,             // 最大20%滑点
  MIN_SLIPPAGE: 1,              // 最小1%滑点

  // UI配置
  REFRESH_INTERVAL: 30000,      // 30秒刷新间隔
  MAX_RETRIES: 3,               // 最大重试次数

  // 费用配置
  FEE_ACCOUNT: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  DEFAULT_FEE_BPS: 0,           // 默认无费用
}

// 代币列表配置
const POPULAR_TOKENS = [
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // MSOL
]
```

### 构建配置
```typescript
// scripts/build.sh
#!/bin/bash
set -e

echo "🚀 Building Jupiter Terminal..."

# 安装依赖
npm install

# 构建项目
npm run build

# 生成类型声明
npm run build:types

echo "✅ Build completed successfully!"
```

## 数据模型

### 交易状态模型
```typescript
// 交易状态
interface SwapState {
  // 代币状态
  inputToken: TokenInfo | null
  outputToken: TokenInfo | null
  inputAmount: string
  outputAmount: string

  // 价格状态
  quote: Quote | null
  bestQuote: Quote | null
  priceImpact: number | null

  // 交易状态
  loading: boolean
  swapping: boolean
  error: string | null

  // 钱包状态
  wallet: Wallet | null
  balance: TokenBalance | null

  // 配置状态
  slippage: number
  feeBps: number
}

// 代币余额
interface TokenBalance {
  mint: string
  amount: string
  decimals: number
  uiAmount: number
}
```

### 路由计算模型
```typescript
// 路由计划
interface RoutePlan {
  route: Route[]
  inputAmount: string
  outputAmount: string
  slippageBps: number
  priceImpactPct: number

  // 性能指标
  timeTaken: number
  computeUnits: number
}

// DEX市场信息
interface MarketInfoExtended extends MarketInfo {
  dexName: string
  dexType: 'AMM' | 'ORDERBOOK' | 'HYBRID'
  liquidityUSD: number
  volume24h: number
  fees: {
    lpFee: number
    platformFee: number
  }
}
```

### 用户偏好模型
```typescript
// 用户设置
interface UserPreferences {
  // 交易设置
  defaultSlippage: number
  autoWrapSOL: boolean
  showDetailedRoutes: boolean

  // UI设置
  theme: 'light' | 'dark' | 'auto'
  language: string

  // 隐私设置
  enableAnalytics: boolean
  saveRecentTokens: boolean

  // 最近使用
  recentTokens: string[]
  favoriteTokens: string[]
}
```

## 测试与质量

### 组件测试
```typescript
// Jupiter Widget测试
describe('JupiterWidget', () => {
  test('should render swap interface', () => {
    const mockWallet = createMockWallet()

    render(
      <JupiterWidget
        wallet={mockWallet}
        onSwapSuccess={vi.fn()}
      />
    )

    expect(screen.getByTestId('jupiter-widget')).toBeInTheDocument()
    expect(screen.getByTestId('token-select-input')).toBeInTheDocument()
    expect(screen.getByTestId('token-select-output')).toBeInTheDocument()
  })

  test('should handle token swap', async () => {
    const onSwapSuccess = vi.fn()
    const mockWallet = createMockWallet()

    render(
      <JupiterWidget
        wallet={mockWallet}
        onSwapSuccess={onSwapSuccess}
      />
    )

    // 选择代币
    await selectToken('input', SOL)
    await selectToken('output', USDC)

    // 输入数量
    await inputAmount('1')

    // 点击交易
    await clickSwapButton()

    expect(onSwapSuccess).toHaveBeenCalledWith(expect.any(String))
  })
})

// Hook测试
describe('useJupiter', () => {
  test('should fetch quote correctly', async () => {
    const { result } = renderHook(() => useJupiter())

    act(() => {
      result.current.setInputToken(SOL)
      result.current.setOutputToken(USDC)
      result.current.setInputAmount('1')
    })

    await waitFor(() => {
      expect(result.current.quote).toBeDefined()
      expect(result.current.quote.outputAmount).toBeDefined()
    })
  })
})
```

### 性能优化
```typescript
// 防抖Hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 缓存Hook
export const useQuoteCache = () => {
  const queryClient = useQueryClient()

  const getCachedQuote = (key: string) => {
    return queryClient.getQueryData(['quote', key])
  }

  const setCachedQuote = (key: string, quote: Quote) => {
    return queryClient.setQueryData(['quote', key], quote, {
      ttl: 30000 // 30秒缓存
    })
  }

  return { getCachedQuote, setCachedQuote }
}
```

### 错误处理
```typescript
// 错误边界
export class JupiterErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Jupiter Error:', error, errorInfo)
    // 发送错误报告
    trackError('jupiter_widget_error', { error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

## 常见问题 (FAQ)

### Q1: 如何集成自定义主题？
**A**: 通过theme属性传入主题配置，或使用CSS变量覆盖默认样式。

### Q2: 如何处理交易失败？
**A**: 监听onSwapError回调，显示用户友好的错误信息，提供重试选项。

### Q3: 如何优化路由计算性能？
**A**: 使用useQuote缓存，启用防抖，合理设置refresh间隔。

### Q4: 如何添加自定义代币？
**A**: 通过TokenSelect组件的tokens属性传入自定义代币列表。

### Q5: 如何处理钱包连接错误？
**A**: 监听钱包事件，显示连接状态，提供重连选项。

## 相关文件清单

### 核心组件
- `src/components/JupiterWidget.tsx` - 主交易组件
- `src/components/TokenSelect.tsx` - 代币选择器
- `src/components/SwapButton.tsx` - 交易按钮
- `src/components/PriceDisplay.tsx` - 价格显示

### Hooks
- `src/hooks/useJupiter.ts` - Jupiter主Hook
- `src/hooks/useQuote.ts` - 报价查询Hook
- `src/hooks/useTokenMap.ts` - 代币映射Hook
- `src/hooks/useWallet.ts` - 钱包管理Hook

### 工具函数
- `src/utils/index.ts` - 通用工具
- `src/utils/slippage.ts` - 滑点计算
- `src/utils/serialization.ts` - 序列化工具

### 样式文件
- `src/styles/global.css` - 全局样式
- `src/styles/components/` - 组件样式

### 类型定义
- `src/types/index.ts` - 主类型定义
- `src/types/jupiter.ts` - Jupiter相关类型
- `src/types/wallet.ts` - 钱包相关类型

## 变更记录 (Changelog)

- **2025-12-22**: 初始化模块文档，梳理Jupiter集成架构和核心组件
- **分析状态**: 核心组件已识别，需深入集成细节和性能优化
- **下一步**: 建议分析Solana钱包集成和DEX适配策略

---

> ☀️ **Solana生态**: 本组件专用于Solana区块链，依赖Jupiter聚合器提供最优路由。