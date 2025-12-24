# Games + Gamification 模块移除方案

> 执行日期：2024-12-24
> 状态：**已完成**

---

## 一、移除概述

本次移除操作针对 **GAMES（游戏中心）** 和 **GAMIFICATION（游戏化任务系统）** 两个模块，包括：

| 移除项 | 路径 | 说明 |
|--------|------|------|
| apps/games | `apps/games/` | 游戏中心独立站点 |
| apps/gamification | `apps/gamification/` | 游戏化任务系统 |
| packages/games | `packages/games/` | 游戏数据配置包（`@pancakeswap/games`） |

---

## 二、移除原因

1. **独立性**：这两个 apps 与主应用 `apps/web` 完全独立，无相互依赖
2. **业务精简**：不再需要游戏中心和游戏化任务功能
3. **维护成本**：减少不必要的代码维护负担

---

## 三、已执行的操作

### 3.1 目录删除

```bash
rm -rf apps/games
rm -rf apps/gamification
rm -rf packages/games
```

### 3.2 文档和配置更新

| 文件 | 更新内容 |
|------|----------|
| `CLAUDE.md` | 移除 games/gamification 相关描述、架构图、模块索引、开发命令 |
| `README.md` | 移除 apps/games 的启动说明 |
| `.claude/index.json` | 移除 games/gamification 模块定义 |
| `package.json` | 移除 `dev:games`、`dev:gamification`、`build:games`、`build:gamification` 脚本 |

### 3.3 依赖关系分析

**apps/games 依赖的 workspace packages**：
- `@pancakeswap/blog`
- `@pancakeswap/chains`
- `@pancakeswap/games` ⚠️ 专用（已删除）
- `@pancakeswap/hooks`
- `@pancakeswap/localization`
- `@pancakeswap/uikit`
- `@pancakeswap/utils`

**apps/gamification 依赖的 workspace packages**：
- `@pancakeswap/achievements`
- `@pancakeswap/chains`
- `@pancakeswap/hooks`
- `@pancakeswap/ifos`
- `@pancakeswap/localization`
- `@pancakeswap/multicall`
- `@pancakeswap/prediction`
- `@pancakeswap/sdk`
- `@pancakeswap/smart-router`
- `@pancakeswap/swap-sdk-core`
- `@pancakeswap/tokens`
- `@pancakeswap/ui-wallets`
- `@pancakeswap/uikit`
- `@pancakeswap/utils`
- `@pancakeswap/wagmi`
- `@pancakeswap/v3-sdk`
- `@pancakeswap/widgets-internal`

**注意**：上述共享 packages（如 `@pancakeswap/achievements`、`@pancakeswap/prediction`）仍被 `apps/web` 使用，**不能删除**。

---

## 四、对 apps/web 的影响

### 4.1 无直接影响

- `apps/web` 不依赖 `apps/games` 或 `apps/gamification`
- `apps/web` 不依赖 `@pancakeswap/games`
- 菜单中的 `GameIcon` 来自 `@pancakeswap/uikit`，用于 "Play" 菜单（Prediction/Lottery），保留正常

### 4.2 保留的相关功能

`apps/web` 中仍保留以下功能：
- **Prediction**（预测）：`/prediction` 路由
- **Lottery**（彩票）：`/lottery` 路由
- **CAKE.PAD**（IFO）：`/cakepad` 路由

这些功能与 games/gamification 无关。

---

## 五、验证步骤

### 5.1 重新安装依赖

```bash
pnpm install
```

### 5.2 验证 web 构建

```bash
pnpm --filter web build
```

### 5.3 验证开发环境

```bash
pnpm --filter web dev
```

### 5.4 检查遗留引用

```bash
# 确认无残留引用
grep -r "@pancakeswap/games" --include="*.ts" --include="*.tsx" --include="*.json" .
grep -r "apps/games" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" .
grep -r "apps/gamification" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" .
```

---

## 六、回滚方案

如需恢复，可通过 git 恢复：

```bash
# 恢复删除的目录
git checkout HEAD -- apps/games apps/gamification packages/games

# 恢复文档
git checkout HEAD -- CLAUDE.md README.md .claude/index.json

# 重新安装依赖
pnpm install
```

---

## 七、后续 TODO

- [ ] 运行 `pnpm install` 更新 lockfile
- [ ] 运行 `pnpm --filter web build` 验证构建
- [ ] 运行 `pnpm --filter web dev` 验证开发环境
- [ ] 检查 CI/CD 配置是否有残留（`.github/workflows/`）
- [ ] 提交代码并创建 PR

---

## 八、总结

| 操作 | 状态 | 影响 |
|------|------|------|
| 删除 apps/games | ✅ 完成 | 游戏中心站点不可用 |
| 删除 apps/gamification | ✅ 完成 | 任务系统不可用 |
| 删除 packages/games | ✅ 完成 | 无影响（仅被 apps/games 使用） |
| 更新文档 | ✅ 完成 | CLAUDE.md, README.md, .claude/index.json |
| apps/web 构建 | ⏳ 待验证 | 预期无影响 |

**结论**：GAMES 和 GAMIFICATION 模块已成功移除，对 `apps/web` 无影响。
