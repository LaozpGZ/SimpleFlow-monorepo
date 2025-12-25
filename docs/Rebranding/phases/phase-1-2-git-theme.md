# Phase 1-2: Git 清理和主题色替换

> **状态**: 待开始  
> **预计时间**: 40 分钟  
> **依赖**: 无

---

## Phase 1: Git 历史清理 ⭐

**预计时间**: 10 分钟

### 目的

创建全新的 Git 历史，完全脱离 PancakeSwap 的提交记录。

### 执行步骤

```bash
# 1. 确保所有更改已提交
git add -A
git commit -m "Pre-rebranding checkpoint"

# 2. 创建全新历史
git checkout --orphan simpleflow-main
git add -A
git commit -m "Initial commit: SimpleFlow v1.0.0"

# 3. 替换主分支
git branch -D main
git branch -m main

# 4. 强制推送到远程 (谨慎操作)
git push -f origin main
```

### 注意事项

⚠️ **警告**: 此操作会删除所有 Git 历史记录，请确保：
- 已备份重要的提交记录
- 团队成员已知晓此操作
- 已通知所有协作者重新 clone 仓库

### 检查清单

- [ ] 确认所有更改已提交
- [ ] 执行 Git 历史清理
- [ ] 验证新历史只有一个提交
- [ ] 推送到远程仓库

---

## Phase 2: 主题色替换 ⭐

**预计时间**: 30 分钟

### 目的

替换 PancakeSwap 的青色主题为 SimpleFlow 的新主题色，实现最大的视觉差异化。

### 主要文件

**核心文件**: `packages/uikit/src/theme/colors.ts`

### 颜色映射

| 用途 | PancakeSwap | SimpleFlow (建议) |
|------|-------------|-------------------|
| 主色 | `#1FC7D4` (青色) | `#6366F1` (紫色) 或 `#10B981` (绿色) |
| 主色深 | `#0098A1` | `#4F46E5` 或 `#059669` |
| 主色浅 | `#7645D9` | `#818CF8` 或 `#34D399` |
| 成功色 | `#31D0AA` | `#10B981` |
| 警告色 | `#FFB237` | `#F59E0B` |
| 错误色 | `#ED4B9E` | `#EF4444` |

### 推荐配色方案

#### 方案 A: 紫色系 (现代科技感)
```typescript
export const colors = {
  primary: '#6366F1',
  primaryBright: '#818CF8',
  primaryDark: '#4F46E5',
  // ...
}
```

#### 方案 B: 绿色系 (金融稳健感)
```typescript
export const colors = {
  primary: '#10B981',
  primaryBright: '#34D399',
  primaryDark: '#059669',
  // ...
}
```

#### 方案 C: 橙色系 (活力创新感)
```typescript
export const colors = {
  primary: '#F59E0B',
  primaryBright: '#FBBF24',
  primaryDark: '#D97706',
  // ...
}
```

### 执行步骤

1. **确定主色调**
   - 与设计团队确认最终配色方案

2. **修改 colors.ts**
   ```bash
   # 打开文件
   code packages/uikit/src/theme/colors.ts
   ```

3. **批量替换颜色值**
   ```bash
   # 替换主色 (示例: 青色 → 紫色)
   find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) \
     -not -path "./node_modules/*" \
     -exec sed -i '' 's/#1FC7D4/#6366F1/g' {} +
   ```

4. **验证效果**
   ```bash
   pnpm dev
   # 打开浏览器查看效果
   ```

### 其他需要更新的文件

| 文件 | 说明 |
|------|------|
| `packages/uikit/src/theme/base.ts` | 基础主题 |
| `packages/uikit/src/theme/dark.ts` | 深色主题 |
| `packages/uikit/src/theme/light.ts` | 浅色主题 |
| `apps/web/src/styles/globals.css` | 全局样式 |
| `apps/web/public/manifest.json` | PWA 主题色 |

### 检查清单

- [ ] 确定最终配色方案
- [ ] 修改 `colors.ts` 主色调
- [ ] 更新深色/浅色主题
- [ ] 更新 PWA manifest 主题色
- [ ] 本地预览验证效果
- [ ] 提交更改

---

## 完成标准

Phase 1-2 完成的标志：

- [ ] Git 历史已清理，只有一个初始提交
- [ ] 主题色已替换为新配色
- [ ] 本地预览显示新的品牌色
- [ ] 所有更改已提交

---

*上一步: [Phase 0: 准备工作](./phase-0-preparation.md)*  
*下一步: [Phase 3: 代币替换](./phase-3-tokens.md)*
