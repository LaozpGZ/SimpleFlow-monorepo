[根目录](../../CLAUDE.md) > [apps](../) > **web**

---

# apps/web - 主 Web 应用

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

PancakeSwap 主 Web 应用，支持 EVM 多链去中心化交易所功能。

**核心功能：**
- 代币交换（Swap）- 支持 V2、V3、Stable Swap
- 流动性管理（Liquidity）- 添加/移除流动性
- 农场质押（Farms）- V2 和 V3 农场
- 池子（Pools）- 灵活池和理财池
- IFO（Initial Farm Offering）- 新代币发行
- NFT 市场
- 预测市场
- 投票和治理
- 跨链桥

**支持的链：**
- BSC（BNB Chain）
- Ethereum
- Polygon
- Aptos（通过桥接）
- 以及其他 EVM 兼容链

---

## 入口与启动

### 入口文件

- **主入口**：`apps/web/src/pages/index.tsx`
  ```typescript
  const IndexPage = () => {
    return (
      <Suspense>
        <HomeV2 />
      </Suspense>
    )
  }
  ```

- **应用配置**：`apps/web/src/pages/_app.tsx`
- **Next.js 配置**：`apps/web/next.config.mjs`

### 启动命令

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 生产启动
pnpm start
```

### 环境变量

- `.env.production` - 生产环境配置
- `.env.local` - 本地开发配置（不提交）

---

## 对外接口

### 主要页面路由

| 路由 | 组件 | 功能 |
|------|------|------|
| `/` | `pages/index.tsx` | 首页 |
| `/swap` | `pages/swap/index.tsx` | 交换页面 |
| `/liquidity` | `pages/liquidity/index.tsx` | 流动性首页 |
| `/liquidity/add` | `pages/liquidity/add/[[...poolId]].tsx` | 添加流动性 |
| `/liquidity/remove` | `pages/liquidity/remove/[[...currency]].tsx` | 移除流动性 |
| `/farms` | 动态路由 | 农场页面 |
| `/pools` | 动态路由 | 池子页面 |
| `/ifo` | 动态路由 | IFO 页面 |
| `/nfts` | 动态路由 | NFT 市场 |
| `/prediction` | 动态路由 | 预测市场 |

### API 路由

- `/api/configs/farms/v2/[chain].ts` - V2 农场配置
- `/api/configs/farms/v2/index.ts` - V2 农场索引
- `/api/v3/[chainId]/farms/index.ts` - V3 农场数据
- `/api/query/transaction/index.ts` - 交易查询
- `/api/pools/tvlref.ts` - 池子 TVL

---

## 关键依赖与配置

### 核心依赖

```json
{
  "dependencies": {
    "@pancakeswap/chains": "workspace:*",
    "@pancakeswap/farms": "workspace:*",
    "@pancakeswap/hooks": "workspace:*",
    "@pancakeswap/localization": "workspace:*",
    "@pancakeswap/smart-router": "workspace:*",
    "@pancakeswap/swap-sdk-core": "workspace:*",
    "@pancakeswap/tokens": "workspace:*",
    "@pancakeswap/ui-wallets": "workspace:*",
    "@pancakeswap/uikit": "workspace:*",
    "@pancakeswap/v3-sdk": "workspace:*",
    "viem": "catalog:",
    "wagmi": "catalog:",
    "next": "catalog:",
    "@tanstack/react-query": "^5.52.1"
  }
}
```

### 配置目录

```
apps/web/src/config/
├── abi/              # 合约 ABI
├── cakepad.config.ts # Cakepad 配置
├── chains.ts         # 链配置
├── constants/        # 常量（合约、列表等）
├── merkl.ts          # Merkl 配置
├── nodes.ts          # RPC 节点配置
├── pools.ts          # 池子配置
└── wallet.ts         # 钱包配置
```

---

## 数据模型

### 状态管理

- **Redux Store**：`apps/web/src/state/`
  - `info/` - Info 数据（GraphQL）
  - `user/` - 用户状态
  - `predictions/` - 预测市场

- **Jotai**：用于局部状态
  - 原子化状态管理
  - 与 React Query 集成

### 关键数据类型

```typescript
// 代币信息
interface Token {
  address: string
  symbol: string
  decimals: number
  chainId: number
}

// 路由信息
interface Route {
  route: Token[]
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
}

// 农场信息
interface Farm {
  pid: number
  lpAddress: string
  token: Token
  quoteToken: Token
  earningToken: Token
}
```

---

## 测试与质量

### 测试配置

- **单元测试**：Vitest
  - 配置：`vitest.config.ts`
  - 测试：`src/**/__tests__/*.test.ts`

- **配置测试**：`vitest-config-test.config.ts`
  - 测试配置文件有效性

- **E2E 测试**：Cypress（在 `apps/e2e`）

### Lint 配置

```json
{
  "extends": [
    "@pancakeswap/eslint-config-pancake"
  ]
}
```

### 质量命令

```bash
# 类型检查
pnpm typechecks

# Lint
pnpm lint

# 测试
pnpm test

# 配置测试
pnpm test:config
```

---

## 常见问题 (FAQ)

### Q: 如何添加新链支持？

A: 需要修改以下位置：
1. `packages/chains/src/chains.ts` - 添加链配置
2. `packages/tokens/src/allTokens.ts` - 添加代币
3. `apps/web/src/config/nodes.ts` - 添加 RPC 节点
4. `apps/web/src/config/constants/supportChains.ts` - 启用链

### Q: 如何添加新的流动性池？

A: 在 `apps/web/src/config/pools.ts` 添加池子配置。

### Q: 农场数据从哪里获取？

A:
- V2 农场：通过子图（GraphQL）获取
- V3 农场：通过 multicall 获取链上数据
- 也可使用 `apis/farms` Cloudflare Workers API

### Q: 如何修改交易路由计算？

A: 路由计算由 `@pancakeswap/smart-router` 处理，可查看：
- `packages/smart-router/` - 智能路由逻辑
- `packages/routing-sdk/` - 路由 SDK

---

## 相关文件清单

### 核心文件

- `src/pages/index.tsx` - 首页入口
- `src/pages/_app.tsx` - 应用配置
- `src/Providers.tsx` - 全局 Provider
- `next.config.mjs` - Next.js 配置
- `package.json` - 依赖配置
- `tsconfig.json` - TypeScript 配置

### 关键目录

- `src/views/` - 页面视图组件
- `src/components/` - 共享组件
- `src/config/` - 配置文件
- `src/state/` - Redux 状态
- `src/utils/` - 工具函数
- `src/hooks/` - 自定义 Hooks
- `src/quoter/` - 交易报价

---

*本模块文档由 AI 架构师生成。*
