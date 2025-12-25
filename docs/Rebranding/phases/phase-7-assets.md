# Phase 7: Logo 和资源替换

> **状态**: 待开始  
> **预计时间**: 1 小时  
> **依赖**: Phase 0 设计完成 + Phase 6 完成

---

## 目的

替换所有 PancakeSwap 的视觉资源为 SimpleFlow 新设计。

---

## 7.1 Logo 替换

### 主 Logo 文件

| 文件路径 | 说明 |
|---------|------|
| `apps/web/public/logo.png` | 主 Logo |
| `apps/web/public/logo-dark.png` | 深色 Logo |
| `apps/web/public/logo-with-text.png` | 带文字 Logo |
| `packages/uikit/src/components/Svg/Icons/Logo.tsx` | SVG Logo 组件 |
| `packages/uikit/src/components/Svg/Icons/LogoWithText.tsx` | 带文字 SVG |

### 执行步骤

```bash
# 将设计交付的 Logo 复制到对应位置
cp /path/to/new/logo.png apps/web/public/logo.png
cp /path/to/new/logo-dark.png apps/web/public/logo-dark.png
```

### 检查清单

- [ ] 替换 `logo.png`
- [ ] 替换 `logo-dark.png`
- [ ] 更新 `Logo.tsx` SVG 组件
- [ ] 更新 `LogoWithText.tsx` SVG 组件

---

## 7.2 Favicon 替换

### 文件位置

| 文件路径 | 说明 |
|---------|------|
| `apps/web/public/favicon.ico` | 主 Favicon |
| `apps/web/public/favicon-16x16.png` | 16x16 |
| `apps/web/public/favicon-32x32.png` | 32x32 |
| `apps/web/public/apple-touch-icon.png` | Apple Touch Icon |

### 执行步骤

```bash
cp /path/to/new/favicon.ico apps/web/public/favicon.ico
cp /path/to/new/favicon-16x16.png apps/web/public/favicon-16x16.png
cp /path/to/new/favicon-32x32.png apps/web/public/favicon-32x32.png
cp /path/to/new/apple-touch-icon.png apps/web/public/apple-touch-icon.png
```

### 检查清单

- [ ] 替换 `favicon.ico`
- [ ] 替换 `favicon-16x16.png`
- [ ] 替换 `favicon-32x32.png`
- [ ] 替换 `apple-touch-icon.png`

---

## 7.3 加载动画替换

### 文件位置

| 文件路径 | 说明 |
|---------|------|
| `apps/web/public/images/pancake-3d-spinner-v2.gif` | 3D 加载动画 |

### 执行步骤

```bash
# 重命名并替换
mv apps/web/public/images/pancake-3d-spinner-v2.gif \
   apps/web/public/images/simpleflow-spinner.gif
cp /path/to/new/spinner.gif apps/web/public/images/simpleflow-spinner.gif

# 更新引用
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -exec sed -i '' 's/pancake-3d-spinner-v2\.gif/simpleflow-spinner.gif/g' {} +
```

### 检查清单

- [ ] 替换加载动画 GIF
- [ ] 更新文件引用

---

## 7.4 代币图标

### SDX 代币图标

```bash
cp /path/to/new/sdx-icon.png apps/web/public/images/tokens/sdx.png
```

### 检查清单

- [ ] 添加 SDX 代币图标
- [ ] 添加 WSRW 代币图标 (如需要)

---

## 7.5 OG Image 和社交分享图

### 文件位置

| 文件路径 | 说明 |
|---------|------|
| `apps/web/public/og-image.png` | Open Graph 图片 |
| `apps/web/public/twitter-card.png` | Twitter 卡片图 |

### 执行步骤

```bash
cp /path/to/new/og-image.png apps/web/public/og-image.png
cp /path/to/new/twitter-card.png apps/web/public/twitter-card.png
```

### 检查清单

- [ ] 替换 OG Image
- [ ] 替换 Twitter Card 图片

---

## 完成标准

Phase 7 完成的标志：

- [ ] 主 Logo 已替换
- [ ] Favicon 已替换
- [ ] 加载动画已替换
- [ ] 代币图标已添加
- [ ] OG Image 已替换
- [ ] 本地预览显示新 Logo

---

*上一步: [Phase 6: 包名替换](./phase-6-packages.md)*  
*下一步: [Phase 8: 其他清理](./phase-8-cleanup.md)*
