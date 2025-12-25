# SimpleFlow 品牌替换执行指南

> 本目录包含品牌替换的分阶段执行文档

---

## 📋 文档索引

| Phase | 文档 | 预计时间 | 状态 |
|-------|------|---------|------|
| 0 | [准备工作](./phase-0-preparation.md) | 2-3 周 | ⏳ 待开始 |
| 1-2 | [Git 清理和主题色](./phase-1-2-git-theme.md) | 40 分钟 | ⏳ 待开始 |
| 3 | [代币替换 (CAKE→SDX)](./phase-3-tokens.md) | 4 小时 | ⏳ 待开始 |
| 4-5 | [域名/品牌名替换](./phase-4-5-domain-brand.md) | 2 小时 | ⏳ 待开始 |
| 6 | [包名替换](./phase-6-packages.md) | 2 小时 | ⏳ 待开始 |
| 7 | [Logo 和资源替换](./phase-7-assets.md) | 1 小时 | ⏳ 待开始 |
| 8 | [其他清理](./phase-8-cleanup.md) | 1 小时 | ⏳ 待开始 |
| 9 | [验证和测试](./phase-9-testing.md) | 2 小时 | ⏳ 待开始 |

---

## 🚀 快速开始

### 推荐执行顺序

```
Phase 0 (并行)
    ↓
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9
   ↓         ↓         ↓         ↓         ↓         ↓         ↓         ↓         ↓
 Git清理   主题色    代币替换   域名替换   品牌名    包名替换   Logo替换   其他清理   验证测试
 10分钟    30分钟    4小时      1小时      1小时     2小时      1小时      1小时      2小时
```

### 立即可以开始

1. **Phase 0.1** - 发送设计需求给外包团队
2. **Phase 1** - Git 历史清理 (10 分钟)
3. **Phase 2** - 主题色替换 (30 分钟)

---

## ⏱️ 时间估算

| 类别 | 时间 |
|------|------|
| 代码工作 | **1-2 天** |
| 设计外包 | **2-3 周** (可并行) |
| **总计** | **2-3 周** |

---

## ✅ 已完成项目

| 项目 | 状态 |
|------|------|
| Lottery 功能 | ✅ 已移除 |
| Pottery 功能 | ✅ 已移除 |
| Prediction 功能 | ✅ 已移除 |
| SimpleChain 配置 | ✅ 已存在 |
| SDX/WSRW 代币定义 | ✅ 已存在 |

---

## 📁 相关文档

- [品牌替换总览](../rebranding-overview.md) - 完整规划文档
- [品牌资源设计规范](../brand-assets-spec.md) - 外包设计需求
- [品牌资源文件清单](../brand-assets-file-list.md) - 原始文件清单
- [原始资源文件](../file/) - 参考资源目录

---

## 🔧 常用命令

### 包名替换
```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/from '@pancakeswap\//from '@simpleflow\//g" {} +
```

### 域名替换
```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancakeswap\.finance/simpleflow.finance/g' {} +
```

### 品牌名替换
```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +
```

### 验证构建
```bash
pnpm install && pnpm build
```

---

*创建时间: 2024-12-25*
