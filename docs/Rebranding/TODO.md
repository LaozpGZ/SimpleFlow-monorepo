# SimpleFlow 品牌替换 TODO

> **最后更新**: 2024-12-25  
> **状态**: 进行中

---

## ✅ 已完成

| 任务 | 完成时间 | 备注 |
|------|---------|------|
| [x] Lottery 功能移除 | 已完成 | 完全清理 |
| [x] Pottery 功能移除 | 已完成 | 基本清理 |
| [x] Prediction 功能移除 | 已完成 | 残留已清理 |
| [x] SimpleChain 配置 | 已完成 | ChainId 1913/1914 |
| [x] SDX 代币定义 | 已完成 | `packages/tokens/` |
| [x] WSRW 代币定义 | 已完成 | `packages/tokens/` |
| [x] 品牌替换规划文档 | 已完成 | `rebranding-overview.md` |
| [x] 设计资源规范文档 | 已完成 | `brand-assets-spec.md` |

---

## 🚀 执行顺序

### Phase 0: 准备工作 (可并行)

- [ ] **0.1** 发送设计需求给外包团队
- [x] **0.2** 注册 `simpleflow.finance` 域名 ✅ 2024-12-25
- [ ] **0.3** 部署 API 基础设施
- [ ] **0.4** 创建社交媒体账号

### Phase 1: Git 历史清理 ⏱️ 10分钟

```bash
git checkout --orphan simpleflow-main
git add -A
git commit -m "Initial commit: SimpleFlow v1.0.0"
git branch -D main
git branch -m main
```

- [ ] 执行 Git 历史清理
- [ ] 推送到远程仓库

### Phase 2: 主题色替换 ⏱️ 30分钟

**文件**: `packages/uikit/src/theme/colors.ts`

- [ ] 确定主色调 (建议: `#6366F1` 紫色)
- [ ] 修改 `colors.ts`
- [ ] 本地预览验证

### Phase 3: 代币替换 (CAKE → SDX) ⏱️ 4小时

```bash
# 替换代币符号
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/'CAKE'/'SDX'/g" {} +

# 替换 veCake → veSDX
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/veCake/veSDX/g' {} +
```

- [ ] 替换代币符号 'CAKE' → 'SDX'
- [ ] 替换 veCake → veSDX
- [ ] 替换 bCAKE → bSDX
- [ ] 重命名 CakeStaking → SdxStaking
- [ ] 更新国际化文案中的 CAKE
- [ ] 手动检查误替换

### Phase 4: 域名替换 ⏱️ 1小时

```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancakeswap\.finance/simpleflow.finance/g' {} +
```

- [ ] 替换 `pancakeswap.com` → `simpleflow.finance`
- [ ] 替换 `pancakeswap.finance` → `simpleflow.finance`
- [ ] 更新 `endpoints.ts`

### Phase 5: 品牌名替换 ⏱️ 1小时

```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/PancakeSwap/SimpleFlow/g' {} +
```

- [ ] 替换 PancakeSwap → SimpleFlow
- [ ] 更新国际化文案
- [ ] 更新 Meta 信息
- [ ] 更新 PWA Manifest

### Phase 6: 包名替换 ⏱️ 2小时

```bash
# 替换 import 语句
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' "s/from '@pancakeswap\//from '@simpleflow\//g" {} +

# 替换 package.json
find . -type f -name "*.json" -not -path "./node_modules/*" \
  -exec sed -i '' 's/@pancakeswap/@simpleflow/g' {} +
```

- [ ] 替换 Import 语句
- [ ] 替换 package.json
- [ ] 特殊重命名: localization → l10n
- [ ] 特殊重命名: eslint-config-pancake → eslint-config
- [ ] `pnpm install` 验证

### Phase 7: Logo 和资源替换 ⏱️ 1小时

等待设计完成后：

- [ ] 替换 `logo.png`
- [ ] 替换 `favicon.ico`
- [ ] 更新 `Logo.tsx` SVG 组件
- [ ] 替换加载动画 GIF
- [ ] 添加 SDX 代币图标
- [ ] 替换 OG Image

### Phase 8: 其他清理 ⏱️ 1小时

- [ ] 替换 "Syrup Pool" → "Staking Pool"
- [ ] 重命名 Cakepad → Launchpad (可选)
- [ ] 清理 GitHub 链接
- [ ] 更新 LICENSE 文件
- [ ] 更新 CLAUDE.md 文件

### Phase 9: 验证和测试 ⏱️ 2小时

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

- [ ] `pnpm install` 成功
- [ ] `pnpm build` 成功
- [ ] 测试通过
- [ ] 本地预览正常
- [ ] 搜索残留确认

---

## ⏱️ 时间估算

| Phase | 任务 | 时间 |
|-------|------|------|
| 0 | 准备工作 | 2-3 周 (并行) |
| 1 | Git 历史清理 | 10 分钟 |
| 2 | 主题色替换 | 30 分钟 |
| 3 | **代币替换 (CAKE→SDX)** | 4 小时 |
| 4 | 域名替换 | 1 小时 |
| 5 | 品牌名替换 | 1 小时 |
| 6 | 包名替换 | 2 小时 |
| 7 | Logo 资源替换 | 1 小时 |
| 8 | 其他清理 | 1 小时 |
| 9 | 验证测试 | 2 小时 |

**代码工作总计**: 约 **13.5 小时** (1-2 天)

---

## 📁 相关文档

- [品牌替换总览](./rebranding-overview.md)
- [设计资源规范](./brand-assets-spec.md)
- [分阶段执行指南](./phases/README.md)

---

## 📝 备注

- Phase 0 可与代码工作并行进行
- 每完成一个 Phase 建议提交 Git
- 代币替换需要手动检查，避免误替换
- Logo 替换依赖设计完成

---

*下次更新时请更新此文件的完成状态*
