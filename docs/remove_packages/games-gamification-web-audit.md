# Play 菜单功能移除方案（Prediction + Lottery）

> 审计日期：2024-12-24
> 状态：**已完成**

---

## 一、概述

`apps/web` 中存在 **Play 菜单** 下的两个游戏类功能：

| 功能 | 路由 | 说明 |
|------|------|------|
| **Prediction（预测）** | `/prediction` | 价格预测游戏 |
| **Lottery（彩票）** | `/lottery` | 彩票系统 |

这些功能与已删除的 `apps/games`、`apps/gamification` 是**不同的模块**，但属于同一类"游戏化"功能。如需完全移除游戏类功能，需要处理以下内容。

---

## 二、需要移除的内容

### 2.1 页面路由

| 文件 | 说明 |
|------|------|
| `src/pages/prediction/index.tsx` | Prediction 主页面 |
| `src/pages/prediction/leaderboard.tsx` | Prediction 排行榜 |
| `src/pages/api/prediction/` | Prediction API 路由 |
| `src/pages/lottery.tsx` | Lottery 页面 |

### 2.2 视图组件

| 目录 | 文件数 | 说明 |
|------|--------|------|
| `src/views/Predictions/` | ~100+ 文件 | Prediction 完整视图 |
| `src/views/Lottery/` | ~40+ 文件 | Lottery 完整视图 |

### 2.3 状态管理

| 目录/文件 | 说明 |
|-----------|------|
| `src/state/predictions/` | Prediction Redux 状态（13 文件） |
| `src/state/lottery/` | Lottery Redux 状态 |
| `src/state/types.ts` | 包含 Prediction/Lottery 类型定义 |
| `src/state/index.ts` | Redux store 配置（需移除 lottery reducer） |

### 2.4 菜单配置

**文件**：`src/components/Menu/config/config.ts`

需要移除整个 "Play" 菜单项（第 158-206 行）：

```typescript
{
  label: t('Play'),
  icon: GameIcon,
  href: '/prediction',
  overrideSubNavItems: [
    { label: t('Prediction'), href: '/prediction' },
    { label: t('Lottery'), href: '/lottery' },
  ],
  items: [
    { label: t('Springboard'), href: '...', type: DropdownMenuItemType.EXTERNAL_LINK },
    { label: t('Prediction'), href: '/prediction', ... },
    { label: t('Lottery'), href: '/lottery', ... },
    { label: t('CAKE.PAD'), href: '/cakepad', ... },  // ⚠️ 需要保留或移到其他菜单
  ],
}
```

### 2.5 依赖包

**文件**：`apps/web/package.json`

```json
"@pancakeswap/prediction": "workspace:*"
```

### 2.6 合约相关

| 文件 | 说明 |
|------|------|
| `src/config/abi/lotteryV2.ts` | Lottery 合约 ABI |
| `src/config/constants/contracts.ts` | 包含 lottery 合约地址 |
| `src/utils/contractHelpers.ts` | 包含 Prediction/Lottery 合约 helper |
| `src/hooks/useContract.ts` | 包含 Prediction/Lottery 合约 hooks |

### 2.7 其他相关文件

| 文件/目录 | 说明 |
|-----------|------|
| `src/components/SubgraphHealthIndicator/FloatingSubgraphHealthIndicators.tsx` | Prediction subgraph 健康检查 |
| `src/utils/customGTMEventTracking.ts` | GTM 事件追踪（Prediction/Lottery） |
| `src/edge/home/queries/queryPrediction.ts` | Edge 查询 |
| `src/hooks/useBNBPrice.ts` | 被 Prediction 使用 |
| `src/hooks/useCakePrice.ts` | 被 Prediction 使用 |
| `src/__tests__/views/predictions/` | Prediction 测试文件 |
| `public/images/decorations/prediction.png` | 菜单图片 |
| `public/images/decorations/lottery.png` | 菜单图片 |

---

## 三、需要保留/迁移的内容

### 3.1 CAKE.PAD（IFO）

当前 CAKE.PAD 在 "Play" 菜单下，移除 Play 菜单后需要：
- **方案 A**：将 CAKE.PAD 移到其他菜单（如 "Earn" 或 "More"）
- **方案 B**：保留 Play 菜单，仅移除 Prediction/Lottery

### 3.2 Springboard 外链

当前 Springboard 在 "Play" 菜单下，需要决定是否保留。

---

## 四、workspace 包依赖分析

### 4.1 `@pancakeswap/prediction` 包

**路径**：`packages/prediction/`

**被依赖情况**：
- `apps/web` - **唯一使用者** ✅

**结论**：可以安全删除该包。

---

## 五、执行步骤

### 阶段 1：删除 packages/prediction

```bash
rm -rf packages/prediction
```

### 阶段 2：删除页面和视图

```bash
# 删除页面
rm -rf apps/web/src/pages/prediction
rm -rf apps/web/src/pages/api/prediction
rm apps/web/src/pages/lottery.tsx

# 删除视图
rm -rf apps/web/src/views/Predictions
rm -rf apps/web/src/views/Lottery

# 删除状态
rm -rf apps/web/src/state/predictions
rm -rf apps/web/src/state/lottery

# 删除测试
rm -rf apps/web/src/__tests__/views/predictions
```

### 阶段 3：菜单调整

修改 `apps/web/src/components/Menu/config/config.ts`：
- 移除整个 "Play" 菜单项
- 将 CAKE.PAD 移到 "More" 菜单下

### 阶段 4：清理引用

1. 更新 `apps/web/package.json` - 移除 `@pancakeswap/prediction` 依赖
2. 更新 `src/state/index.ts` - 移除 lottery reducer
3. 更新 `src/state/types.ts` - 移除 Prediction/Lottery 类型
4. 更新 `src/utils/contractHelpers.ts` - 移除相关 helper
5. 更新 `src/hooks/useContract.ts` - 移除相关 hooks
6. 更新 `src/config/constants/contracts.ts` - 移除 lottery 地址
7. 删除 `src/config/abi/lotteryV2.ts`
8. 更新 `src/components/SubgraphHealthIndicator/FloatingSubgraphHealthIndicators.tsx`
9. 更新 `src/utils/customGTMEventTracking.ts`
10. 删除 `src/edge/home/queries/queryPrediction.ts`

### 阶段 5：验证

```bash
pnpm install
pnpm --filter web build
pnpm --filter web dev
```

---

## 六、风险评估

| 风险 | 等级 | 说明 |
|------|------|------|
| CAKE.PAD 入口丢失 | 🔴 高 | 需要提前规划新位置 |
| 合约 helper 被其他功能使用 | 🟡 中 | 需要检查交叉引用 |
| 价格 hooks 被其他功能使用 | 🟡 中 | `useBNBPrice`/`useCakePrice` 可能被其他地方使用 |
| 构建失败 | 🟡 中 | 需要逐步清理，确保无遗漏引用 |

---

## 七、决策确认

| 决策项 | 结果 |
|--------|------|
| 移除 Prediction | ✅ 是 |
| 移除 Lottery | ✅ 是 |
| 删除 `packages/prediction` | ✅ 是 |
| CAKE.PAD 放置位置 | 移到 "More" 菜单 |

---

## 八、总结

| 模块 | 影响范围 | 复杂度 |
|------|----------|--------|
| Prediction | ~100+ 文件 | 🔴 高 |
| Lottery | ~60+ 文件 | 🟡 中 |
| Play 菜单 | 1 文件 | 🟢 低 |

**建议**：分阶段执行，先移除菜单入口，再逐步清理代码，每步验证构建。
