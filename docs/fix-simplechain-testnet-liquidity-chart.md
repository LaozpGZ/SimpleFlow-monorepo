# 修复报告：SimpleChain 添加流动性页面图表不显示问题

## 问题描述

**日期**：2025-12-25

**问题现象**：在 SimpleChain 链（主网和测试网）上访问添加流动性页面时，图表区域显示"您的部位將出現在此處"（Your position will appear here），即使用户已有仓位也无法正常显示流动性深度图表。

**影响页面**：
- 主网：`/add/{token0}/{token1}/{fee}?chain=simplechain`
- 测试网：`/add/{token0}/{token1}/{fee}?chain=simplechainTestnet`

**截图描述**：页面显示 USDC/USDT 交易对，但图表区域只显示占位符文字，无法显示实际的流动性深度数据。

## 问题分析

### 根本原因

`chainIdToExplorerInfoChainName` 映射表中缺少 SimpleChain 链的配置：
- `SIMPLECHAIN` (ChainId: 1913) - 主网
- `SIMPLECHAIN_TESTNET` (ChainId: 1914) - 测试网

导致前端无法向 Explorer API 请求这些链的 tick 数据。

### 代码追踪

1. **图表组件** (`PricePeriodRangeChart.tsx`)
   - 当 `formattedData === undefined && !isLoading` 时显示占位符

2. **数据获取** (`useDensityChartData.ts`)
   - 调用 `usePoolActiveLiquidity` 获取流动性数据

3. **Tick 数据查询** (`useAllTicksQuery.ts`)
   - 使用 `chainIdToExplorerInfoChainName` 将 chainId 转换为 API 路径参数
   - 如果映射不存在，返回空数组

4. **问题所在** (`client.ts`)
   ```typescript
   export const chainIdToExplorerInfoChainName = {
     [ChainId.BSC_TESTNET]: 'bsc-testnet',
     [ChainId.BSC]: 'bsc',
     [ChainId.ETHEREUM]: 'ethereum',
     [ChainId.ZKSYNC]: 'zksync',
     [ChainId.ARBITRUM_ONE]: 'arbitrum',
     [ChainId.LINEA]: 'linea',
     [ChainId.BASE]: 'base',
     [ChainId.OPBNB]: 'opbnb',
     // ❌ 缺少 SIMPLECHAIN
     // ❌ 缺少 SIMPLECHAIN_TESTNET
     [NonEVMChainId.SOLANA]: 'sol',
   }
   ```

## 修复方案

### 修改文件

`apps/web/src/state/info/api/client.ts`

### 修改内容

```diff
 export const chainIdToExplorerInfoChainName = {
   [ChainId.BSC_TESTNET]: 'bsc-testnet',
   [ChainId.BSC]: 'bsc',
   [ChainId.ETHEREUM]: 'ethereum',
   [ChainId.ZKSYNC]: 'zksync',
   [ChainId.ARBITRUM_ONE]: 'arbitrum',
   [ChainId.LINEA]: 'linea',
   [ChainId.BASE]: 'base',
   [ChainId.OPBNB]: 'opbnb',
+  [ChainId.SIMPLECHAIN]: 'simplechain',
+  [ChainId.SIMPLECHAIN_TESTNET]: 'simplechain-testnet',
   [NonEVMChainId.SOLANA]: 'sol',
 } as const
```

## 依赖条件

此修复需要后端 Explorer API 已配置 SimpleChain 的数据源：
- `simplechain` - 主网
- `simplechain-testnet` - 测试网

如果后端未配置：
- 图表将显示"There is no liquidity data."（没有流动性资料）
- 而非当前的"您的部位將出現在此處"占位符

## 测试验证

### 主网测试
1. 访问 `http://localhost:3000/add/{token0}/{token1}/{fee}?chain=simplechain`
2. 确认图表区域能够正常加载流动性深度数据

### 测试网测试
1. 访问 `http://localhost:3000/add/{token0}/{token1}/{fee}?chain=simplechainTestnet`
2. 确认图表区域能够正常加载流动性深度数据

### 预期结果
- 如果池子有流动性，应显示流动性分布图表
- 如果池子无流动性，应显示"There is no liquidity data."

## 相关文件

| 文件路径 | 说明 |
|---------|------|
| `apps/web/src/state/info/api/client.ts` | Explorer API 客户端配置 |
| `apps/web/src/hooks/useAllTicksQuery.ts` | Tick 数据查询 Hook |
| `apps/web/src/hooks/v3/usePoolTickData.ts` | 池子 Tick 数据处理 |
| `apps/web/src/views/AddLiquidityV3/hooks/useDensityChartData.ts` | 流动性图表数据 Hook |
| `packages/widgets-internal/components/PriceRangeChartWithPeriodAndLiquidity/PricePeriodRangeChart.tsx` | 价格范围图表组件 |

## 状态

✅ **已修复**
