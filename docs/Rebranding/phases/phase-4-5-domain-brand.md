# Phase 4-5: 域名/品牌名替换

> **状态**: 待开始  
> **预计时间**: 2 小时  
> **依赖**: Phase 3 完成

---

## Phase 4: 域名替换

**预计时间**: 1 小时

### 目的

将所有 PancakeSwap 域名替换为 SimpleFlow 域名。

### 影响范围

| 域名 | 匹配数 |
|------|--------|
| `pancakeswap.com` | 621 |
| `pancakeswap.finance` | 621 |
| `docs.pancakeswap.finance` | 126 |

### Step 4.1: 替换主域名

```bash
# 替换 pancakeswap.com
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancakeswap\.com/simpleflow.finance/g' {} +

# 替换 pancakeswap.finance
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancakeswap\.finance/simpleflow.finance/g' {} +
```

### Step 4.2: 更新端点配置

**文件**: `apps/web/src/config/constants/endpoints.ts`

```typescript
export const THE_GRAPH_PROXY_API = 'https://thegraph.simpleflow.finance'
export const API_PROFILE = 'https://profile.simpleflow.finance'
export const API_NFT = 'https://nft.simpleflow.finance/api/v1'
export const ONRAMP_API_BASE_URL = 'https://onramp-api.simpleflow.finance'
export const NOTIFICATION_HUB_BASE_URL = 'https://notification.simpleflow.finance'
export const ACCESS_RISK_API = 'https://alert.simpleflow.finance/red-api'
export const FARMS_API = 'https://farms-api.simpleflow.finance'
export const WALLET_API = 'https://wallet-api.simpleflow.finance'
export const ASSET_CDN = 'https://assets.simpleflow.finance'
```

### 域名映射表

| 当前域名 | 新域名 |
|---------|--------|
| `pancakeswap.com` | `simpleflow.finance` |
| `pancakeswap.finance` | `simpleflow.finance` |
| `assets.pancakeswap.finance` | `assets.simpleflow.finance` |
| `thegraph.pancakeswap.com` | `thegraph.simpleflow.finance` |
| `profile.pancakeswap.com` | `profile.simpleflow.finance` |
| `farms-api.pancakeswap.com` | `farms-api.simpleflow.finance` |
| `docs.pancakeswap.finance` | `docs.simpleflow.finance` |
| `tokens.pancakeswap.finance` | `tokens.simpleflow.finance` |

### 检查清单

- [ ] 执行主域名替换
- [ ] 验证 endpoints.ts 已更新
- [ ] 检查环境变量文件
- [ ] 提交更改

---

## Phase 5: 品牌名替换

**预计时间**: 1 小时

### 目的

将所有 "PancakeSwap" 文案替换为 "SimpleFlow"。

### 影响范围

| 类型 | 匹配数 |
|------|--------|
| `PancakeSwap` | 14,156 |
| `Pancake` (独立) | 需手动检查 |

### Step 5.1: 替换品牌名

```bash
# 替换 PancakeSwap
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +
```

### Step 5.2: 更新国际化文案

**文件**:
- `locales/en-US.json`
- `locales/zh-CN.json`
- `locales/zh-TW.json`

```bash
# 替换语言文件中的品牌名
find ./locales -name "*.json" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +
```

### Step 5.3: 更新 Meta 信息

**文件**: `apps/web/src/config/constants/meta.ts`

```typescript
export const META = {
  title: 'SimpleFlow - DeFi on SimpleChain',
  description: 'Trade, earn, and own crypto on SimpleChain',
  keywords: 'simpleflow, dex, simplechain, sdx, srw, defi, rwa',
  ogImage: 'https://simpleflow.finance/og-image.png',
}
```

### Step 5.4: 更新 PWA Manifest

**文件**: `apps/web/public/manifest.json`

```json
{
  "name": "SimpleFlow",
  "short_name": "SimpleFlow",
  "description": "Trade, earn, and own crypto on SimpleChain",
  "theme_color": "#6366F1",
  "background_color": "#ffffff"
}
```

### 检查清单

- [ ] 执行品牌名替换
- [ ] 更新国际化文案
- [ ] 更新 Meta 信息
- [ ] 更新 PWA Manifest
- [ ] 手动检查 "Pancake" 独立引用
- [ ] 提交更改

---

## 完成标准

Phase 4-5 完成的标志：

- [ ] 所有域名已替换
- [ ] 所有品牌名已替换
- [ ] 国际化文案已更新
- [ ] Meta 信息已更新
- [ ] 所有更改已提交

---

*上一步: [Phase 3: 代币替换](./phase-3-tokens.md)*  
*下一步: [Phase 6: 包名替换](./phase-6-packages.md)*
