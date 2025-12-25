# Phase 8: 其他清理

> **状态**: 待开始  
> **预计时间**: 1 小时  
> **依赖**: Phase 7 完成

---

## 目的

清理其他品牌相关的残留内容。

---

## 8.1 Syrup Pool 术语替换

PancakeSwap 特有术语 "Syrup Pool" 需要替换为通用术语。

```bash
# 替换 "Syrup Pool" 为 "Staking Pool"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/Syrup Pool/Staking Pool/g' {} +
```

### 检查清单

- [ ] 替换 "Syrup Pool" 术语

---

## 8.2 Cakepad 重命名 (可选)

如果需要重命名 IFO 平台：

```bash
# 重命名目录
mv apps/web/src/views/Cakepad apps/web/src/views/Launchpad
mv apps/web/src/pages/cakepad apps/web/src/pages/launchpad

# 更新引用
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/Cakepad/Launchpad/g' {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/cakepad/launchpad/g' {} +
```

### 检查清单

- [ ] 重命名 Cakepad → Launchpad (如需要)

---

## 8.3 GitHub 链接清理

代码中有 322 处 `github.com/pancakeswap` 引用。

```bash
# 替换 GitHub 链接
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/github\.com\/pancakeswap/github.com\/simpleflow-finance/g' {} +
```

### 检查清单

- [ ] 替换 GitHub 链接

---

## 8.4 LICENSE 文件更新

需要更新版权所有者信息：

```
/LICENSE
/packages/solana-core-sdk/LICENSE
/apps/solana/LICENSE
/packages/swap-sdk-core/LICENSE
/packages/swap-sdk/LICENSE
```

### 检查清单

- [ ] 更新 LICENSE 文件版权信息

---

## 8.5 CLAUDE.md 文件更新

AI 配置文件需要更新项目说明：

```
/CLAUDE.md
/apps/web/src/views/CLAUDE.md
/packages/v3-sdk/CLAUDE.md
/packages/solana-core-sdk/CLAUDE.md
```

### 检查清单

- [ ] 更新 CLAUDE.md 文件

---

## 8.6 社交媒体链接

**文件**: `packages/uikit/src/components/Footer/config.tsx`

| 平台 | 当前链接 | 新链接 |
|------|---------|--------|
| Telegram | `t.me/pancakeswap` | `t.me/simpleflow` |
| Discord | `discord.gg/pancakeswap` | `discord.gg/simpleflow` |
| Medium | `medium.com/pancakeswap` | `medium.com/@simpleflow` |

### 检查清单

- [ ] 更新社交媒体链接

---

## 8.7 环境变量文件

需要检查和更新的 `.env` 文件：

```
apps/web/.env
apps/web/.env.development
apps/web/.env.production
apps/web/.env.example
apps/blog/.env
apps/blog/.env.example
apps/aptos/.env
apps/aptos/.env.example
apps/bridge/.env.example
```

### 检查清单

- [ ] 检查环境变量文件中的品牌相关配置

---

## 完成标准

Phase 8 完成的标志：

- [ ] Syrup Pool 术语已替换
- [ ] GitHub 链接已更新
- [ ] LICENSE 文件已更新
- [ ] CLAUDE.md 文件已更新
- [ ] 社交媒体链接已更新
- [ ] 环境变量文件已检查

---

*上一步: [Phase 7: Logo 和资源替换](./phase-7-assets.md)*  
*下一步: [Phase 9: 验证和测试](./phase-9-testing.md)*
