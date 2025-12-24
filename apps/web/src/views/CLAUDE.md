[根目录](../../../CLAUDE.md) > [apps](../../) > [web](../) > **src/views**

---

# apps/web/src/views - 主应用页面视图

> 最后更新：2025-12-24 19:19:46 | 详细文档版本

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:25:00 | 深度扫描 | 首次创建模块文档 |

---

## 模块职责

`apps/web/src/views` 是 PancakeSwap 主应用的所有页面视图组件，包含完整的功能页面实现。

**核心功能：**
- Swap（交换）页面
- Liquidity（流动性）管理
- Farms（农场）页面
- Pools（池子）页面
- IFO（初始农场发行）页面
- Limit Orders（限价单）
- Info（信息统计）
- Prediction（预测市场）
- 等等

---

## 文件结构

```
apps/web/src/views/
├── Swap/                        # 交换页面 ⭐
│   ├── index.tsx
│   ├── components/
│   │   ├── SwapModal.tsx
│   │   ├── SwapButton.tsx
│   │   └── ...
│   └── hooks/
│       ├── useSwapCallback.ts
│       └── useSwapState.ts
├── Liquidity/                   # 流动性管理 ⭐
│   ├── index.tsx
│   ├── Add/
│   │   ├── index.tsx
│   │   └── ...
│   ├── Remove/
│   ├── Create/
│   └── Position/
├── Farms/                       # 农场页面 ⭐
│   ├── index.tsx
│   ├── components/
│   │   ├── FarmCard.tsx
│   │   ├── FarmTable.tsx
│   │   └── ...
│   └── hooks/
│       ├── useFarms.ts
│       └── useFarmUserData.ts
├── Pools/                       # 池子页面
│   ├── index.tsx
│   ├── components/
│   └── hooks/
├── LimitOrders/                 # 限价单 ⭐
│   ├── index.tsx
│   ├── components/
│   │   ├── LimitOrderTable/
│   │   ├── ConfirmLimitOrderModal.tsx
│   │   ├── CurrencyInputHeader.tsx
│   │   ├── SwitchTokensButton.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useGelatoLimitOrdersHistory.ts
│   │   └── useFormattedOrderData.ts
│   ├── utils/
│   │   ├── getPriceForOneToken.ts
│   │   └── getRatePercentageDifference.ts
│   └── types.ts
├── Ifo/                         # IFO 页面
│   ├── index.tsx
│   ├── components/
│   │   ├── IfoFoldableCard.tsx
│   │   ├── IfoCardV3Data.tsx
│   │   └── ...
│   └── hooks/
├── HomeV2/                      # 首页
│   ├── index.tsx
│   └── components/
├── Info/                        # 信息统计
│   ├── components/
│   └── hooks/
├── Prediction/                  # 预测市场
│   ├── index.tsx
│   └── components/
├── Nfts/                        # NFT 市场
│   ├── index.tsx
│   └── components/
├── Profile/                     # 用户资料
│   ├── index.tsx
│   └── components/
├── UniversalFarms/              # 统一农场
│   └── hooks/
│       ├── useMultiChains.ts
│       └── useMultiChainsTokens.tsx
└── ...                          # 更多页面
```

---

## 核心页面详解

### 1. Swap 交换页面

**组件**：`Swap/index.tsx`

**功能**：
- 代币交换
- 路由选择
- 价格设置
- 滑点设置
- 交易确认

**关键 Hooks**：
```typescript
// 交换状态
useSwapState()

// 交换回调
useSwapCallback()

// 路由查询
useDerivedSwapInfo()
```

**关键组件**：
- `SwapModal` - 交换确认弹窗
- `SwapButton` - 交换按钮
- `CurrencyInputPanel` - 代币输入面板
- `PriceImpactWarning` - 价格影响警告

### 2. Liquidity 流动性管理

**组件结构**：
```
Liquidity/
├── index.tsx              # 流动性首页
├── Add/                   # 添加流动性
│   ├── index.tsx
│   ├── AddLiquidity.tsx
│   └── hooks/
├── Remove/                # 移除流动性
│   ├── index.tsx
│   └── RemoveLiquidity.tsx
├── Create/                # 创建流动性池
│   └── index.tsx
└── Position/              # 头寸管理
    ├── index.tsx          # V2 头寸
    └── V3/                # V3 头寸
        └── index.tsx
```

**功能**：
- V2 添加/移除流动性
- V3 添加/移除流动性
- 创建新池子
- 管理头寸（NFT）
- 收取手续费

### 3. Farms 农场页面

**组件**：`Farms/index.tsx`

**功能**：
- 显示所有农场
- 质押 LP
- 收获奖励
- 复合质押
- 农场详情

**关键 Hooks**：
```typescript
// 获取农场数据
useFarms()

// 获取用户农场数据
useFarmUserData()

// 获取 APR
useFarmApr()
```

**关键组件**：
- `FarmCard` - 农场卡片
- `FarmTable` - 农场表格
- `StakeModal` - 质押弹窗
- `UnstakeModal` - 解质押弹窗
- `HarvestButton` - 收获按钮

### 4. LimitOrders 限价单

**组件**：`LimitOrders/index.tsx`

**功能**：
- 创建限价单
- 管理限价单
- 取消限价单
- 限价单历史

**关键组件**：
- `LimitOrderTable` - 限价单表格（紧凑/宽敞模式）
- `ConfirmLimitOrderModal` - 确认弹窗
- `CurrencyInputHeader` - 代币输入头部
- `SwitchTokensButton` - 切换代币按钮
- `ExpiredDate` - 到期日期选择

**关键 Hooks**：
```typescript
// 获取 Gelato 限价单历史
useGelatoLimitOrdersHistory()

// 格式化订单数据
useFormattedOrderData()
```

**关键工具**：
```typescript
// 获取单个代币价格
getPriceForOneToken(tokenA, tokenB)

// 计算价格差异百分比
getRatePercentageDifference(rateA, rateB)
```

---

## 通用模式

### 1. 页面结构

大多数页面遵循以下结构：

```typescript
// 页面组件
const MyPage = () => {
  // 1. 自定义 Hooks
  const { data, loading } = useMyData()
  const { account } = useActiveWeb3React()

  // 2. 事件处理
  const handleAction = useCallback(() => {
    // 处理逻辑
  }, [])

  // 3. 渲染
  return (
    <Page>
      <PageHeader>...</PageHeader>
      <Content>...</Content>
    </Page>
  )
}

export default MyPage
```

### 2. 数据获取

使用 `@tanstack/react-query`：

```typescript
import { useQuery } from '@tanstack/react-query'

const useMyData = () => {
  return useQuery({
    queryKey: ['myData', account],
    queryFn: async () => {
      return fetchMyData(account)
    },
    enabled: !!account,
    staleTime: 30000,  // 30 秒
  })
}
```

### 3. 状态管理

- **全局状态**：Redux (`src/state/`)
- **局部状态**：Jotai atom
- **服务器状态**：React Query

### 4. 样式

使用 styled-components：

```typescript
import styled from 'styled-components'

const Container = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.background};
`
```

---

## 关键依赖

### 内部依赖

```typescript
// SDK
import { SwapRouter } from '@pancakeswap/smart-router'
import { Trade } from '@pancakeswap/v3-sdk'
import { Pair } from '@pancakeswap/v2-sdk'

// Hooks
import { useFetchCurrencyUsdPrice } from '@pancakeswap/hooks'
import { useMulticall } from '@pancakeswap/multicall'

// 组件
import { Button, Card, Modal } from '@pancakeswap/uikit'
import { CurrencyInputPanel } from 'components/CurrencyInputPanel'
import { Toast, useToast } from 'components/Toast'
```

### 外部依赖

```typescript
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { useAccount, useBalance } from 'wagmi'
```

---

## 测试策略

### 单元测试

```bash
# 测试特定页面
pnpm test -- LimitOrders
```

### E2E 测试

```bash
# E2E 测试在 apps/e2e
pnpm e2e:ci
```

---

## 常见问题 (FAQ)

### Q: 如何添加新页面？

A:
1. 在 `src/views/` 创建新文件夹
2. 创建 `index.tsx` 页面组件
3. 在 `src/pages/` 添加路由文件
4. 更新导航菜单

### Q: 如何使用智能路由？

A:
```typescript
import { getBestRouter } from '@pancakeswap/smart-router'

const route = await getBestRouter({
  chainId,
  fromToken: tokenA,
  toToken: tokenB,
  amount: amountIn,
  maxHops: 3,
})
```

### Q: 如何处理多链？

A:
```typescript
import { useActiveChainId } from 'hooks/useActiveChainId'
import { SUPPORTED_CHAINS } from 'config/constants/supportChains'

const chainId = useActiveChainId()

// 只在支持的链上显示
if (SUPPORTED_CHAINS.includes(chainId)) {
  return <MyComponent />
}
```

---

## 相关文件清单

### 核心页面

- `Swap/index.tsx` - 交换页面 ⭐
- `Liquidity/index.tsx` - 流动性首页 ⭐
- `Farms/index.tsx` - 农场页面 ⭐
- `LimitOrders/index.tsx` - 限价单页面 ⭐

### 共享组件

- `components/CurrencyInputPanel/` - 代币输入面板
- `components/Modal/` - 模态框
- `components/Button/` - 按钮

---

## 特殊设计模式

### 1. 容器/展示分离

```typescript
// 容器组件（处理逻辑）
const MyPageContainer = () => {
  const { data, loading } = useMyData()
  return <MyPage data={data} loading={loading} />
}

// 展示组件（纯 UI）
const MyPage = ({ data, loading }) => {
  return <div>...</div>
}
```

### 2. 自定义 Hooks 封装

```typescript
// 封装业务逻辑
const useMyFeature = () => {
  const [state, setState] = useState()

  useEffect(() => {
    // 副作用
  }, [])

  const handleAction = useCallback(() => {
    // 处理逻辑
  }, [])

  return { state, handleAction }
}
```

### 3. 高阶组件

```typescript
// 链检查 HOC
const withChainCheck = (Component) => (props) => {
  const chainId = useActiveChainId()

  if (!SUPPORTED_CHAINS.includes(chainId)) {
    return <UnsupportedChain />
  }

  return <Component {...props} />
}
```

---

*本模块文档由 AI 架构师生成，包含核心页面详解。*
