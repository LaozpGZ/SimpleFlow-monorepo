[根目录](../../CLAUDE.md) > [packages](../) > **hooks**

# Hooks - 共享React Hooks

> **包类型**: React Hooks | **功能**: 通用业务逻辑抽象 | **状态**: 生产就绪
> **入口文件**: `src/index.ts` | **包依赖**: 6个 | **版本**: 0.0.46

## 模块职责

Hooks包提供跨应用共享的React Hooks，抽象通用业务逻辑：
- **状态管理**: 全局状态和本地状态管理
- **用户交互**: 钱包连接、交易确认、用户偏好
- **数据处理**: 价格获取、代币信息、链状态
- **UI交互**: 主题切换、国际化、响应式布局
- **工具函数**: 时间处理、本地存储、错误处理

## 入口与启动

### 技术架构
```
packages/hooks/
├── src/
│   ├── index.ts                  # 主入口文件
│   ├── useActiveWeb3React.ts     # Web3连接状态
│   ├── useAccountEventListener.ts # 钱包事件监听
│   ├── useCurrency.ts            # 代币处理
│   ├── useTheme.ts               # 主题管理
│   ├── useTranslation.ts         # 国际化
│   ├── useLocalStorage.ts        # 本地存储
│   ├── useOnClickOutside.ts      # UI交互
│   └── utils/                    # 工具函数
├── test/                         # 测试文件
└── package.json                  # 包配置
```

### 核心入口文件
- **`src/index.ts`**: 主入口，导出所有hooks
- **`src/useActiveWeb3React.ts`**: Web3连接和钱包状态管理
- **`src/useAccountEventListener.ts`**: 钱包事件监听和处理
- **`src/useCurrency.ts`**: 代币选择和验证逻辑

### 导出结构
```typescript
// 主要导出
export { useActiveWeb3React } from './useActiveWeb3React'
export { useAccountEventListener } from './useAccountEventListener'
export { useCurrency, useAllCurrencies } from './useCurrency'
export { useTheme } from './useTheme'
export { useTranslation } from './useTranslation'
export { useLocalStorage } from './useLocalStorage'
export { useOnClickOutside } from './useOnClickOutside'

// Web3相关
export { useNetwork, useSwitchNetwork } from './useNetwork'
export { useBalance, useTokenBalance } from './useBalances'

// UI相关
export { useModal, useToggle } from './useModal'
export { useMatchBreakpoints } from './useMatchBreakpoints'
export { useToast } from './useToast'
```

## 对外接口

### Web3连接Hooks
```typescript
// Web3连接状态
interface UseActiveWeb3ReactReturn {
  account: string | null          // 当前连接的账户
  library: any | null             // Web3库实例
  chainId: number | null          // 当前链ID
  connector: any | null           // 连接器实例
  isActive: boolean               // 是否活跃连接
  isConnecting: boolean           // 是否正在连接
  error: Error | null             // 连接错误
}

const useActiveWeb3React = (): UseActiveWeb3ReactReturn

// 钱包事件监听
interface UseAccountEventListenerProps {
  onDisconnect?: () => void       // 断开连接回调
  onAccountChanged?: (account: string) => void // 账户变更回调
  onChainChanged?: (chainId: number) => void   // 链变更回调
  onError?: (error: Error) => void            // 错误回调
}

const useAccountEventListener = (props: UseAccountEventListenerProps): void

// 余额Hooks
const useBalance = (account?: string | null): { data?: JSBI; isLoading: boolean }
const useTokenBalance = (token?: Token, account?: string | null): { data?: CurrencyAmount; isLoading: boolean }
```

### 代币和货币Hooks
```typescript
// 代币选择Hook
interface UseCurrencyReturn {
  currency: Currency | null      // 选中的代币
  otherCurrency: Currency | null // 另一个代币（交易对）
  setCurrency: (currency: Currency) => void
  switchCurrencies: () => void   // 交换交易对
  onCurrencySelection: (field: 'INPUT' | 'OUTPUT', currency: Currency) => void
}

const useCurrency = (
  inputCurrencyId?: string,
  outputCurrencyId?: string
): UseCurrencyReturn

// 所有代币Hook
const useAllCurrencies = (): Currency[]

// 代币搜索Hook
const useSearchableCurrencies = (
  searchQuery: string,
  selectedCurrency?: Currency,
  isSearchable?: boolean
): Currency[]
```

### UI交互Hooks
```typescript
// 主题Hook
interface UseThemeReturn {
  isDark: boolean                // 是否暗色主题
  theme: Theme                   // 主题对象
  toggleTheme: () => void        // 切换主题
  setTheme: (isDark: boolean) => void
}

const useTheme = (): UseThemeReturn

// 模态框Hook
interface UseModalReturn {
  isOpen: boolean                // 是否打开
  onOpen: () => void             // 打开模态框
  onClose: () => void            // 关闭模态框
  onToggle: () => void           // 切换状态
}

const useModal = (initialState?: boolean): UseModalReturn

// 点击外部Hook
const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: (event: Event) => void
): void

// 响应式断点Hook
const useMatchBreakpoints = (): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isXl: boolean
  isLg: boolean
}

// Toast Hook
const useToast = () => {
  const toast = useToast()
  return {
    toastError: (title: string, description?: string) => void
    toastInfo: (title: string, description?: string) => void
    toastSuccess: (title: string, description?: string) => void
    toastWarning: (title: string, description?: string) => void
  }
}
```

### 数据存储Hooks
```typescript
// 本地存储Hook
const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((val: T) => T)) => void]

// 会话存储Hook
const useSessionStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((val: T) => T)) => void]

// Cookie Hook
const useCookie = (
  name: string,
  defaultValue?: string
): [string, (value: string, options?: CookieOptions) => void, () => void]

interface CookieOptions {
  days?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "dependencies": {
    "dayjs": "^1.11.10",                           // 时间处理
    "js-cookie": "^3.0.1",                        // Cookie操作
    "react": "^18.2.0",                           // React核心
    "@pancakeswap/swap-sdk-core": "workspace:*",  // SDK核心
    "@pancakeswap/utils": "workspace:*",          // 工具函数
    "next-themes": "^0.2.1"                       // 主题系统
  },
  "peerDependencies": {
    "styled-components": "6.0.7"                  // 样式组件
  }
}
```

### 环境配置
```typescript
// 默认配置
const HOOKS_CONFIG = {
  // Web3配置
  CHAIN_ID: 56,                      // 默认BSC主网
  SUPPORTED_CHAINS: [1, 56, 137],    // 支持的链ID

  // 本地存储配置
  STORAGE_PREFIX: 'pancakeswap_',
  COOKIE_EXPIRY: 365,                // Cookie过期天数

  // UI配置
  BREAKPOINTS: {
    sm: 600,                         // 移动端
    md: 960,                         // 平板
    lg: 1280,                        // 桌面
    xl: 1920                         // 大屏
  },

  // 主题配置
  THEME_TRANSITION: 300              // 主题切换动画时长
}
```

### TypeScript配置
```typescript
// 严格类型定义
interface Theme {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    success: string
    danger: string
    warning: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  shadows: {
    small: string
    medium: string
    large: string
  }
}

interface WalletInfo {
  chainId: number
  account: string | null
  balance: JSBI | null
  connector: Connector | null
}
```

## 数据模型

### 钱包状态模型
```typescript
// Web3连接状态
interface Web3State {
  account: string | null
  chainId: number | null
  connector: string | null
  isActive: boolean
  isConnecting: boolean
  error: Error | null
  library: any | null
}

// 钱包事件类型
enum WalletEventType {
  ACCOUNT_CHANGED = 'ACCOUNT_CHANGED',
  CHAIN_CHANGED = 'CHAIN_CHANGED',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

// 连接器配置
interface ConnectorConfig {
  supportedChainIds: number[]
  rpcUrls: { [chainId: number]: string }
  bridge: string
}
```

### 代币状态模型
```typescript
// 代币搜索状态
interface TokenSearchState {
  currencies: Currency[]
  loading: boolean
  error: string | null
  searchQuery: string
  filteredCurrencies: Currency[]
}

// 交易对状态
interface CurrencyPair {
  input: Currency | null
  output: Currency | null
  field: 'INPUT' | 'OUTPUT' | null
  typedValue: string
  trade: Trade | null
  price: Price | null
}
```

### UI状态模型
```typescript
// 模态框状态
interface ModalState {
  [key: string]: boolean
}

// 主题状态
interface ThemeState {
  isDark: boolean
  theme: Theme
  isTransitioning: boolean
}

// Toast状态
interface ToastState {
  id: string
  title: string
  description?: string
  type: 'error' | 'info' | 'success' | 'warning'
  duration?: number
  timestamp: number
}
```

## 测试与质量

### Hook测试模式
```typescript
// Web3 Hook测试
describe('useActiveWeb3React', () => {
  test('should return initial state', () => {
    const { result } = renderHook(() => useActiveWeb3React())

    expect(result.current.account).toBeNull()
    expect(result.current.chainId).toBeNull()
    expect(result.current.isActive).toBeFalsy()
  })

  test('should update state on connection', async () => {
    const { result } = renderHook(() => useActiveWeb3React())

    // 模拟连接
    act(() => {
      // 触发连接逻辑
    })

    expect(result.current.account).toBeDefined()
    expect(result.current.isActive).toBeTruthy()
  })
})

// 主题Hook测试
describe('useTheme', () => {
  test('should toggle theme correctly', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.isDark).toBe(!result.current.isDark)
  })
})

// 本地存储Hook测试
describe('useLocalStorage', () => {
  test('should persist value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(localStorage.getItem('test-key')).toBe('"new-value"')
  })
})
```

### 测试工具
```typescript
// 测试辅助函数
export const createMockWeb3React = (overrides?: Partial<Web3State>) => {
  return {
    account: '0x1234...',
    chainId: 56,
    connector: null,
    isActive: true,
    isConnecting: false,
    error: null,
    library: {},
    ...overrides
  }
}

export const createMockCurrency = (overrides?: Partial<Currency>) => {
  return {
    decimals: 18,
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    ...overrides
  }
}
```

### 质量指标
```typescript
// 性能监控
export const usePerformanceMonitor = (hookName: string) => {
  const startTime = useRef<number>()

  useEffect(() => {
    startTime.current = Date.now()
    return () => {
      if (startTime.current) {
        const duration = Date.now() - startTime.current
        if (duration > 100) { // 超过100ms记录警告
          console.warn(`${hookName} took ${duration}ms to execute`)
        }
      }
    }
  })
}
```

## 常见问题 (FAQ)

### Q1: 如何在非React组件中使用这些逻辑？
**A**: 将核心逻辑抽离为纯函数，在Hook中调用；或者使用Jotai/Zustand等状态管理库。

### Q2: 如何处理Hook之间的依赖？
**A**: 使用useEffect依赖数组，或者创建组合Hook来管理复杂交互。

### Q3: 如何优化Hook性能？
**A**: 使用useMemo和useCallback，避免不必要的重新计算；合理设置依赖数组。

### Q4: 如何测试自定义Hook？
**A**: 使用@testing-library/react-hooks或renderHook，模拟依赖和行为。

### Q5: 如何处理服务端渲染(SSR)？
**A**: 检查window对象，使用useEffect处理客户端逻辑，提供默认状态。

## 相关文件清单

### Web3相关
- `src/useActiveWeb3React.ts` - Web3连接状态
- `src/useAccountEventListener.ts` - 钱包事件监听
- `src/useNetwork.ts` - 网络管理
- `src/useBalances.ts` - 余额查询

### 代币和交易
- `src/useCurrency.ts` - 代币选择
- `src/useAllCurrencies.ts` - 所有代币列表
- `src/useTrade.ts` - 交易逻辑

### UI和交互
- `src/useTheme.ts` - 主题管理
- `src/useModal.ts` - 模态框控制
- `src/useOnClickOutside.ts` - 外部点击检测
- `src/useMatchBreakpoints.ts` - 响应式断点

### 数据存储
- `src/useLocalStorage.ts` - 本地存储
- `src/useSessionStorage.ts` - 会话存储
- `src/useCookie.ts` - Cookie操作

### 工具函数
- `src/utils/index.ts` - 工具函数集合
- `src/utils/validation.ts` - 验证工具
- `src/utils/formatting.ts` - 格式化工具

## 变更记录 (Changelog)

- **2025-12-22**: 初始化模块文档，梳理Hook架构和使用模式
- **分析状态**: 核心Hook已识别，需深入具体实现和最佳实践
- **下一步**: 建议分析复杂交互场景和性能优化策略

---

> 🪝 **Hook原则**: 遵循单一职责原则，保持Hook的简洁性和可重用性。