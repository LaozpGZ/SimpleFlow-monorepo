[根目录](../../CLAUDE.md) > [apps](../) > **solana**

---

# apps/solana - Solana 链应用

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

PancakeSwap Solana 链专用应用，集成 Jupiter 聚合器。

**核心功能：**
- Solana 代币交换（Jupiter 集成）
- 流动性管理
- CLMM（集中流动性做市商）
- 农场质押

---

## 入口与启动

### 启动命令

```bash
# 开发模式
pnpm dev:solana

# 构建
pnpm build:solana
```

---

## 关键依赖

```json
{
  "dependencies": {
    "@pancakeswap/jupiter-terminal": "workspace:*",
    "@pancakeswap/solana-clmm-sdk": "workspace:*",
    "@pancakeswap/solana-core-sdk": "workspace:*",
    "@solana/wallet-adapter-react": "catalog:",
    "@solana/web3.js": "catalog:",
    "next": "catalog:"
  }
}
```

---

## 相关文件清单

- `src/pages/swap.tsx` - 交换页面
- `src/pages/clmm/` - CLMM 功能
- `src/store/` - 状态管理

---

*本模块文档由 AI 架构师生成。*
