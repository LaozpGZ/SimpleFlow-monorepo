# SimpleFlow 品牌替换全景规划

> 将 PancakeSwap 品牌完全替换为 SimpleFlow
> 新域名: `simpleflow.finance`

## 项目背景

| 属性 | 值 |
|------|----|
| **目标平台** | SimpleFlow (DEX) |
| **运行链** | SimpleChain (RWA BSC Fork) |
| **链 ID** | Mainnet: 1913, Testnet: 1914 |
| **原生代币** | SRW (Wrapped: WSRW) |
| **平台币** | SDX (SimpleFlow Token) |
| **域名** | simpleflow.finance |

---

## 概览

| 指标 | 数量 |
|------|------|
| 总匹配数 | 15,235+ |
| 涉及文件 | 3,822 |
| package.json 文件 | 58+ |
| 语言文件 | 3 |
| CAKE 引用 | 13,704 处 |
| veCake 引用 | 522 处 |

---

## 1. 📦 包名与依赖

### 1.1 NPM 包命名空间

**当前**: `@pancakeswap/*`  
**目标**: `@simpleflow/*`

需要修改的包列表：

| 当前包名 | 路径 | 新包名 |
|---------|------|--------|
| `@pancakeswap/uikit` | `packages/uikit` | `@simpleflow/uikit` |
| `@pancakeswap/farms` | `packages/farms` | `@simpleflow/farms` |
| `@pancakeswap/tokens` | `packages/tokens` | `@simpleflow/tokens` |
| `@pancakeswap/chains` | `packages/chains` | `@simpleflow/chains` |
| `@pancakeswap/hooks` | `packages/hooks` | `@simpleflow/hooks` |
| `@pancakeswap/localization` | `packages/localization` | **`@simpleflow/l10n`** ⚠️ |
| `@pancakeswap/multicall` | `packages/multicall` | `@simpleflow/multicall` |
| `@pancakeswap/pools` | `packages/pools` | `@simpleflow/pools` |
| `@pancakeswap/smart-router` | `packages/smart-router` | `@simpleflow/smart-router` |
| `@pancakeswap/swap-sdk` | `packages/swap-sdk` | `@simpleflow/swap-sdk` |
| `@pancakeswap/v2-sdk` | `packages/v2-sdk` | `@simpleflow/v2-sdk` |
| `@pancakeswap/v3-sdk` | `packages/v3-sdk` | `@simpleflow/v3-sdk` |
| `@pancakeswap/utils` | `packages/utils` | `@simpleflow/utils` |
| `@pancakeswap/widgets-internal` | `packages/widgets-internal` | `@simpleflow/widgets-internal` |
| `@pancakeswap/ifos` | `packages/ifos` | `@simpleflow/ifos` |
| `@pancakeswap/infinity-sdk` | `packages/infinity-sdk` | `@simpleflow/infinity-sdk` |
| `@pancakeswap/routing-sdk` | `packages/routing-sdk` | `@simpleflow/routing-sdk` |
| `@pancakeswap/universal-router-sdk` | `packages/universal-router-sdk` | `@simpleflow/universal-router-sdk` |
| `@pancakeswap/price-api-sdk` | `packages/price-api-sdk` | `@simpleflow/price-api-sdk` |
| `@pancakeswap/pcsx-sdk` | `packages/pcsx-sdk` | `@simpleflow/pcsx-sdk` |
| `@pancakeswap/permit2-sdk` | `packages/permit2-sdk` | `@simpleflow/permit2-sdk` |
| `@pancakeswap/stable-swap-sdk` | `packages/stable-swap-sdk` | `@simpleflow/stable-swap-sdk` |
| `@pancakeswap/canonical-bridge` | `packages/canonical-bridge` | `@simpleflow/canonical-bridge` |
| `@pancakeswap/ui-wallets` | `packages/ui-wallets` | `@simpleflow/ui-wallets` |
| `@pancakeswap/wagmi` | `packages/wagmi` | `@simpleflow/wagmi` |
| `@pancakeswap/awgmi` | `packages/awgmi` | `@simpleflow/awgmi` |
| `@pancakeswap/aptos-swap-sdk` | `packages/aptos-swap-sdk` | `@simpleflow/aptos-swap-sdk` |
| `@pancakeswap/token-lists` | `packages/token-lists` | `@simpleflow/token-lists` |
| `@pancakeswap/blog` | `packages/blog` | `@simpleflow/blog` |
| `@pancakeswap/achievements` | `packages/achievements` | `@simpleflow/achievements` |
| `@pancakeswap/eslint-config-pancake` | `packages/eslint-config-pancake` | **`@simpleflow/eslint-config`** ⚠️ |
| `@pancakeswap/tsconfig` | `packages/tsconfig` | `@simpleflow/tsconfig` |

> ⚠️ 标注的包名有特殊重命名规则，不是简单的 `pancakeswap` → `simpleflow` 替换

### 1.2 根项目名称

**文件**: `package.json`

```json
// 当前
"name": "pancake-frontend"

// 目标
"name": "simpleflow-frontend"
```

### 1.3 脚本引用更新

所有 `package.json` 中的脚本引用需要更新：
- `@pancakeswap/uikit` → `@simpleflow/uikit`
- `@pancakeswap/farms` → `@simpleflow/farms`
- `@pancakeswap/localization` → `@simpleflow/l10n` ⚠️
- 等等...

### 1.4 目录重命名

| 当前目录 | 新目录 |
|---------|--------|
| `packages/localization` | `packages/l10n` |
| `packages/eslint-config-pancake` | `packages/eslint-config` |

---

## 2. 🌐 域名与 API 端点

### 2.1 主要域名替换表

| 当前域名 | 新域名 | 用途 |
|---------|--------|------|
| `pancakeswap.com` | `simpleflow.finance` | 主站 |
| `pancakeswap.finance` | `simpleflow.finance` | 资产 CDN |
| `assets.pancakeswap.finance` | `assets.simpleflow.finance` | 静态资源 |
| `thegraph.pancakeswap.com` | `thegraph.simpleflow.finance` | Graph API 代理 |
| `profile.pancakeswap.com` | `profile.simpleflow.finance` | 用户资料 API |
| `nft.pancakeswap.com` | `nft.simpleflow.finance` | NFT API |
| `farms-api.pancakeswap.com` | `farms-api.simpleflow.finance` | 农场 API |
| `wallet-api.pancakeswap.com` | `wallet-api.simpleflow.finance` | 钱包 API |
| `onramp2-api.pancakeswap.com` | `onramp-api.simpleflow.finance` | 法币入金 |
| `notification-hub.pancakeswap.com` | `notification.simpleflow.finance` | 通知服务 |
| `red.alert.pancakeswap.com` | `alert.simpleflow.finance` | 风险检测 API |
| `tokens.pancakeswap.finance` | `tokens.simpleflow.finance` | Token 列表 |

### 2.2 关键配置文件

**主要端点配置**: `apps/web/src/config/constants/endpoints.ts`

```typescript
// 需要替换的常量
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

### 2.3 环境变量

需要更新的 `.env` 文件：
- `apps/web/.env.development`
- `apps/web/.env.production`
- `apps/aptos/.env`
- `apps/solana/.env`
- `apis/*/.dev.vars`

---

## 3. 📝 国际化文案

### 3.1 语言文件

| 文件 | 匹配数 | 路径 |
|------|--------|------|
| 英文 | 165 处 | `locales/en-US.json` |
| 简体中文 | 156 处 | `locales/zh-CN.json` |
| 繁体中文 | 156 处 | `locales/zh-TW.json` |

### 3.2 替换规则

| 原文 | 替换为 |
|------|--------|
| `PancakeSwap` | `SimpleFlow` |
| `Pancake` | `SimpleFlow` |
| `pancakeswap.com` | `simpleflow.finance` |
| `pancakeswap.finance` | `simpleflow.finance` |

### 3.3 扩展翻译

**文件**: `packages/localization/src/config/translation.extend.json` (26 处)

---

## 4. 📋 Token Lists 与配置

### 4.1 文件重命名

| 当前文件名 | 新文件名 |
|-----------|---------|
| `pancake-default.tokenlist.json` | `simpleflow-default.tokenlist.json` |
| `pancake-unsupported.tokenlist.json` | `simpleflow-unsupported.tokenlist.json` |
| `pancake-warning.tokenlist.json` | `simpleflow-warning.tokenlist.json` |
| `pancake-supported-onramp-currency-list.json` | `simpleflow-supported-onramp-currency-list.json` |

### 4.2 Token List 内容更新

**文件路径**:
- `apps/web/src/config/constants/tokenLists/`
- `apps/aptos/config/constants/tokenLists/`

需要更新的字段：
- `name`: "PancakeSwap Default" → "SimpleFlow Default"
- `logoURI`: 更新为新 Logo URL
- 所有 `pancakeswap.finance` 域名引用

### 4.3 Lists 配置

**文件**: `apps/web/src/config/constants/lists.ts` (38 处)

---

## 5. 🔧 智能合约 ABI 与引用

### 5.1 ABI 文件重命名

| 当前文件 | 新文件 | 路径 |
|---------|--------|------|
| `IPancakeRouter02.ts` | `ISimpleFlowRouter02.ts` | `apps/web/src/config/abi/` |
| `pancakeBunnies.ts` | `simpleflowBunnies.ts` | `apps/web/src/config/abi/` |
| `pancakeProfile.ts` | `simpleflowProfile.ts` | `apps/web/src/config/abi/` |
| `pancakeProfileProxy.ts` | `simpleflowProfileProxy.ts` | `apps/web/src/config/abi/` |
| `pancakeSquad.ts` | `simpleflowSquad.ts` | `apps/web/src/config/abi/` |
| `pancakeVeSenderV2ABI.ts` | `simpleflowVeSenderV2ABI.ts` | `apps/web/src/config/abi/` |
| `PancakeGiftV1Abi.ts` | `SimpleFlowGiftV1Abi.ts` | `apps/web/src/views/Gift/abis/` |

### 5.2 合约常量

**文件**: `packages/tokens/src/constants/common.ts` (32 处)

---

## 6. 📄 页面路由与组件

### 6.1 页面文件重命名

| 当前路径 | 新路径 |
|---------|--------|
| `apps/web/src/pages/pancake-squad.tsx` | `apps/web/src/pages/simpleflow-squad.tsx` |
| `apps/web/src/pages/profile/pancake-collectibles.tsx` | `apps/web/src/pages/profile/simpleflow-collectibles.tsx` |

### 6.2 组件重命名

| 当前组件 | 新组件 | 路径 |
|---------|--------|------|
| `PancakeBanner.tsx` | `SimpleFlowBanner.tsx` | `apps/web/src/views/HomeV2/` |
| `PancakeSwapXTag.tsx` | `SimpleFlowXTag.tsx` | `apps/web/src/components/` |
| `PancakeToggle/` | `SimpleFlowToggle/` | `packages/uikit/src/components/` |

### 6.3 Hooks 重命名

| 当前 Hook | 新 Hook | 路径 |
|----------|---------|------|
| `useUserPancakePicks.tsx` | `useUserSimpleFlowPicks.tsx` | `apps/web/src/state/user/hooks/` |

---

## 7. 🧪 测试文件

### 7.1 测试目录重命名

- `apps/web/src/__tests__/views/pancakeSquad/` → `simpleflowSquad/`

### 7.2 测试文件更新

- `packages/uikit/src/__tests__/components/pancaketoggle.test.tsx`
- `packages/uikit/src/__tests__/widgets/__snapshots__/menu.test.tsx.snap` (51 处)

---

## 8. 📚 文档与配置

### 8.1 README 文件

- `README.md` (根目录)
- `CLAUDE.md`
- 各包的 `README.md`

### 8.2 CI/CD 配置

| 文件 | 匹配数 |
|------|--------|
| `.github/workflows/updateCron.yml` | 3 处 |
| `.i18n-config` | 2 处 |
| `crowdin.yml` | 需更新项目名 |

### 8.3 CHANGELOG 文件

所有包的 `CHANGELOG.md` 包含历史版本记录中的品牌名。

**建议**: 保留历史记录，仅在新版本中使用新品牌名。

---

## 9. 🪙 代币体系重构 (CAKE → SDX)

### 9.1 代币映射关系

| 原代币 | 新代币 | 说明 |
|--------|--------|------|
| CAKE | **SDX** | 平台治理代币 |
| veCake | **veSDX** | 锁仓投票代币 |
| bCAKE | **bSDX** | Boost 代币 |
| (原生) | **SRW** | SimpleChain 原生代币 |
| WBNB | **WSRW** | Wrapped 原生代币 |

### 9.2 已有配置 (无需修改)

代码库中已存在 SimpleChain 和 SDX 的配置：

**文件**: `packages/tokens/src/constants/simplechain.ts`
```typescript
// SDX 代币 (只有 MasterChef 可以 mint)
sdx: new ERC20Token(
  ChainId.SIMPLECHAIN,
  '0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75',
  18,
  'SDX',
  'SimpleFlow Token',
  'https://simplechain.com/',
)

// Wrapped SRW
wsrw: new ERC20Token(
  ChainId.SIMPLECHAIN,
  '0x22608aC253B934D5078cB0d12f7F7e377b51798b',
  18,
  'WSRW',
  'Wrapped SRW',
  'https://simplechain.com/',
)
```

### 9.3 CAKE → SDX 替换范围

| 类别 | 匹配数 | 说明 |
|------|--------|------|
| CAKE 引用 | 13,704 处 | 变量名、常量、注释等 |
| veCake 引用 | 522 处 | 锁仓投票相关 |
| CakeStaking | 16 处 | 质押页面/组件 |
| useCake* hooks | 50+ 处 | 各种 hooks |

### 9.4 需要替换的核心文件

#### 9.4.1 代币常量

**文件**: `packages/tokens/src/constants/common.ts`

```typescript
// 当前 (需要更新 SimpleChain 的 CAKE 配置)
[ChainId.SIMPLECHAIN]: new ERC20Token(
  ChainId.SIMPLECHAIN,
  '0xF59D81cd43f620E722E07f9Cb3f6E41B031017a3',
  18,
  'CAKE',  // → 'SDX'
  'PancakeSwap Token',  // → 'SimpleFlow Token'
  'https://pancakeswap.finance/',  // → 'https://simpleflow.finance/'
)
```

#### 9.4.2 组件/页面重命名

| 当前 | 新名称 | 路径 |
|------|--------|------|
| `CakeStaking/` | `SdxStaking/` | `apps/web/src/views/` |
| `VeCakeRedeem.tsx` | `VeSdxRedeem.tsx` | `apps/web/src/views/CakeStaking/` |
| `useCakeBenefits.ts` | `useSdxBenefits.ts` | `apps/web/src/components/Menu/UserMenu/hooks/` |
| `useVeCakeUserInfo.ts` | `useVeSdxUserInfo.ts` | `apps/web/src/views/CakeStaking/hooks/` |
| `useInfinityCakeAPR.ts` | `useInfinitySdxAPR.ts` | `apps/web/src/hooks/infinity/` |
| `CrossChainVeCakeModal/` | `CrossChainVeSdxModal/` | `apps/web/src/components/` |
| `cake-staking/` | `sdx-staking/` | `apps/web/src/pages/` |

#### 9.4.3 ABI 文件

| 当前 | 新名称 |
|------|--------|
| `bCakeFarmBoosterVeCake.ts` | `bSdxFarmBoosterVeSdx.ts` |
| `bCakeFarmWrapperBoosterVeCake.ts` | `bSdxFarmWrapperBoosterVeSdx.ts` |
| `ICake.ts` | `ISdx.ts` |
| `pancakeVeSenderV2ABI.ts` | `simpleflowVeSenderV2ABI.ts` |

#### 9.4.4 国际化文案

需要在 `locales/*.json` 中替换：
- `CAKE` → `SDX`
- `veCake` / `veCAKE` → `veSDX`
- `bCAKE` → `bSDX`

### 9.5 原生代币处理

**SimpleChain 使用 SRW 作为原生代币**，需要：

1. **移除其他链的支持** (如果只部署在 SimpleChain)
   - 或保留多链支持，每条链使用各自原生代币

2. **更新 Gas 代币显示**
   - BSC 显示 BNB → SimpleChain 显示 SRW

3. **更新 Wrapped 代币**
   - WBNB → WSRW (已配置)

### 9.6 决策点

| 问题 | 选项 | 建议 |
|------|------|------|
| 是否移除其他链? | 是/否 | 根据业务需求决定 |
| CAKE 常量是否全局替换为 SDX? | 是/否 | **建议是**，保持代码一致性 |
| veCake 机制是否保留? | 是/否 | 根据 tokenomics 决定 |

---

## 10. 📊 执行优先级

| 优先级 | 类别 | 工作量 | 说明 |
|--------|------|--------|------|
| **P0** | 包名 `@pancakeswap/*` | 高 | 影响所有导入，需一次性完成 |
| **P0** | 域名/API 端点 | 中 | 需先部署新域名基础设施 |
| **P1** | Logo/品牌图片 | 中 | 需外包设计新资源 |
| **P1** | 国际化文案 | 中 | 批量替换 |
| **P2** | 文件/目录重命名 | 低 | 可逐步进行 |
| **P2** | CHANGELOG | 低 | 可保留历史记录 |
| **P3** | 测试快照 | 低 | 运行测试自动更新 |

---

## 11. 🛠️ 执行步骤

### Phase 1: 准备阶段
- [ ] 设计新 Logo 和品牌资源 (外包)
- [ ] 注册并配置 `simpleflow.finance` 子域名
- [ ] 部署 API 基础设施到新域名
- [ ] 决定 CAKE 代币处理策略

### Phase 2: 包名替换
- [ ] 批量替换所有 `@pancakeswap` → `@simpleflow`
- [ ] 更新所有 `package.json` 的 name 字段
- [ ] 更新所有导入语句
- [ ] 验证构建通过

### Phase 3: 域名替换
- [ ] 更新 `endpoints.ts` 中所有域名
- [ ] 更新环境变量文件
- [ ] 更新 Token List URL

### Phase 4: UI 资源替换
- [ ] 替换所有 Logo 文件
- [ ] 替换品牌图片
- [ ] 更新 SVG 组件

### Phase 5: 文案替换
- [ ] 更新所有语言文件
- [ ] 更新 README 和文档

### Phase 6: 验证
- [ ] 运行全量测试
- [ ] 更新测试快照
- [ ] 端到端测试
- [ ] 生产环境验证

---

## 12. 批量替换脚本参考

### 12.1 Import 语句替换 (最重要)

> ⚠️ **Import 语句是替换的核心**，涉及 **1241+ 个文件**

```bash
# 替换所有 import 语句中的包名 (*.ts, *.tsx, *.js, *.jsx)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/from '@pancakeswap\//from '@simpleflow\//g" {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/from "@pancakeswap\//from "@simpleflow\//g' {} +

# 替换 require 语句
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/require('@pancakeswap\//require('@simpleflow\//g" {} +
```

**示例影响**:
```typescript
// 替换前
import { useTranslation } from '@pancakeswap/localization'
import { Button } from '@pancakeswap/uikit'

// 替换后 (基础替换)
import { useTranslation } from '@simpleflow/localization'
import { Button } from '@simpleflow/uikit'

// 替换后 (特殊重命名)
import { useTranslation } from '@simpleflow/l10n'
import { Button } from '@simpleflow/uikit'
```

### 12.2 Package.json 替换

```bash
# 替换 package.json 中的包名和依赖
find . -type f -name "*.json" -not -path "./node_modules/*" -exec sed -i '' 's/@pancakeswap/@simpleflow/g' {} +
```

### 12.3 域名替换

```bash
# 替换域名
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) -not -path "./node_modules/*" -exec sed -i '' 's/pancakeswap\.com/simpleflow.finance/g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) -not -path "./node_modules/*" -exec sed -i '' 's/pancakeswap\.finance/simpleflow.finance/g' {} +

# 替换品牌名 (注意大小写)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) -not -path "./node_modules/*" -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +
```

### 12.4 特殊重命名 (需单独处理)

```bash
# 1. localization → l10n (目录和包名)
mv packages/localization packages/l10n

# 替换 import 语句
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" \
  -exec sed -i '' "s/from '@simpleflow\/localization'/from '@simpleflow\/l10n'/g" {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" \
  -exec sed -i '' 's/from "@simpleflow\/localization"/from "@simpleflow\/l10n"/g' {} +

# 替换 package.json 中的引用
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/@simpleflow\/localization/@simpleflow\/l10n/g' {} +
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/packages\/localization/packages\/l10n/g' {} +

# 2. eslint-config-pancake → eslint-config (目录和包名)
mv packages/eslint-config-pancake packages/eslint-config
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/@simpleflow\/eslint-config-pancake/@simpleflow\/eslint-config/g' {} +
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/eslint-config-pancake/eslint-config/g' {} +
```

### 12.5 Import 替换统计

| 包名 | Import 数量 | 说明 |
|------|------------|------|
| `@pancakeswap/localization` | **1,241** | → `@simpleflow/l10n` |
| `@pancakeswap/uikit` | ~800+ | → `@simpleflow/uikit` |
| `@pancakeswap/hooks` | ~500+ | → `@simpleflow/hooks` |
| `@pancakeswap/tokens` | ~300+ | → `@simpleflow/tokens` |
| 其他包 | ~1000+ | 按规则替换 |

### 12.6 执行顺序

1. **Step 1**: 执行 Import 替换 (12.1)
2. **Step 2**: 执行 Package.json 替换 (12.2)
3. **Step 3**: 执行域名替换 (12.3)
4. **Step 4**: 执行特殊重命名 (12.4)
5. **Step 5**: 重新安装依赖: `pnpm install`
6. **Step 6**: 验证构建: `pnpm build`

> ⚠️ **注意**: 执行批量替换前请确保已提交所有更改，以便回滚。

---

## 13. 🎯 低工作量高效果策略

> 以下策略可以用**最小的代码改动**实现**最大的品牌区分效果**

### 13.1 主题色替换 ⭐⭐⭐⭐⭐

**工作量**: 低 | **效果**: 全站视觉立即改变

```typescript
// packages/uikit/src/theme/colors.ts
// PancakeSwap 主色: #1FC7D4 (青色)
// 建议 SimpleFlow 新主色:
//   - #6366F1 (紫色) - 现代科技感
//   - #10B981 (绿色) - 金融稳健感
//   - #F59E0B (橙色) - 活力创新感
```

### 13.2 Git 历史清理 ⭐⭐⭐⭐⭐

**工作量**: 低 | **效果**: 完全脱离原项目历史

```bash
# 创建全新的 Git 历史
git checkout --orphan new-main
git add -A
git commit -m "Initial commit: SimpleFlow v1.0.0"
git branch -D main
git branch -m main
git push -f origin main
```

### 13.3 版本号重置 ⭐⭐⭐

**工作量**: 极低 | **效果**: 与 PancakeSwap 版本脱钩

```bash
# 批量将所有包版本重置为 1.0.0
find . -name "package.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/"version": "[^"]*"/"version": "1.0.0"/g' {} +
```

### 13.4 Meta 信息替换 ⭐⭐⭐

**工作量**: 低 | **文件**: `apps/web/src/config/constants/meta.ts`

```typescript
export const META = {
  title: 'SimpleFlow - DeFi on SimpleChain',
  description: 'Trade, earn, and own crypto on SimpleChain',
  keywords: 'simpleflow, dex, simplechain, sdx, srw, defi, rwa',
  ogImage: 'https://simpleflow.finance/og-image.png',
}
```

### 13.5 社交链接替换 ⭐⭐

**工作量**: 低 | **文件**: `apps/web/src/config/constants/socialLinks.ts`

```typescript
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/simpleflow_fi',
  telegram: 'https://t.me/simpleflow',
  discord: 'https://discord.gg/simpleflow',
  github: 'https://github.com/simpleflow-finance',
  medium: 'https://medium.com/@simpleflow',
}
```

### 13.6 字体替换 ⭐⭐⭐

**工作量**: 极低 | **效果**: 视觉风格差异化

```css
/* apps/web/src/styles/globals.css */
/* PancakeSwap 使用 Kanit 字体 */
/* 建议替换为: Inter, Poppins, DM Sans 等 */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 13.7 环境变量前缀 ⭐⭐

**工作量**: 中低 | **效果**: 配置完全独立

```bash
# .env 文件
# 将 NEXT_PUBLIC_PANCAKE_* 改为 NEXT_PUBLIC_SF_*
NEXT_PUBLIC_SF_CHAIN_ID=1913
NEXT_PUBLIC_SF_API_URL=https://api.simpleflow.finance
NEXT_PUBLIC_SF_GA_ID=G-XXXXXXXXXX
```

### 13.8 Analytics 替换 ⭐

**工作量**: 极低 | **效果**: 数据完全独立

```typescript
// Google Analytics, Mixpanel, Amplitude 等
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX        // 新的 GA ID
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxxxxx   // 新的 Mixpanel Token
```

### 13.9 策略优先级汇总

| 策略 | 工作量 | 视觉效果 | 代码区分度 | 优先级 |
|------|--------|---------|-----------|--------|
| 主题色替换 | 低 | ⭐⭐⭐⭐⭐ | ⭐ | **P0** |
| Git 历史清理 | 低 | - | ⭐⭐⭐⭐⭐ | **P0** |
| 版本号重置 | 极低 | - | ⭐⭐⭐ | **P0** |
| Meta 信息 | 低 | ⭐⭐⭐ | ⭐⭐ | **P1** |
| 社交链接 | 低 | ⭐⭐ | ⭐⭐ | **P1** |
| 字体替换 | 极低 | ⭐⭐⭐ | ⭐ | **P2** |
| 环境变量前缀 | 中低 | - | ⭐⭐⭐ | **P2** |
| Analytics | 极低 | - | ⭐⭐ | **P2** |

---

## 14. SimpleChain 特定配置

### 14.1 已有链配置

**文件**: `packages/chains/src/chainId.ts`
```typescript
SIMPLECHAIN = 1913,        // SimpleChain Mainnet
SIMPLECHAIN_TESTNET = 1914, // SimpleChain Testnet
```

### 14.2 已配置的代币

| 代币 | 地址 | 精度 |
|------|------|------|
| WSRW | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 |
| SDX | `0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75` | 18 |
| USDT | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 |
| USDC | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 |
| WBTC | `0xc48DC2507A162E2Ab63e12055CA5C79cf9b19BF2` | 8 |
| DAI | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 |
| WSOL | `0xbB0543b26A291648D67B91a8A0f150f6122FEd03` | 9 |

### 14.3 需要更新的配置

1. **默认链设置**: 将 SimpleChain 设为默认链
2. **RPC 节点**: 配置 SimpleChain RPC
3. **区块浏览器**: 配置 SimpleChain Explorer URL
4. **Subgraph**: 部署 SimpleChain 的 Subgraph

---

## 15. 完整替换清单汇总

### 15.1 品牌名替换

| 原文 | 替换为 | 匹配数 |
|------|--------|--------|
| `PancakeSwap` | `SimpleFlow` | 14,156 |
| `pancakeswap` | `simpleflow` | 15,235 |
| `@pancakeswap/` | `@simpleflow/` | 353 |
| `pancakeswap.com` | `simpleflow.finance` | 621 |
| `pancakeswap.finance` | `simpleflow.finance` | 621 |

### 15.2 代币名替换

| 原文 | 替换为 | 匹配数 |
|------|--------|--------|
| `CAKE` | `SDX` | 13,704 |
| `veCake` / `veCAKE` | `veSDX` | 522 |
| `bCAKE` | `bSDX` | ~50 |
| `CakeStaking` | `SdxStaking` | 16 |

### 15.3 链相关 (可选，如果移除其他链)

| 原文 | 替换为 |
|------|--------|
| `BNB` | `SRW` |
| `WBNB` | `WSRW` |
| `BSC` | `SimpleChain` |

---

## 16. ⚠️ 容易遗漏的替换点

> 以下是经过代码扫描发现的容易被忽略的品牌相关内容

### 16.1 🐰 吉祥物引用 (Bunny/Rabbit)

PancakeSwap 吉祥物是兔子，代码中有 **413 处**引用：

| 类型 | 文件数 | 说明 |
|------|--------|------|
| `PancakeBunny` 组件 | 10+ | NFT 页面组件 |
| `bunnyFactory.ts` | 1 | ABI 文件 |
| `PancakeSquad` | 15+ | NFT 系列 |
| `bunny*.png` | 11 | 图片资源 |

**决策**: 
- 选项 A: 设计新的 SimpleFlow 吉祥物
- 选项 B: 完全移除吉祥物相关功能
- 选项 C: 保留但重命名 (如 `SimpleSquad`)

### 16.2 📜 LICENSE 文件

需要更新版权所有者信息：

```
/LICENSE                           # 根目录
/packages/solana-core-sdk/LICENSE
/apps/solana/LICENSE
/packages/swap-sdk-core/LICENSE
/packages/swap-sdk/LICENSE
```

### 16.3 📊 Charting Library (第三方库)

```
apps/web/src/components/Chart/lib/pancakeswap-charting-library.d.ts
apps/web/src/components/Chart/lib/pancakeswap-charting-library.es.js
```

**注意**: 这是打包的第三方库，可能需要重新构建或替换

### 16.4 🎮 Trading Competition 活动

| 文件 | 说明 |
|------|------|
| `tradingCompetitionEaster.ts` | 复活节活动 |
| `tradingCompetitionMobox.ts` | Mobox 联名 |
| `tradingCompetitionMoD.ts` | MoD 活动 |
| `tradingCompetitionFanToken.ts` | Fan Token 活动 |

**建议**: 评估是否保留这些历史活动功能，或直接移除

### 16.5 📝 CHANGELOG 历史记录

所有包的 `CHANGELOG.md` 都包含 PancakeSwap 历史版本记录：

```
packages/uikit/CHANGELOG.md           # 176 处
packages/universal-router-sdk/CHANGELOG.md
packages/pcsx-sdk/CHANGELOG.md
... (共 20+ 个文件)
```

**建议**: 
- 选项 A: 保留历史记录（诚实透明）
- 选项 B: 清空重新开始（干净整洁）

### 16.6 🤖 AI 配置文件 (CLAUDE.md)

```
/CLAUDE.md
/apps/web/src/views/CLAUDE.md
/packages/v3-sdk/CLAUDE.md
/packages/solana-core-sdk/CLAUDE.md
```

这些是 AI 助手的上下文文件，包含项目说明，需要更新

### 16.7 🌐 外部服务集成

| 服务 | 需要更新 |
|------|---------|
| **Crowdin** | `crowdin.yml` 项目 ID |
| **TheGraph** | Subgraph 部署名称 |
| **Sentry** | 项目名称和 DSN |
| **Vercel/Netlify** | 项目配置 |
| **Cloudflare Workers** | API 路由名称 |
| **WalletConnect** | projectId 和项目名称 |

### 16.8 📱 PWA Manifest

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

### 16.9 🏷️ HTML Meta Tags

**文件**: `apps/web/src/pages/_document.tsx` 或类似文件

```html
<meta property="og:site_name" content="SimpleFlow">
<meta name="twitter:site" content="@simpleflow_fi">
<meta name="application-name" content="SimpleFlow">
```

### 16.10 📧 联系方式

检查代码中硬编码的联系信息：
- 支持邮箱
- Discord 链接
- Telegram 群组
- Bug 报告地址

### 16.11 🎨 CSS 类名前缀

可能存在 `.pancake-*` 前缀的 CSS 类名，需要搜索替换

```bash
grep -r "pancake-" --include="*.css" --include="*.scss" --include="*.tsx"
```

### 16.12 📦 NPM Registry 配置

如果计划发布到 npm：
- 配置新的 `@simpleflow` scope
- 更新 `.npmrc` 文件
- 更新 `publishConfig` 配置

### 16.13 遗漏点检查清单

| 项目 | 状态 | 优先级 |
|------|------|--------|
| [ ] 吉祥物引用 (bunny/rabbit) | 待处理 | P2 |
| [ ] LICENSE 文件 | 待处理 | P1 |
| [ ] Charting Library | 待处理 | P2 |
| [ ] Trading Competition | 待处理 | P3 |
| [ ] CHANGELOG 文件 | 待处理 | P3 |
| [ ] CLAUDE.md 文件 | 待处理 | P2 |
| [ ] 外部服务配置 | 待处理 | P1 |
| [ ] PWA Manifest | 待处理 | P1 |
| [ ] HTML Meta Tags | 待处理 | P1 |
| [ ] 联系方式 | 待处理 | P1 |
| [ ] CSS 类名 | 待处理 | P2 |
| [ ] NPM 配置 | 待处理 | P2 |

---

## 17. 🔍 更多遗漏点 (深度扫描)

> 以下是通过深度代码扫描发现的更多需要处理的内容

### 17.1 🍯 Syrup Pool 品牌术语

PancakeSwap 特有术语 "Syrup Pool"，代码中有 **69 处**引用：

| 文件 | 匹配数 |
|------|--------|
| `locales/zh-TW.json` | 16 |
| `locales/en-US.json` | 13 |
| `locales/zh-CN.json` | 13 |
| `apps/web/src/views/Pools/` | 10+ |

**建议**: 重命名为 "Staking Pool" 或 "Earn Pool"

### 17.2 🎰 Lottery 功能 ✅ 已移除

~~代码中有 **33 处** Lottery 相关引用~~

**状态**: ✅ 已移除

原涉及文件 (已清理):
```
apps/web/src/utils/customGTMEventTracking.ts
apps/web/src/config/constants/types.ts
apps/web/src/views/Notifications/
apps/web/src/config/constants/contracts.ts
```

### 17.3 🎯 Prediction 功能 ⚠️ 部分移除

**views 目录已移除**，但代码中仍有 **113 处**引用残留：

| 文件 | 匹配数 | 说明 |
|------|--------|------|
| `state/user/hooks/index.tsx` | 23 | 用户状态 hooks |
| `state/user/reducer.ts` | 15 | Redux reducer |
| `components/AdPanel/FAQ/config/prediction.tsx` | 14 | FAQ 配置 |
| `components/AdPanel/Ads/AIPredictionStripe.tsx` | 12 | 广告组件 |
| `config/constants/contracts.ts` | 3 | 合约地址 |
| 其他文件 | 46 | 各种引用 |

**状态**: ⚠️ 主页面已移除，残留代码需清理

### 17.4 🏺 Pottery 功能 ✅ 基本移除

**views 目录已移除**，代码中仅有 **2 处**引用残留：

| 文件 | 说明 |
|------|------|
| `config/constants/contracts.ts` | 合约地址 |
| `views/AffiliatesProgram/components/OnBoardingModal/StepIntro.tsx` | 引用 |

**状态**: ✅ 基本完成，残留很少

### 17.5 🚀 Cakepad (IFO 平台)

"Cakepad" 是 PancakeSwap 的 IFO 平台名称，有 **68 处**引用：

| 路径 | 说明 |
|------|------|
| `apps/web/src/views/Cakepad/` | 整个目录 |
| `apps/web/src/pages/cakepad/` | 页面路由 |
| `apps/web/src/config/cakepad.config.ts` | 配置文件 |

**建议**: 重命名为 "SimpleFlow Launchpad" 或 "SDX Pad"

### 17.6 📚 docs.pancakeswap.finance 文档链接

代码中有 **126 处**指向 PancakeSwap 文档的链接：

```typescript
// 示例
'https://docs.pancakeswap.finance/...'
```

**需要**: 
- 部署新的文档站点 `docs.simpleflow.finance`
- 批量替换所有文档链接

### 17.7 🔗 GitHub 仓库链接

代码中有 **322 处** `github.com/pancakeswap` 引用：

| 类型 | 说明 |
|------|------|
| `package.json` repository | 包仓库地址 |
| `CHANGELOG.md` | 提交链接 |
| 代码注释 | 参考链接 |

### 17.8 📱 社交媒体链接

| 平台 | 当前链接 | 新链接 |
|------|---------|--------|
| Telegram | `t.me/pancakeswap` | `t.me/simpleflow` |
| Discord | `discord.gg/pancakeswap` | `discord.gg/simpleflow` |
| Medium | `medium.com/pancakeswap` | `medium.com/@simpleflow` |

**文件**: `packages/uikit/src/components/Footer/config.tsx`

### 17.9 🧪 测试快照文件

有 **5 个**测试快照文件可能包含品牌相关内容：

```
packages/uikit/src/__tests__/widgets/__snapshots__/menu.test.tsx.snap
packages/universal-router-sdk/test/__snapshots__/*.snap
```

**处理**: 运行测试后自动更新快照

### 17.10 💰 CAKE 合约地址硬编码

BSC 上的 CAKE 合约地址 `0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82` 在 **58 处**被引用：

| 类型 | 说明 |
|------|------|
| 测试文件 | 单元测试 |
| 配置文件 | Token 列表 |
| E2E 测试 | Cypress 测试 |

**注意**: 如果只部署在 SimpleChain，这些 BSC 地址可以移除

### 17.11 🌍 环境变量文件

需要更新的 `.env` 文件：

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

### 17.12 🎯 GTM 事件追踪

`apps/web/src/utils/customGTMEventTracking.ts` 包含大量事件名称，可能包含品牌相关内容

### 17.13 更多遗漏点检查清单

| 项目 | 匹配数 | 优先级 |
|------|--------|--------|
| [ ] Syrup Pool 术语 | 69 | P2 |
| [x] Lottery 功能 | ~~33~~ | ✅ 已移除 |
| [⚠️] Prediction 功能 | 113 | ⚠️ 部分移除，需清理残留 |
| [x] Pottery 功能 | ~~2~~ | ✅ 基本移除 |
| [ ] Cakepad 重命名 | 68 | P2 |
| [ ] 文档链接 | 126 | P1 |
| [ ] GitHub 链接 | 322 | P2 |
| [ ] 社交媒体链接 | 14 | P1 |
| [ ] 测试快照 | 5 | P3 |
| [ ] CAKE 合约地址 | 58 | P2 |
| [ ] 环境变量文件 | 9 | P1 |
| [ ] GTM 事件追踪 | 40 | P2 |

---

## 18. 📋 完整检查清单总览

### 18.1 P0 - 必须完成 (上线阻塞)

- [ ] 包名 `@pancakeswap/*` → `@simpleflow/*`
- [ ] 域名替换 `pancakeswap.com` → `simpleflow.finance`
- [ ] Logo 和 Favicon
- [ ] 主题色替换
- [ ] Git 历史清理

### 18.2 P1 - 重要 (上线后尽快)

- [ ] 国际化文案
- [ ] 文档链接 `docs.pancakeswap.finance`
- [ ] 社交媒体链接
- [ ] 环境变量文件
- [ ] PWA Manifest
- [ ] HTML Meta Tags
- [ ] LICENSE 文件
- [ ] 外部服务配置

### 18.3 P2 - 一般 (可分批)

- [ ] CAKE → SDX 代币替换
- [ ] Syrup Pool 术语
- [ ] Cakepad 重命名
- [ ] 吉祥物引用 (bunny)
- [ ] GitHub 链接
- [ ] CSS 类名
- [ ] CLAUDE.md 文件
- [ ] GTM 事件追踪

### 18.4 P3 - 可选 (根据需求)

- [x] Lottery 功能 ✅ 已移除
- [⚠️] Prediction 功能 ⚠️ 部分移除，残留 113 处需清理
- [x] Pottery 功能 ✅ 基本移除
- [ ] Trading Competition
- [ ] CHANGELOG 历史
- [ ] 测试快照
- [ ] NFT 系列

---

## 19. 🚀 执行行动指南 (推荐顺序)

> **重要**: 按以下顺序执行，每完成一步建议提交 Git

### Phase 0: 准备工作 (外包并行)

| 步骤 | 任务 | 负责方 | 预计时间 |
|------|------|--------|---------|
| 0.1 | 设计新 Logo 和品牌资源 | 外包设计 | 2-3 周 |
| 0.2 | 注册 `simpleflow.finance` 子域名 | 运维 | 1 天 |
| 0.3 | 部署 API 基础设施到新域名 | 运维 | 1 周 |
| 0.4 | 创建新的社交媒体账号 | 运营 | 1 天 |

### Phase 1: Git 历史清理 ⭐ 第一步

```bash
# 1. 确保所有更改已提交
git add -A && git commit -m "Pre-rebranding checkpoint"

# 2. 创建全新历史
git checkout --orphan simpleflow-main
git add -A
git commit -m "Initial commit: SimpleFlow v1.0.0"

# 3. 替换主分支
git branch -D main
git branch -m main
```

### Phase 2: 主题色替换 ⭐ 视觉效果最大

**文件**: `packages/uikit/src/theme/colors.ts`

```typescript
// PancakeSwap: #1FC7D4 (青色)
// 建议 SimpleFlow: #6366F1 (紫色) 或 #10B981 (绿色)
```

### Phase 3: 包名批量替换

```bash
# Step 1: 替换 import 语句
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/from '@pancakeswap\//from '@simpleflow\//g" {} +

# Step 2: 替换 package.json
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/@pancakeswap/@simpleflow/g' {} +

# Step 3: 特殊重命名 (localization → l10n)
mv packages/localization packages/l10n
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/@simpleflow\/localization/@simpleflow\/l10n/g' {} +

# Step 4: 重新安装依赖
pnpm install
```

### Phase 4: 域名替换

```bash
# 替换所有域名
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancakeswap\.com/simpleflow.finance/g' {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancakeswap\.finance/simpleflow.finance/g' {} +
```

### Phase 5: 品牌名文案替换

```bash
# 替换品牌名
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +
```

### Phase 6: Logo 和资源替换

等待设计完成后：
1. 替换 `apps/web/public/logo.png`
2. 替换 `apps/web/public/favicon.ico`
3. 更新 `packages/uikit/src/components/Svg/Icons/Logo.tsx`
4. 替换加载动画 GIF

### Phase 7: 代币替换 (CAKE → SDX)

```bash
# 替换代币名称
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/CAKE/SDX/g' {} +

# 注意: 需要手动检查，避免误替换
```

### Phase 8: 清理残留代码

1. **Prediction 残留** (113 处)
   - 清理 `state/user/` 中的 Prediction hooks
   - 删除 `components/AdPanel/FAQ/config/prediction.tsx`
   - 删除 `components/AdPanel/Ads/AIPredictionStripe.tsx`

2. **其他残留**
   - Pottery 合约地址
   - Trading Competition (如不需要)

### Phase 9: 验证和测试

```bash
# 1. 构建验证
pnpm build

# 2. 运行测试
pnpm test

# 3. 更新测试快照
pnpm test -- -u

# 4. 本地预览
pnpm dev
```

---

## 20. ⏱️ 时间估算

| Phase | 任务 | 预计时间 | 依赖 |
|-------|------|---------|------|
| 0 | 准备工作 | 2-3 周 | 无 (可并行) |
| 1 | Git 历史清理 | 10 分钟 | 无 |
| 2 | 主题色替换 | 30 分钟 | 无 |
| 3 | 包名替换 | 2 小时 | Phase 1 |
| 4 | 域名替换 | 1 小时 | Phase 3 |
| 5 | 品牌名替换 | 1 小时 | Phase 4 |
| 6 | Logo 替换 | 1 小时 | Phase 0 完成 |
| 7 | 代币替换 | 4 小时 | Phase 5 |
| 8 | 清理残留 | 2 小时 | Phase 7 |
| 9 | 验证测试 | 2 小时 | Phase 8 |

**总计**: 约 **1-2 天**代码工作 + **2-3 周**设计外包

---

## 21. ✅ 已完成项目

| 项目 | 状态 | 备注 |
|------|------|------|
| Lottery 功能 | ✅ 已移除 | 完全清理 |
| Pottery 功能 | ✅ 基本移除 | 残留 2 处 |
| Prediction 功能 | ⚠️ 部分移除 | 残留 113 处待清理 |
| SimpleChain 配置 | ✅ 已存在 | ChainId 1913/1914 |
| SDX 代币定义 | ✅ 已存在 | `packages/tokens/src/constants/simplechain.ts` |
| WSRW 代币定义 | ✅ 已存在 | 同上 |

---

*文档创建时间: 2024-12-25*
*最后更新: 2024-12-25*
