# Phase 3: 代币替换 (CAKE → SDX)

> **状态**: 待开始  
> **预计时间**: 4 小时  
> **依赖**: Phase 1-2 完成

---

## 目的

将所有 CAKE 代币引用替换为 SDX，并更新相关配置。

---

## 影响范围

| 类型 | 匹配数 |
|------|--------|
| `CAKE` | 13,704 |
| `veCake` / `veCAKE` | 522 |
| `bCAKE` | ~50 |
| `CakeStaking` | 16 |

## ⚠️ 注意事项

代币替换需要**谨慎操作**，因为：
1. 部分 `CAKE` 可能是其他链上的合法引用
2. 合约地址不能简单替换
3. 需要区分代币符号和变量名

---

## Step 3.1: 代币符号替换

```bash
# 替换代币符号 (需要手动检查)
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/'CAKE'/'SDX'/g" {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/"CAKE"/"SDX"/g' {} +
```

## Step 3.2: 代币名称替换

```bash
# 替换代币名称
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/PancakeSwap Token/SimpleFlow Token/g' {} +
```

## Step 3.3: 更新代币定义

**文件**: `packages/tokens/src/constants/common.ts`

```typescript
// 将 CAKE 定义更新为 SDX
export const SDX = {
  [ChainId.SIMPLECHAIN]: new ERC20Token(
    ChainId.SIMPLECHAIN,
    '0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75',
    18,
    'SDX',
    'SimpleFlow Token',
    'https://simpleflow.finance/',
  ),
}
```

## Step 3.4: 更新 veToken 引用

```bash
# 替换 veCake → veSDX
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/veCake/veSDX/g' {} +

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/veCAKE/veSDX/g' {} +

# 替换 bCAKE → bSDX
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/bCAKE/bSDX/g' {} +
```

## Step 3.5: 更新组件和目录名

| 当前名称 | 新名称 |
|---------|--------|
| `CakeStaking/` | `SdxStaking/` |
| `CakePrice.tsx` | `SdxPrice.tsx` |
| `useCakePrice.ts` | `useSdxPrice.ts` |

```bash
# 重命名目录
mv apps/web/src/views/CakeStaking apps/web/src/views/SdxStaking

# 更新引用
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/CakeStaking/SdxStaking/g' {} +
```

## Step 3.6: 更新国际化文案

**文件**: `locales/*.json`

```bash
# 替换语言文件中的 CAKE
find ./locales -name "*.json" \
  -exec sed -i '' 's/CAKE/SDX/g' {} +
```

## 代币映射表

| 当前 | 新 | 说明 |
|------|-----|------|
| `CAKE` | `SDX` | 平台代币 |
| `veCake` | `veSDX` | 锁仓代币 |
| `bCAKE` | `bSDX` | 绑定代币 |
| `WBNB` | `WSRW` | 包装原生代币 |
| `BNB` | `SRW` | 原生代币 |

## 检查清单

- [ ] 替换代币符号 'CAKE' → 'SDX'
- [ ] 替换代币名称
- [ ] 更新 `packages/tokens/` 代币定义
- [ ] 更新 veToken 引用
- [ ] 重命名 CakeStaking 目录
- [ ] 更新国际化文案
- [ ] 手动检查误替换
- [ ] 提交更改

---

## 完成标准

Phase 3 完成的标志：

- [ ] 所有 CAKE 引用已替换为 SDX
- [ ] veToken 引用已更新
- [ ] 组件目录已重命名
- [ ] 国际化文案已更新
- [ ] 所有更改已提交

---

*上一步: [Phase 1-2: Git 清理和主题色](./phase-1-2-git-theme.md)*  
*下一步: [Phase 4-5: 域名/品牌名替换](./phase-4-5-domain-brand.md)*
