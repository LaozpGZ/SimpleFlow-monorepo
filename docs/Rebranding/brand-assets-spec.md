# SimpleFlow 品牌资源设计规范

> 外包设计团队参考文档
> 项目: PancakeSwap → SimpleFlow 品牌重塑

---

## 1. 项目背景

SimpleFlow 是一个去中心化交易所 (DEX) 平台，需要将原有的 PancakeSwap 品牌（兔子/煎饼主题）完全替换为全新的 SimpleFlow 品牌形象。

**新域名**: `simpleflow.finance`

---

## 2. 品牌定位

| 属性 | 描述 |
|------|------|
| **品牌名称** | SimpleFlow |
| **品牌调性** | 简洁、流畅、专业、现代 |
| **目标用户** | DeFi 用户、加密货币交易者 |
| **核心价值** | 简单易用的去中心化金融体验 |

---

## 3. 需要设计的资源清单

### 3.1 Logo 系列 (必需)

| 资源名称 | 规格 | 格式 | 用途 | 优先级 |
|---------|------|------|------|--------|
| **主 Logo** | 198x199px | SVG + PNG | 网站主 Logo | P0 |
| **圆形 Logo** | 32x32, 64x64, 128x128, 256x256 | SVG + PNG | Favicon, 头像 | P0 |
| **带文字 Logo** | 宽度 160px+ | SVG + PNG | 导航栏、页脚 | P0 |
| **深色背景版** | 同上 | SVG + PNG | 深色模式 | P0 |
| **浅色背景版** | 同上 | SVG + PNG | 浅色模式 | P0 |
| **单色版** | 同上 | SVG | 特殊场景 | P1 |

### 3.2 Favicon 系列

| 资源名称 | 规格 | 格式 |
|---------|------|------|
| favicon.ico | 16x16, 32x32, 48x48 | ICO |
| apple-touch-icon | 180x180 | PNG |
| android-chrome | 192x192, 512x512 | PNG |

### 3.3 加载动画 (必需)

| 资源名称 | 规格 | 格式 | 说明 |
|---------|------|------|------|
| **加载 Spinner** | 200x200 | GIF / Lottie JSON | 替换 `pancake-3d-spinner-v2.gif` |
| **骨架屏 Logo** | 可缩放 | SVG | 页面加载占位 |

**当前加载动画参考**: 3D 旋转的煎饼兔子动画

---

## 4. 应用图标与装饰

### 4.1 首页装饰图

| 资源名称 | 当前文件 | 规格 | 说明 |
|---------|---------|------|------|
| 飞行装饰 1 | `flying-pancakes/1-left.png` | 约 200x200 | 首页左侧装饰 |
| 飞行装饰 2 | `flying-pancakes/2-left.png` | 约 200x200 | 首页左侧装饰 |
| 飞行装饰 3 | `flying-pancakes/3-left.png` | 约 200x200 | 首页左侧装饰 |
| 飞行装饰 4 | `flying-pancakes/1-right.png` | 约 200x200 | 首页右侧装饰 |
| 飞行装饰 5 | `flying-pancakes/2-right.png` | 约 200x200 | 首页右侧装饰 |
| 飞行装饰 6 | `flying-pancakes/3-right.png` | 约 200x200 | 首页右侧装饰 |

### 4.2 背景图案

| 资源名称 | 当前文件 | 规格 | 说明 |
|---------|---------|------|------|
| 主背景 | `pan-bg.svg` | 可平铺 | 页面背景图案 |
| 移动端背景 | `pan-bg-mobile.svg` | 可平铺 | 移动端背景 |
| 蛋糕背景 | `cake-bg.svg` | 可平铺 | 特定页面背景 |

---

## 5. 功能图标

### 5.1 Toggle 组件图标

| 资源名称 | 规格 | 说明 |
|---------|------|------|
| Toggle On 状态 | 28x28 | 开关组件开启状态图标 |
| Toggle Off 状态 | 28x28 | 开关组件关闭状态图标 |

**当前实现**: 煎饼兔子的开/关动画效果

**文件位置**: `packages/uikit/src/components/PancakeToggle/`

### 5.2 菜单与导航图标

| 资源名称 | 规格 | 格式 |
|---------|------|------|
| 导航 Logo (深色) | `nav-title-dark.png` | PNG |
| 导航 Logo (浅色) | `nav-title-light.png` | PNG |

---

## 6. NFT 与收藏品系列 (可选)

> 如果保留 NFT 功能，需要重新设计以下资源

### 6.1 Squad 系列

| 资源名称 | 当前文件 | 规格 |
|---------|---------|------|
| Squad 头像 | `pancake-squad-avatar.png` | 256x256 |
| Squad Banner (大) | `pancake-squad-banner-lg.png` | 1200x400 |
| Squad Banner (小) | `pancake-squad-banner-sm.png` | 600x200 |
| Squad 装饰 | `decorations/pancakesquad.png` | 可变 |

### 6.2 Bunnies 系列

| 资源名称 | 路径 | 说明 |
|---------|------|------|
| Moon Bunny | `pancakeSquad/moonBunny/` | 月亮主题角色 |
| 其他角色 | `pancakeSquad/` | 各种角色变体 |

---

## 7. 代币图标

### 7.1 原生代币图标 (如需更换)

| 资源名称 | 规格 | 格式 | 说明 |
|---------|------|------|------|
| 代币图标 | 64x64, 128x128 | SVG + PNG | 主代币图标 |
| 代币图标 (灰色) | 同上 | PNG | 禁用状态 |
| 燃烧代币图标 | 同上 | PNG | 燃烧展示 |

**当前文件**:
- `cake.svg`
- `cakeGrey.png`
- `burnt-cake.png`

---

## 8. 特殊页面资源

### 8.1 错误与状态页面

| 资源名称 | 当前文件 | 说明 |
|---------|---------|------|
| 网络检查 | `check-your-network.png` | 网络错误提示图 |
| 帮助图标 | `help.png` | 帮助页面图标 |
| 英雄图 | `hero.png` | 首页主视觉 |

### 8.2 节日主题 (可选)

| 资源名称 | 当前文件 | 说明 |
|---------|---------|------|
| 圣诞主题 | `bunny-santa.svg` | 圣诞节装饰 |
| 复活节主题 | `easter-battle.png` | 复活节活动 |

---

## 9. 设计规范

### 9.1 色彩建议

| 用途 | 建议方向 |
|------|---------|
| 主色调 | 建议使用蓝色/紫色系，体现"Flow"流动感 |
| 辅助色 | 渐变色，体现现代感 |
| 强调色 | 用于按钮、链接等交互元素 |

**当前 PancakeSwap 色彩参考**:
- 主色: `#D1884F` (棕色/煎饼色)
- 深色: `#633001` (深棕色)
- 强调: `#FEDC90` (金黄色)

### 9.2 设计风格

| 属性 | 建议 |
|------|------|
| 风格 | 扁平化 / 轻拟物 |
| 线条 | 圆润、流畅 |
| 图标 | 简洁、易识别 |
| 动画 | 流畅、不突兀 |

### 9.3 Logo 设计要求

1. **可识别性**: 在小尺寸 (16x16) 下仍可识别
2. **可扩展性**: SVG 格式，支持任意缩放
3. **双模式**: 必须提供深色/浅色两个版本
4. **简洁性**: 避免过于复杂的细节

---

## 10. 文件交付要求

### 10.1 文件格式

| 类型 | 格式要求 |
|------|---------|
| 矢量图 | SVG (优化后，去除多余元数据) |
| 位图 | PNG (透明背景, 2x 分辨率) |
| 动画 | GIF 或 Lottie JSON |
| 源文件 | Figma / Sketch / AI |

### 10.2 命名规范

```
simpleflow-logo.svg
simpleflow-logo-round.svg
simpleflow-logo-with-text.svg
simpleflow-logo-dark.svg
simpleflow-logo-light.svg
simpleflow-spinner.gif
simpleflow-toggle-on.svg
simpleflow-toggle-off.svg
```

### 10.3 交付清单

- [ ] Logo 系列 (6+ 变体)
- [ ] Favicon 系列
- [ ] 加载动画
- [ ] Toggle 组件图标
- [ ] 导航图标
- [ ] 首页装饰图 (6+)
- [ ] 背景图案 (3+)
- [ ] 源文件

---

## 11. 当前资源位置参考

设计团队可参考以下路径了解当前资源：

```
apps/web/public/
├── logo.png                          # 主 Logo
├── favicon.ico                       # Favicon
├── images/
│   ├── pancake-3d-spinner-v2.gif    # 加载动画
│   ├── cake.svg                      # 代币图标
│   ├── home/
│   │   └── flying-pancakes/         # 首页装饰
│   ├── collections/
│   │   └── pancake-squad-*          # NFT 系列
│   └── decorations/                  # 装饰图

packages/uikit/src/components/
├── Svg/Icons/
│   ├── Logo.tsx                      # Logo SVG 组件
│   ├── LogoRound.tsx                 # 圆形 Logo
│   └── LogoWithText.tsx              # 带文字 Logo
└── PancakeToggle/                    # Toggle 组件
```

---

## 12. 时间节点建议

| 阶段 | 内容 | 建议时间 |
|------|------|---------|
| Phase 1 | Logo 系列 + Favicon | 1 周 |
| Phase 2 | 加载动画 + Toggle 图标 | 3 天 |
| Phase 3 | 首页装饰 + 背景 | 1 周 |
| Phase 4 | NFT 系列 (可选) | 2 周 |
| 总计 | - | 3-4 周 |

---

## 13. 联系方式

如有设计相关问题，请联系：

- **项目负责人**: [填写]
- **技术对接人**: [填写]
- **设计评审**: [填写]

---

*文档版本: 1.0*
*创建时间: 2024-12-25*
