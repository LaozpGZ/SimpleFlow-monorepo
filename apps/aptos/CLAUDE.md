[根目录](../../CLAUDE.md) > [apps](../) > **aptos**

---

# apps/aptos - Aptos 链应用

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

PancakeSwap Aptos 链专用应用，提供 Aptos 链的 DEX 功能。

**核心功能：**
- Aptos 代币交换
- 流动性管理
- 农场质押
- 池子管理
- IFO

---

## 入口与启动

### 启动命令

```bash
# 开发模式
pnpm dev:aptos

# 构建
pnpm build:aptos
```

---

## 关键依赖

```json
{
  "dependencies": {
    "@aptos-labs/ts-sdk": "catalog:",
    "@pancakeswap/aptos-swap-sdk": "workspace:*",
    "@pancakeswap/awgmi": "workspace:*",
    "next": "catalog:"
  }
}
```

---

## 相关文件清单

- `src/pages/swap.tsx` - 交换页面
- `src/views/Ifos/` - IFO 组件

---

*本模块文档由 AI 架构师生成。*
