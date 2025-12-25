# Phase 6: 包名替换

> **状态**: 待开始  
> **预计时间**: 2 小时  
> **依赖**: Phase 4-5 完成

---

## 目的

将所有 `@pancakeswap/*` 包名替换为 `@simpleflow/*`。

---

## 影响范围

| 类型 | 数量 |
|------|------|
| Import 语句 | 3,800+ |
| package.json 文件 | 58+ |
| 涉及包 | 32 |

---

## Step 6.1: 替换 Import 语句

```bash
# 替换单引号 import
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/from '@pancakeswap\//from '@simpleflow\//g" {} +

# 替换双引号 import
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/from "@pancakeswap\//from "@simpleflow\//g' {} +

# 替换 require 语句
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/require('@pancakeswap\//require('@simpleflow\//g" {} +
```

## Step 6.2: 替换 package.json

```bash
# 替换所有 package.json 中的包名
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/@pancakeswap/@simpleflow/g' {} +
```

## Step 6.3: 特殊重命名

### localization → l10n

```bash
# 1. 重命名目录
mv packages/localization packages/l10n

# 2. 替换 import 语句
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" \
  -exec sed -i '' "s/from '@simpleflow\/localization'/from '@simpleflow\/l10n'/g" {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" \
  -exec sed -i '' 's/from "@simpleflow\/localization"/from "@simpleflow\/l10n"/g' {} +

# 3. 替换 package.json 引用
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/@simpleflow\/localization/@simpleflow\/l10n/g' {} +

find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/packages\/localization/packages\/l10n/g' {} +
```

### eslint-config-pancake → eslint-config

```bash
# 1. 重命名目录
mv packages/eslint-config-pancake packages/eslint-config

# 2. 替换引用
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/@simpleflow\/eslint-config-pancake/@simpleflow\/eslint-config/g' {} +

find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/eslint-config-pancake/eslint-config/g' {} +
```

## Step 6.4: 更新根 package.json

```bash
# 修改项目名称
sed -i '' 's/"name": "pancake-frontend"/"name": "simpleflow-frontend"/g' package.json
```

## Step 6.5: 重新安装依赖

```bash
# 清理并重新安装
rm -rf node_modules
pnpm install
```

---

## 包名映射表

| 当前包名 | 新包名 |
|---------|--------|
| `@pancakeswap/uikit` | `@simpleflow/uikit` |
| `@pancakeswap/farms` | `@simpleflow/farms` |
| `@pancakeswap/tokens` | `@simpleflow/tokens` |
| `@pancakeswap/chains` | `@simpleflow/chains` |
| `@pancakeswap/hooks` | `@simpleflow/hooks` |
| `@pancakeswap/localization` | **`@simpleflow/l10n`** ⚠️ |
| `@pancakeswap/multicall` | `@simpleflow/multicall` |
| `@pancakeswap/pools` | `@simpleflow/pools` |
| `@pancakeswap/smart-router` | `@simpleflow/smart-router` |
| `@pancakeswap/swap-sdk` | `@simpleflow/swap-sdk` |
| `@pancakeswap/eslint-config-pancake` | **`@simpleflow/eslint-config`** ⚠️ |

---

## 检查清单

- [ ] 执行 Import 语句替换
- [ ] 执行 package.json 替换
- [ ] 执行 localization → l10n 重命名
- [ ] 执行 eslint-config 重命名
- [ ] 更新根 package.json 名称
- [ ] 重新安装依赖
- [ ] 验证 `pnpm install` 成功
- [ ] 提交更改

---

## 完成标准

Phase 6 完成的标志：

- [ ] 所有 `@pancakeswap/*` 已替换为 `@simpleflow/*`
- [ ] 特殊包名已重命名
- [ ] `pnpm install` 成功
- [ ] 所有更改已提交

---

*上一步: [Phase 4-5: 域名/品牌名替换](./phase-4-5-domain-brand.md)*  
*下一步: [Phase 7: Logo 和资源替换](./phase-7-assets.md)*
