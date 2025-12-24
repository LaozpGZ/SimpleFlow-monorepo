[根目录](../../CLAUDE.md) > [packages](../) > **swap-sdk-evm**

---

# packages/swap-sdk-evm - EVM Swap SDK

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/swap-sdk-evm` 是 EVM 链的 Swap SDK，提供核心交易功能。

**核心功能：**
- 代币实体和计算
- 交易路由
- 滑点计算
- 价格计算

---

## 入口与启动

### 构建命令

```bash
pnpm --filter @pancakeswap/swap-sdk-evm build
```

---

## 主要导出

```typescript
export * from './constants'
export * from './entities'
export * from './utils'
export * from './abis/ERC20'
```

---

*本模块文档由 AI 架构师生成。*
