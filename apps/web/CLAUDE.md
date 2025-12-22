[根目录](../../CLAUDE.md) > [apps](../) > **web**

# Web应用 - PancakeSwap主交易平台

> **应用类型**: Next.js Web应用 | **目标链**: BSC/ETH | **状态**: 生产就绪
> **入口文件**: `src/pages/_app.tsx` | **包依赖**: 88个

## 模块职责

Web应用是PancakeSwap的主要交易平台，为BSC和Ethereum用户提供完整的DeFi服务：
- **核心交易**: Swap, Liquidity, Farms, Pools
- **高级功能**: IFO, Prediction, NFT, Position Manager
- **钱包集成**: MetaMask, WalletConnect, Binance Wallet
- **多语言支持**: 20+ 语言本地化
- **用户体验**: 响应式设计, PWA支持, 主题切换

## 入口与启动

### 技术架构
```
apps/web/
├── src/
│   ├── pages/           # Next.js页面路由
│   ├── components/      # 页面级组件
│   ├── hooks/          # 自定义React Hooks
│   ├── state/          # Redux状态管理
│   ├── utils/          # 工具函数
│   └── views/          # 页面视图组件
├── public/             # 静态资源
├── .next/              # Next.js构建输出
└── next.config.mjs     # Next.js配置
```

### 关键入口文件
- **`pages/_app.tsx`**: 应用根组件，配置全局状态和Provider
- **`pages/index.tsx`**: 首页，展示主要功能入口
- **`pages/swap/`**: 交易功能页面
- **`pages/pools/`**: 流动性和挖矿页面

### 启动配置
```javascript
// next.config.mjs 关键配置
- TypeScript严格模式 (忽略构建错误)
- Styled Components支持
- Vanilla Extract CSS-in-JS
- Sentry错误监控
- Web Security Headers
- Bundle Analyzer
- 图片优化和CDN配置
```

## 对外接口

### 页面路由结构
```typescript
// 主要页面路由
/                    # 首页
/swap               # 交易页面
/liquidity          # 流动性管理
/farms              # 挖矿农场
/pools              # 流动性池
/cake-staking       # CAKE质押
/ifo                # 首发代币发行
/nfts               # NFT市场
/prediction         # 预测市场
/info               # 数据分析
```

### API端点
```typescript
// 内部API路由
/api/vercel/flags    # 功能开关
/api/auth/          # 用户认证
/api/transactions/  # 交易记录
/api/tokens/        # 代币信息
```

### 钱包连接接口
```typescript
// 支持的钱包类型
interface WalletConfig {
  injected: boolean           // MetaMask等注入钱包
  walletconnect: boolean      // WalletConnect
  binancechain: boolean       // Binance Chain Wallet
  trustwallet: boolean        // Trust Wallet
  coinbase: boolean          // Coinbase Wallet
}
```

## 关键依赖与配置

### 核心依赖包
```json
{
  // PancakeSwap生态包
  "@pancakeswap/sdk": "workspace:*",
  "@pancakeswap/smart-router": "workspace:*",
  "@pancakeswap/uikit": "workspace:*",
  "@pancakeswap/hooks": "workspace:*",
  "@pancakeswap/multicall": "workspace:*",

  // 区块链集成
  "viem": "catalog:",                    // 以太坊工具
  "wagmi": "catalog:",                   // 钱包连接
  "@privy-io/react-auth": "^2.17.2",     // Privy钱包
  "@solana/web3.js": "catalog:",         // Solana支持

  // 状态管理
  "@reduxjs/toolkit": "^1.9.1",
  "jotai": "catalog:",
  "valtio": "^2.1.2",

  // UI和样式
  "styled-components": "6.0.7",
  "@vanilla-extract/next-plugin": "^2.3.0",
  "@chakra-ui/react": "~2.7.1",          // Solana集成

  // 图表和可视化
  "chart.js": "^4.4.0",
  "lightweight-charts": "^4.0.1",
  "recharts": "2.1.15"
}
```

### 环境变量配置
```bash
# 区块链节点
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org

# API服务
NEXT_PUBLIC_API_BASE_URL=https://api.pancakeswap.info
NEXT_PUBLIC_GRAPHQL_URL=https://api.pancakeswap.info/graphql

# 第三方服务
SENTRY_DSN=xxx
NEXT_PUBLIC_GA_ID=xxx
NEXT_PUBLIC_MIXPANEL_TOKEN=xxx

# 功能开关
ENABLE_EXPERIMENTAL_FEATURES=false
ENABLE_BRIDGE=true
ENABLE_SOLANA=true
```

### TypeScript配置
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@pancakeswap/*": ["../../packages/*/src/*"]
    }
  }
}
```

## 数据模型

### 核心状态结构
```typescript
// Redux Store结构
interface AppState {
  user: UserState;              // 用户信息
  wallet: WalletState;          // 钱包状态
  transactions: TransactionState; // 交易记录
  farms: FarmState;            // 挖矿数据
  pools: PoolState;            // 流动性池
  swap: SwapState;             // 交易状态
  blockchain: BlockchainState; // 区块链状态
}

// 钱包状态
interface WalletState {
  account: string | null;
  chainId: number | null;
  connector: string | null;
  isConnecting: boolean;
  error: string | null;
}

// 交易状态
interface SwapState {
  currencies: {
    input: Currency | null;
    output: Currency | null;
  };
  typedValue: string;
  recipient: string | null;
  trade: Trade | null;
  loading: boolean;
  error: string | null;
}
```

### 代币模型
```typescript
interface Token {
  chainId: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI?: string;
  isNative: boolean;
  isToken: boolean;
}

interface CurrencyAmount {
  currency: Token;
  raw: bigint;
  toFixed(decimalPlaces?: number): string;
  toSignificant(significantDigits?: number): string;
}
```

### 交易模型
```typescript
interface Trade {
  route: Route;
  tradeType: TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT;
  inputAmount: CurrencyAmount;
  outputAmount: CurrencyAmount;
  executionPrice: Price;
  priceImpact: Percent;
  slippage: Percent;
}
```

## 测试与质量

### 测试结构
```
src/
├── __tests__/              # 单元测试
│   ├── components/         # 组件测试
│   ├── hooks/             # Hook测试
│   └── utils/             # 工具函数测试
├── e2e/                   # 端到端测试
│   ├── swap/              # 交易流程测试
│   ├── liquidity/         # 流动性测试
│   └── farms/             # 挖矿测试
└── test-utils/            # 测试工具
```

### 测试配置
```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### 关键测试场景
```typescript
// 交易流程测试
describe('Swap Flow', () => {
  test('should execute token swap successfully', async () => {
    // 连接钱包
    // 选择交易对
    // 输入数量
    // 确认交易
    // 验证结果
  });
});

// 钱包连接测试
describe('Wallet Connection', () => {
  test('should connect MetaMask wallet', async () => {
    // 模拟MetaMask
    // 测试连接流程
    // 验证账户信息
  });
});
```

### 代码质量工具
```json
{
  "scripts": {
    "lint": "eslint 'src/**/*.{js,jsx,ts,tsx}'",
    "lint:fix": "eslint --fix 'src/**/*.{js,jsx,ts,tsx}'",
    "type-check": "tsc --noEmit",
    "test": "vitest --run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

## 常见问题 (FAQ)

### Q1: 如何添加新的区块链支持？
**A**: 参考 `packages/chains` 配置，添加链配置并更新 `packages/wagmi` 连接器。

### Q2: 如何新增交易页面？
**A**: 在 `src/pages/` 创建新页面，复用 `@pancakeswap/uikit` 组件和 `packages/hooks`。

### Q3: 如何优化交易路由性能？
**A**: 关注 `packages/smart-router` 配置，启用缓存和并行计算。

### Q4: 如何处理钱包连接错误？
**A**: 使用 `useAccountEventListener` hook 监听钱包事件，显示用户友好的错误信息。

### Q5: 如何添加新的代币支持？
**A**: 更新 `packages/token-lists` 配置，或者使用动态代币添加功能。

## 相关文件清单

### 核心配置
- `next.config.mjs` - Next.js配置
- `tsconfig.json` - TypeScript配置
- `package.json` - 项目依赖
- `.env.local.example` - 环境变量模板

### 应用入口
- `src/pages/_app.tsx` - 应用根组件
- `src/pages/_document.tsx` - HTML文档配置
- `src/pages/index.tsx` - 首页

### 状态管理
- `src/state/index.ts` - Redux Store配置
- `src/state/application/` - 应用状态
- `src/state/user/` - 用户状态
- `src/state/wallet/` - 钱包状态

### 工具和Hook
- `src/hooks/` - 自定义React Hooks
- `src/utils/` - 工具函数
- `src/constants/` - 常量定义

### 组件库
- `src/components/` - 页面级组件
- `src/views/` - 页面视图
- `src/widgets/` - 可复用组件

### 测试文件
- `src/__tests__/` - 单元测试
- `e2e/` - 端到端测试
- `test-utils/` - 测试工具

## 变更记录 (Changelog)

- **2025-12-22**: 初始化模块文档，梳理核心架构和依赖关系
- **分析状态**: 基础结构已扫描，需深入业务逻辑分析
- **下一步**: 建议重点分析交易流程和路由算法实现

---

> **🚨 注意**: 这是核心交易应用，任何修改都需要充分测试和安全审计。