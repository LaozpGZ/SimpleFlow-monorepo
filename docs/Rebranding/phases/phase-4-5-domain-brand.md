# Phase 4-5: 域名/品牌名替换

> **状态**: 部分完成  
> **预计时间**: 2 小时  
> **依赖**: Phase 3 完成

---

## 当前状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 域名替换 | ✅ 已完成 | `simpleflow.finance` 已替换 |
| 品牌名替换 | ⚠️ 待完成 | `PancakeSwap` 文案需替换 |
| Meta 信息 | ⚠️ 待完成 | 仍显示 PancakeSwap |
| PWA Manifest | ⚠️ 部分完成 | homepage_url 已更新，name 未更新 |
| 新域名引用 | ✅ | `simpleflow.finance` 已有 591 处引用 |

---

## Phase 4: 域名替换 ⚠️ 部分完成

**状态**: 部分完成 (仍有 130 处残留)

### 已更新的文件

以下文件的域名已替换为 `simpleflow.finance`:

| 文件 | 引用数 | 状态 |
|------|--------|------|
| `apps/web/src/config/constants/endpoints.ts` | 12 | ✅ |
| `apps/web/src/config/constants/lists.ts` | 10 | ✅ |
| `apps/web/src/config/constants/tokenLists/*.json` | 78 | ✅ |
| `packages/uikit/src/widgets/Menu/components/footerConfig.ts` | 20 | ✅ |
| `packages/uikit/src/components/Footer/config.tsx` | 10 | ✅ |
| `packages/tokens/src/constants/common.ts` | 15 | ✅ |
| `packages/ifos/src/constants/ifos/bsc.ts` | 24 | ✅ |

### 验证命令

```bash
# 验证域名替换完成
grep -r "pancakeswap\.com" --include="*.ts" --include="*.tsx" --include="*.json" . | grep -v node_modules | wc -l
# 预期结果: 0

grep -r "pancakeswap\.finance" --include="*.ts" --include="*.tsx" --include="*.json" . | grep -v node_modules | wc -l
# 预期结果: 0

# 验证新域名存在
grep -r "simpleflow\.finance" --include="*.ts" --include="*.tsx" --include="*.json" . | grep -v node_modules | wc -l
# 预期结果: 500+
```

---

## Phase 5: 品牌名替换 ⚠️ 待完成

**预计时间**: 1.5 小时

### 目的

将所有 "PancakeSwap" 文案替换为 "SimpleFlow"。

### 影响范围 (实际统计)

| 类型 | 匹配数 | 说明 |
|------|--------|------|
| `PancakeSwap` (代码) | **749** | ts/tsx/json 文件 |
| 国际化文案 | 345 | en-US: 114, zh-CN: 115, zh-TW: 116 |
| Meta/Manifest | 2 | 关键配置文件 |

---

### Step 5.1: 高优先级文件 (手动更新)

以下文件需要**手动检查和更新**：

#### 5.1.1 Meta 信息

**文件**: `apps/web/src/config/constants/meta.ts`

```typescript
// 当前内容 (需更新)
export const DEFAULT_META: PageMeta = {
  title: 'PancakeSwap',  // → 'SimpleFlow'
  description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
  // → 'Trade, earn, and own crypto on SimpleChain'
}

// 第 92 行
defaultTitleSuffix: t('PancakeSwap'),  // → t('SimpleFlow')

// 第 50, 55, 61, 66, 76 行 - 描述中的 Pancakeswap
description: 'View statistics for Pancakeswap exchanges.',
// → 'View statistics for SimpleFlow exchanges.'
```

#### 5.1.2 PWA Manifest

**文件**: `apps/web/public/manifest.json`

```json
{
  "short_name": "PancakeSwap",  // → "SimpleFlow"
  "name": "PancakeSwap",        // → "SimpleFlow"
  "description": "Farm CAKE with Pancake LP Tokens",  // → "Trade, earn, and own crypto on SimpleChain"
  "theme_color": "#1FC7D4",     // → "#6366F1" (如果已更新主题色)
  "iconPath": "/images/cake.svg" // → "/images/sdx.svg" 或移除
}
```

#### 5.1.3 页面路由 Meta

**文件**: `apps/web/src/config/constants/meta.ts` 第 83-84 行

```typescript
'/pancake-squad': { basePath: true, title: t('Pancake Squad') },
// → '/simpleflow-squad': { basePath: true, title: t('SimpleFlow Squad') },

'/cake-staking': { basePath: true, title: t('CAKE Staking') },
// → '/sdx-staking': { basePath: true, title: t('SDX Staking') },
```

---

### Step 5.2: 国际化文案替换

**文件**:
- `locales/en-US.json` (114 处)
- `locales/zh-CN.json` (115 处)
- `locales/zh-TW.json` (116 处)

```bash
# 替换语言文件中的品牌名
find ./locales -name "*.json" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +

# 替换 Pancake 收藏品相关
find ./locales -name "*.json" \
  -exec sed -i '' 's/Pancake Collectible/SimpleFlow Collectible/g' {} +

find ./locales -name "*.json" \
  -exec sed -i '' 's/Pancake 收藏品/SimpleFlow 收藏品/g' {} +

# 替换 Pancake Profile
find ./locales -name "*.json" \
  -exec sed -i '' 's/Pancake Profile/SimpleFlow Profile/g' {} +

find ./locales -name "*.json" \
  -exec sed -i '' 's/Pancake 個人檔案/SimpleFlow 個人檔案/g' {} +
```

#### 需要手动检查的特殊文案

| 原文 | 建议替换 | 说明 |
|------|---------|------|
| `Pancake Squad` | `SimpleFlow Squad` | NFT 系列名 |
| `Pancake Collectible` | `SimpleFlow Collectible` | 收藏品 |
| `Pancake Profile` | `SimpleFlow Profile` | 用户档案 |
| `pancakes` (煎饼) | 保留或移除 | 吉祥物相关文案 |

---

### Step 5.3: 批量替换品牌名

```bash
# 备份当前状态
git add -A && git commit -m "Pre-brand-replacement checkpoint"

# 替换 PancakeSwap (大小写敏感)
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +

# 替换 JSON 文件中的品牌名
find . -type f -name "*.json" \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +

# 替换 MD 文件中的品牌名
find . -type f -name "*.md" \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +
```

---

### Step 5.4: Footer 配置更新

**文件**: `packages/uikit/src/components/Footer/config.tsx` (23 处)

需要更新的内容：
- 社交媒体链接
- 品牌名显示
- 文档链接

---

### Step 5.5: 特殊文件处理

#### Token Lists 文件名

| 当前文件名 | 新文件名 |
|-----------|---------|
| `pancake-default.tokenlist.json` | `simpleflow-default.tokenlist.json` |
| `pancake-supported-onramp-currency-list.json` | `simpleflow-supported-onramp-currency-list.json` |

```bash
# 重命名 token list 文件
cd apps/web/src/config/constants/tokenLists/
mv pancake-default.tokenlist.json simpleflow-default.tokenlist.json 2>/dev/null || true
mv pancake-supported-onramp-currency-list.json simpleflow-supported-onramp-currency-list.json 2>/dev/null || true

cd apps/aptos/config/constants/tokenLists/
mv pancake-default.tokenlist.json simpleflow-default.tokenlist.json 2>/dev/null || true
```

#### 更新引用

```bash
# 更新对 token list 文件的引用
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancake-default\.tokenlist/simpleflow-default.tokenlist/g' {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancake-supported-onramp/simpleflow-supported-onramp/g' {} +
```

---

## 验证脚本

### 验证品牌名替换

```bash
#!/bin/bash
# 保存为 scripts/verify-brand-replacement.sh

echo "=== 品牌名替换验证 ==="

# 检查 PancakeSwap 残留
PANCAKE_COUNT=$(grep -r "PancakeSwap" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l)
echo "PancakeSwap 残留: $PANCAKE_COUNT 处"

# 检查 SimpleFlow 引用
SIMPLEFLOW_COUNT=$(grep -r "SimpleFlow" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l)
echo "SimpleFlow 引用: $SIMPLEFLOW_COUNT 处"

# 检查关键文件
echo ""
echo "=== 关键文件检查 ==="

# meta.ts
if grep -q "PancakeSwap" apps/web/src/config/constants/meta.ts 2>/dev/null; then
  echo "❌ meta.ts 仍包含 PancakeSwap"
else
  echo "✅ meta.ts 已更新"
fi

# manifest.json
if grep -q "PancakeSwap" apps/web/public/manifest.json 2>/dev/null; then
  echo "❌ manifest.json 仍包含 PancakeSwap"
else
  echo "✅ manifest.json 已更新"
fi

# locales
LOCALE_PANCAKE=$(grep -c "PancakeSwap" locales/en-US.json 2>/dev/null || echo "0")
echo "locales/en-US.json PancakeSwap 残留: $LOCALE_PANCAKE 处"

echo ""
if [ "$PANCAKE_COUNT" -eq 0 ]; then
  echo "✅ 品牌名替换完成!"
else
  echo "⚠️ 仍有 $PANCAKE_COUNT 处 PancakeSwap 需要处理"
fi
```

---

## 回滚方案

如果替换出现问题，可以回滚：

```bash
# 方案 1: Git 回滚到检查点
git reset --hard HEAD~1

# 方案 2: 恢复特定文件
git checkout HEAD~1 -- apps/web/src/config/constants/meta.ts
git checkout HEAD~1 -- apps/web/public/manifest.json
git checkout HEAD~1 -- locales/

# 方案 3: 反向替换 (紧急情况)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/SimpleFlow/PancakeSwap/g' {} +
```

---

## 检查清单

### Phase 4 ⚠️
- [ ] 替换 `pancakeswap.com` 域名 (4 处残留)
- [ ] 替换 `pancakeswap.finance` 域名 (126 处残留)
- [x] 更新 `endpoints.ts` (部分完成，仍有残留)
- [x] 更新 `lists.ts`
- [x] 更新 token list URLs

### Phase 5 ⚠️
- [ ] 更新 `meta.ts` (title, description)
- [ ] 更新 `manifest.json` (name, short_name)
- [ ] 替换国际化文案 (345 处)
- [ ] 批量替换 PancakeSwap → SimpleFlow
- [ ] 重命名 token list 文件
- [ ] 更新 Footer 配置
- [ ] 运行验证脚本
- [ ] 提交更改

---

## 完成标准

Phase 4-5 完成的标志：

- [ ] 所有域名已替换为 `simpleflow.finance` (仍有 130 处残留)
- [ ] 所有 `PancakeSwap` 已替换为 `SimpleFlow`
- [ ] 国际化文案已更新
- [ ] Meta 信息已更新
- [ ] PWA Manifest 已更新
- [ ] 验证脚本通过
- [ ] 所有更改已提交

---

## 执行顺序建议

1. **先备份**: `git add -A && git commit -m "checkpoint"`
2. **手动更新关键文件**: meta.ts, manifest.json
3. **批量替换品牌名**: 运行 sed 命令
4. **更新国际化文案**: 运行 locales 替换
5. **重命名文件**: token list 文件
6. **验证**: 运行验证脚本
7. **测试构建**: `pnpm build`
8. **提交**: `git add -A && git commit -m "Phase 5: Brand name replacement"`

---

*上一步: [Phase 3: 代币替换](./phase-3-tokens.md)*  
*下一步: [Phase 6: 包名替换](./phase-6-packages.md)*
