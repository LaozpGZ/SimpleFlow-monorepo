[根目录](../../CLAUDE.md) > [packages](../) > **chains**

---

# packages/chains - 链配置包

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/chains` 是 PancakeSwap 项目的**链配置单一数据源**（Single Source of Truth）。

负责统一管理所有支持的区块链网络配置，包括：
- 链 ID 和基本信息
- RPC 节点配置
- 子图（Subgraph）端点
- 区块时间
- 链名称映射
- 原生代币信息

**重要性：** 所有其他包和应用的链配置都应从此包导入，确保配置一致性。

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/chains",
  "version": "0.7.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts"
}
```

### 构建命令

```bash
# 开发模式
pnpm --filter @pancakeswap/chains dev

# 构建
pnpm --filter @pancakeswap/chains build

# 测试
pnpm --filter @pancakeswap/chains test
```

---

## 对外接口

### 主要导出

```typescript
// 链配置
export * from './chains'
export * from './chainId'
export * from './chainNames'

// 子图配置
export * from './subgraphs'

// 工具函数
export * from './utils'

// 区块时间
export * from './averageChainBlockTimes'
```

### 核心类型

```typescript
// 链配置类型
export interface ChainInfo {
  chainId: number
  chainName: string
  // ... 更多配置
}

// 子图配置类型
export interface SubgraphConfig {
  [chainId: number]: string
}
```

---

## 关键依赖与配置

### 依赖

- 无外部依赖（纯配置包）
- 使用 `tsup` 构建

### 构建配置

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
})
```

---

## 数据模型

### 文件结构

```
packages/chains/src/
├── chains.ts                  # 主链配置
├── chainId.ts                 # 链 ID 常量
├── chainNames.ts              # 链名称映射
├── subgraphs.ts               # 子图端点
├── averageChainBlockTimes.ts  # 平均区块时间
├── utils.ts                   # 工具函数
└── index.ts                   # 导出入口
```

### 核心数据

```typescript
// chains.ts - 链配置
export const CHAINS = {
  [ChainId.BSC]: {
    chainId: 56,
    chainName: 'BNB Chain',
    // ... 更多配置
  },
  [ChainId.ETHEREUM]: {
    chainId: 1,
    chainName: 'Ethereum',
    // ... 更多配置
  },
  // ... 其他链
}

// subgraphs.ts - 子图配置
export const SUBGRAPH_CONFIG: Record<number, string> = {
  [ChainId.BSC]: 'https://api.thegraph.com/subgraphs/name/...',
  [ChainId.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/...',
  // ... 其他链
}

// averageChainBlockTimes.ts - 区块时间
export const AVERAGE_CHAIN_BLOCK_TIME = {
  [ChainId.BSC]: 3, // 3 秒
  [ChainId.ETHEREUM]: 12, // 12 秒
  // ... 其他链
}
```

---

## 测试与质量

### 测试

- **单元测试**：`index.test.ts`
- **链测试**：`test/chain.test.ts`

### 测试命令

```bash
# 运行测试
pnpm --filter @pancakeswap/chains test

# 更新快照
pnpm --filter @pancakeswap/chains update:snapshot
```

---

## 常见问题 (FAQ)

### Q: 如何添加新链？

A: 按以下步骤操作：

1. 在 `chainId.ts` 添加新的链 ID 常量
2. 在 `chains.ts` 添加链配置对象
3. 在 `chainNames.ts` 添加链名称映射
4. 在 `subgraphs.ts` 添加子图端点
5. 在 `averageChainBlockTimes.ts` 添加区块时间
6. 更新测试快照

### Q: 为什么这个包没有依赖？

A: 这是纯配置包，不依赖其他包。所有配置都是静态数据。

### Q: 如何在应用中使用？

A:
```typescript
import { CHAINS, ChainId } from '@pancakeswap/chains'

// 获取特定链配置
const bscChain = CHAINS[ChainId.BSC]

// 获取链名称
import { getChainName } from '@pancakeswap/chains'
const name = getChainName(ChainId.BSC) // 'BNB Chain'
```

### Q: 子图端点是什么？

A: 子图（The Graph）是用于查询链上数据的索引服务，PancakeSwap 使用子图来获取：
- 交易历史
- 流动性池数据
- 农场数据
- 其他链上状态

---

## 相关文件清单

### 核心文件

- `src/chains.ts` - 主链配置
- `src/chainId.ts` - 链 ID 常量
- `src/chainNames.ts` - 链名称映射
- `src/subgraphs.ts` - 子图配置
- `src/averageChainBlockTimes.ts` - 区块时间
- `src/utils.ts` - 工具函数
- `src/index.ts` - 导出入口

### 配置文件

- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置
- `tsup.config.ts` - 构建配置
- `vitest.config.ts` - 测试配置

---

*本模块文档由 AI 架构师生成。*
