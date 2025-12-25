# Phase 9: 验证和测试

> **状态**: 待开始  
> **预计时间**: 2 小时  
> **依赖**: Phase 8 完成

---

## 目的

验证所有品牌替换工作正确完成，确保应用可以正常构建和运行。

---

## 9.1 构建验证

### Step 1: 清理缓存

```bash
# 清理所有缓存
rm -rf node_modules
rm -rf .next
rm -rf apps/web/.next
pnpm store prune
```

### Step 2: 重新安装依赖

```bash
pnpm install
```

### Step 3: 构建所有包

```bash
# 构建所有包
pnpm build

# 如果失败，尝试单独构建
pnpm --filter @simpleflow/uikit build
pnpm --filter @simpleflow/tokens build
pnpm --filter @simpleflow/l10n build
```

### 检查清单

- [ ] `pnpm install` 成功
- [ ] `pnpm build` 成功
- [ ] 无 TypeScript 错误
- [ ] 无构建警告 (或已知可忽略)

---

## 9.2 运行测试

### Step 1: 单元测试

```bash
# 运行所有测试
pnpm test

# 如果有快照测试失败，更新快照
pnpm test -- -u
```

### Step 2: 类型检查

```bash
# TypeScript 类型检查
pnpm typecheck
```

### Step 3: Lint 检查

```bash
# ESLint 检查
pnpm lint
```

### 检查清单

- [ ] 单元测试通过
- [ ] 测试快照已更新
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过

---

## 9.3 本地预览

### Step 1: 启动开发服务器

```bash
# 启动 web 应用
pnpm dev

# 或指定端口
pnpm dev --port 3000
```

### Step 2: 视觉检查清单

打开浏览器访问 `http://localhost:3000`，检查以下内容：

#### 首页
- [ ] Logo 显示正确
- [ ] 主题色正确
- [ ] 品牌名显示 "SimpleFlow"
- [ ] 加载动画正确

#### 导航
- [ ] 导航栏 Logo 正确
- [ ] 菜单项正常
- [ ] 移动端 Logo 正确

#### 页脚
- [ ] 社交链接正确
- [ ] 版权信息正确

#### Swap 页面
- [ ] 功能正常
- [ ] 代币列表正确
- [ ] SDX 代币显示正确

#### Farms 页面
- [ ] 农场列表正常
- [ ] SDX 奖励显示正确

#### Pools 页面
- [ ] 矿池列表正常
- [ ] "Staking Pool" 术语正确 (非 "Syrup Pool")

### 检查清单

- [ ] 首页显示正常
- [ ] 导航正常
- [ ] Swap 功能正常
- [ ] Farms 页面正常
- [ ] Pools 页面正常
- [ ] 无控制台错误

---

## 9.4 搜索残留

### 搜索 PancakeSwap 残留

```bash
# 搜索代码中的 PancakeSwap 残留
grep -r "PancakeSwap" --include="*.ts" --include="*.tsx" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.next

# 搜索 pancakeswap 域名残留
grep -r "pancakeswap\.com\|pancakeswap\.finance" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next
```

### 搜索 CAKE 残留

```bash
# 搜索 CAKE 代币残留 (排除注释和 CHANGELOG)
grep -r "'CAKE'\|\"CAKE\"" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next
```

### 搜索包名残留

```bash
# 搜索 @pancakeswap 包名残留
grep -r "@pancakeswap" --include="*.ts" --include="*.tsx" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.next
```

### 检查清单

- [ ] 无 "PancakeSwap" 残留 (或已知可忽略)
- [ ] 无 "pancakeswap.com" 域名残留
- [ ] 无 "@pancakeswap" 包名残留
- [ ] 无意外的 "CAKE" 残留

---

## 9.5 E2E 测试 (可选)

如果有 Cypress E2E 测试：

```bash
# 运行 E2E 测试
cd apps/e2e
pnpm cypress:run
```

### 检查清单

- [ ] E2E 测试通过 (如有)

---

## 9.6 生成最终报告

### 品牌替换统计

运行以下命令生成统计：

```bash
# 统计 SimpleFlow 出现次数
echo "SimpleFlow 出现次数:"
grep -r "SimpleFlow" --include="*.ts" --include="*.tsx" --include="*.json" \
  --exclude-dir=node_modules | wc -l

# 统计 @simpleflow 出现次数
echo "@simpleflow 包引用次数:"
grep -r "@simpleflow" --include="*.ts" --include="*.tsx" --include="*.json" \
  --exclude-dir=node_modules | wc -l

# 统计 SDX 出现次数
echo "SDX 代币引用次数:"
grep -r "SDX" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules | wc -l
```

---

## 完成标准

Phase 9 完成的标志：

- [ ] `pnpm install` 成功
- [ ] `pnpm build` 成功
- [ ] 所有测试通过
- [ ] 本地预览正常
- [ ] 无品牌残留
- [ ] 生成最终报告

---

## 🎉 品牌替换完成！

恭喜！如果所有检查都通过，品牌替换工作已完成。

### 下一步

1. **代码审查**: 提交 PR 进行代码审查
2. **预发布环境**: 部署到预发布环境测试
3. **生产部署**: 部署到生产环境
4. **监控**: 监控生产环境运行状况

---

*上一步: [Phase 8: 其他清理](./phase-8-cleanup.md)*  
*返回: [品牌替换总览](../rebranding-overview.md)*
