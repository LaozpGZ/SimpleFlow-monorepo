# SimpleFlow 品牌资源文件清单

> 原始文件已拷贝至 `docs/Rebranding/file/` 目录
> 设计团队需要根据此清单替换为新的 SimpleFlow 品牌资源

---

## 1. Logo 系列

### 1.1 主 Logo 文件

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 1 | `apps/web/public/logo.png` | `file/logo/logo.png` | PNG | Web 主 Logo |
| 2 | `apps/aptos/public/logo.png` | `file/logo/logo-aptos.png` | PNG | Aptos 版本 |
| 3 | `apps/solana/public/logo.png` | `file/logo/logo-solana.png` | PNG | Solana 版本 |

### 1.2 Logo SVG 组件 (需要修改 SVG 路径)

| 序号 | 原始文件 | 参考副本 | 说明 |
|------|---------|---------|------|
| 4 | `packages/uikit/src/components/Svg/Icons/Logo.tsx` | `file/logo/Logo.tsx` | 主 Logo SVG |
| 5 | `packages/uikit/src/components/Svg/Icons/LogoRound.tsx` | `file/logo/LogoRound.tsx` | 圆形 Logo |
| 6 | `packages/uikit/src/components/Svg/Icons/LogoWithText.tsx` | `file/logo/LogoWithText.tsx` | 带文字 Logo |

---

## 2. Favicon

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 7 | `apps/web/public/favicon.ico` | `file/favicon/favicon.ico` | ICO | 网站图标 |

---

## 3. 加载动画

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 8 | `apps/web/public/images/pancake-3d-spinner-v2.gif` | `file/spinner/pancake-3d-spinner-v2.gif` | GIF | 3D 旋转加载动画 |

---

## 4. 导航栏图标

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 9 | `apps/web/public/images/nav-title-dark.png` | `file/nav/nav-title-dark.png` | PNG | 深色模式导航 Logo |
| 10 | `apps/web/public/images/nav-title-light.png` | `file/nav/nav-title-light.png` | PNG | 浅色模式导航 Logo |

---

## 5. Toggle 组件

| 序号 | 原始文件 | 参考副本 | 说明 |
|------|---------|---------|------|
| 11 | `packages/uikit/src/components/PancakeToggle/PancakeToggle.tsx` | `file/toggle/PancakeToggle/PancakeToggle.tsx` | 主组件 |
| 12 | `packages/uikit/src/components/PancakeToggle/StyledPancakeToggle.tsx` | `file/toggle/PancakeToggle/StyledPancakeToggle.tsx` | 样式组件 (含 SVG) |
| 13 | `packages/uikit/src/components/PancakeToggle/index.tsx` | `file/toggle/PancakeToggle/index.tsx` | 导出文件 |
| 14 | `packages/uikit/src/components/PancakeToggle/theme.ts` | `file/toggle/PancakeToggle/theme.ts` | 主题配置 |
| 15 | `packages/uikit/src/components/PancakeToggle/types.ts` | `file/toggle/PancakeToggle/types.ts` | 类型定义 |

---

## 6. 代币图标

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 16 | `apps/web/public/images/cake.svg` | `file/token-icons/cake.svg` | SVG | CAKE 代币图标 → **SDX** |
| 17 | `apps/web/public/images/cakeGrey.png` | `file/token-icons/cakeGrey.png` | PNG | 灰色版本 (禁用状态) |
| 18 | `apps/web/public/images/burnt-cake.png` | `file/token-icons/burnt-cake.png` | PNG | 燃烧图标 |

---

## 7. 背景图案

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 19 | `apps/web/public/images/pan-bg.svg` | `file/backgrounds/pan-bg.svg` | SVG | 主背景图案 |
| 20 | `apps/web/public/images/pan-bg-mobile.svg` | `file/backgrounds/pan-bg-mobile.svg` | SVG | 移动端背景 |
| 21 | `apps/web/public/images/pan-bg2.svg` | `file/backgrounds/pan-bg2.svg` | SVG | 备用背景 |
| 22 | `apps/web/public/images/cake-bg.svg` | `file/backgrounds/cake-bg.svg` | SVG | 蛋糕背景 |

---

## 8. 首页装饰图

### 8.1 飞行装饰 (Flying Pancakes)

| 序号 | 原始文件 | 参考副本 | 格式 |
|------|---------|---------|------|
| 23 | `apps/web/public/images/home/flying-pancakes/1-left.png` | `file/home-decorations/flying-pancakes/1-left.png` | PNG |
| 24 | `apps/web/public/images/home/flying-pancakes/1-left.webp` | `file/home-decorations/flying-pancakes/1-left.webp` | WebP |
| 25 | `apps/web/public/images/home/flying-pancakes/1-left@1.5x.png` | `file/home-decorations/flying-pancakes/1-left@1.5x.png` | PNG |
| 26 | `apps/web/public/images/home/flying-pancakes/1-left@1.5x.webp` | `file/home-decorations/flying-pancakes/1-left@1.5x.webp` | WebP |
| 27 | `apps/web/public/images/home/flying-pancakes/1-left@2x.png` | `file/home-decorations/flying-pancakes/1-left@2x.png` | PNG |
| 28 | `apps/web/public/images/home/flying-pancakes/1-left@2x.webp` | `file/home-decorations/flying-pancakes/1-left@2x.webp` | WebP |
| 29 | `apps/web/public/images/home/flying-pancakes/1-top.png` | `file/home-decorations/flying-pancakes/1-top.png` | PNG |
| 30 | `apps/web/public/images/home/flying-pancakes/1-top.webp` | `file/home-decorations/flying-pancakes/1-top.webp` | WebP |
| 31 | `apps/web/public/images/home/flying-pancakes/1-top@1.5x.png` | `file/home-decorations/flying-pancakes/1-top@1.5x.png` | PNG |
| 32 | `apps/web/public/images/home/flying-pancakes/1-top@1.5x.webp` | `file/home-decorations/flying-pancakes/1-top@1.5x.webp` | WebP |
| 33 | `apps/web/public/images/home/flying-pancakes/1-top@2x.png` | `file/home-decorations/flying-pancakes/1-top@2x.png` | PNG |
| 34 | `apps/web/public/images/home/flying-pancakes/1-top@2x.webp` | `file/home-decorations/flying-pancakes/1-top@2x.webp` | WebP |
| 35 | `apps/web/public/images/home/flying-pancakes/1-bottom.png` | `file/home-decorations/flying-pancakes/1-bottom.png` | PNG |
| 36 | `apps/web/public/images/home/flying-pancakes/1-bottom.webp` | `file/home-decorations/flying-pancakes/1-bottom.webp` | WebP |
| 37 | `apps/web/public/images/home/flying-pancakes/1-bottom@1.5x.png` | `file/home-decorations/flying-pancakes/1-bottom@1.5x.png` | PNG |
| 38 | `apps/web/public/images/home/flying-pancakes/1-bottom@1.5x.webp` | `file/home-decorations/flying-pancakes/1-bottom@1.5x.webp` | WebP |
| 39 | `apps/web/public/images/home/flying-pancakes/1-bottom@2x.png` | `file/home-decorations/flying-pancakes/1-bottom@2x.png` | PNG |
| 40 | `apps/web/public/images/home/flying-pancakes/1-bottom@2x.webp` | `file/home-decorations/flying-pancakes/1-bottom@2x.webp` | WebP |
| 41 | `apps/web/public/images/home/flying-pancakes/2-right.png` | `file/home-decorations/flying-pancakes/2-right.png` | PNG |
| 42 | `apps/web/public/images/home/flying-pancakes/2-right.webp` | `file/home-decorations/flying-pancakes/2-right.webp` | WebP |
| 43 | `apps/web/public/images/home/flying-pancakes/2-right@1.5x.png` | `file/home-decorations/flying-pancakes/2-right@1.5x.png` | PNG |
| 44 | `apps/web/public/images/home/flying-pancakes/2-right@1.5x.webp` | `file/home-decorations/flying-pancakes/2-right@1.5x.webp` | WebP |
| 45 | `apps/web/public/images/home/flying-pancakes/2-right@2x.png` | `file/home-decorations/flying-pancakes/2-right@2x.png` | PNG |
| 46 | `apps/web/public/images/home/flying-pancakes/2-right@2x.webp` | `file/home-decorations/flying-pancakes/2-right@2x.webp` | WebP |
| 47 | `apps/web/public/images/home/flying-pancakes/2-top.png` | `file/home-decorations/flying-pancakes/2-top.png` | PNG |
| 48 | `apps/web/public/images/home/flying-pancakes/2-top.webp` | `file/home-decorations/flying-pancakes/2-top.webp` | WebP |
| 49 | `apps/web/public/images/home/flying-pancakes/2-top@1.5x.png` | `file/home-decorations/flying-pancakes/2-top@1.5x.png` | PNG |
| 50 | `apps/web/public/images/home/flying-pancakes/2-top@1.5x.webp` | `file/home-decorations/flying-pancakes/2-top@1.5x.webp` | WebP |
| 51 | `apps/web/public/images/home/flying-pancakes/2-top@2x.png` | `file/home-decorations/flying-pancakes/2-top@2x.png` | PNG |
| 52 | `apps/web/public/images/home/flying-pancakes/2-top@2x.webp` | `file/home-decorations/flying-pancakes/2-top@2x.webp` | WebP |
| 53 | `apps/web/public/images/home/flying-pancakes/2-bottom.png` | `file/home-decorations/flying-pancakes/2-bottom.png` | PNG |
| 54 | `apps/web/public/images/home/flying-pancakes/2-bottom.webp` | `file/home-decorations/flying-pancakes/2-bottom.webp` | WebP |
| 55 | `apps/web/public/images/home/flying-pancakes/2-bottom@1.5x.png` | `file/home-decorations/flying-pancakes/2-bottom@1.5x.png` | PNG |
| 56 | `apps/web/public/images/home/flying-pancakes/2-bottom@1.5x.webp` | `file/home-decorations/flying-pancakes/2-bottom@1.5x.webp` | WebP |
| 57 | `apps/web/public/images/home/flying-pancakes/2-bottom@2x.png` | `file/home-decorations/flying-pancakes/2-bottom@2x.png` | PNG |
| 58 | `apps/web/public/images/home/flying-pancakes/2-bottom@2x.webp` | `file/home-decorations/flying-pancakes/2-bottom@2x.webp` | WebP |

### 8.2 其他装饰

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 59 | `apps/web/public/images/decorations/pancakesquad.png` | `file/home-decorations/pancakesquad.png` | PNG | Squad 装饰 |

---

## 9. NFT 收藏品系列 (可选)

### 9.1 Squad Banner

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 60 | `apps/web/public/images/collections/pancake-squad-avatar.png` | `file/nft-collections/pancake-squad-avatar.png` | PNG | 头像 |
| 61 | `apps/web/public/images/collections/pancake-squad-banner-lg.png` | `file/nft-collections/pancake-squad-banner-lg.png` | PNG | 大 Banner |
| 62 | `apps/web/public/images/collections/pancake-squad-banner-sm.png` | `file/nft-collections/pancake-squad-banner-sm.png` | PNG | 小 Banner |

### 9.2 Squad 角色

| 序号 | 原始文件 | 参考副本 | 格式 |
|------|---------|---------|------|
| 63 | `apps/web/public/images/pancakeSquad/artist.png` | `file/nft-collections/pancakeSquad/artist.png` | PNG |
| 64 | `apps/web/public/images/pancakeSquad/artist-dark.png` | `file/nft-collections/pancakeSquad/artist-dark.png` | PNG |
| 65 | `apps/web/public/images/pancakeSquad/squadRow.png` | `file/nft-collections/pancakeSquad/squadRow.png` | PNG |

### 9.3 Bunnies 系列

| 序号 | 原始文件 | 参考副本 | 格式 |
|------|---------|---------|------|
| 66 | `apps/web/public/images/pancakeSquad/bunnies/bunny0.png` | `file/nft-collections/pancakeSquad/bunnies/bunny0.png` | PNG |
| 67 | `apps/web/public/images/pancakeSquad/bunnies/bunny1.png` | `file/nft-collections/pancakeSquad/bunnies/bunny1.png` | PNG |
| 68 | `apps/web/public/images/pancakeSquad/bunnies/bunny2.png` | `file/nft-collections/pancakeSquad/bunnies/bunny2.png` | PNG |
| 69 | `apps/web/public/images/pancakeSquad/bunnies/bunny3.png` | `file/nft-collections/pancakeSquad/bunnies/bunny3.png` | PNG |
| 70 | `apps/web/public/images/pancakeSquad/bunnies/bunny4.png` | `file/nft-collections/pancakeSquad/bunnies/bunny4.png` | PNG |
| 71 | `apps/web/public/images/pancakeSquad/bunnies/bunny5.png` | `file/nft-collections/pancakeSquad/bunnies/bunny5.png` | PNG |
| 72 | `apps/web/public/images/pancakeSquad/bunnies/bunny6.png` | `file/nft-collections/pancakeSquad/bunnies/bunny6.png` | PNG |
| 73 | `apps/web/public/images/pancakeSquad/bunnies/bunny7.png` | `file/nft-collections/pancakeSquad/bunnies/bunny7.png` | PNG |
| 74 | `apps/web/public/images/pancakeSquad/bunnies/bunny8.png` | `file/nft-collections/pancakeSquad/bunnies/bunny8.png` | PNG |
| 75 | `apps/web/public/images/pancakeSquad/bunnies/bunny9.png` | `file/nft-collections/pancakeSquad/bunnies/bunny9.png` | PNG |
| 76 | `apps/web/public/images/pancakeSquad/bunnies/bunny10.png` | `file/nft-collections/pancakeSquad/bunnies/bunny10.png` | PNG |

### 9.4 Moon Bunny 系列

| 序号 | 原始文件 | 参考副本 | 格式 |
|------|---------|---------|------|
| 77 | `apps/web/public/images/pancakeSquad/moonBunny/band.png` | `file/nft-collections/pancakeSquad/moonBunny/band.png` | PNG |
| 78 | `apps/web/public/images/pancakeSquad/moonBunny/body.png` | `file/nft-collections/pancakeSquad/moonBunny/body.png` | PNG |
| 79 | `apps/web/public/images/pancakeSquad/moonBunny/cloth.png` | `file/nft-collections/pancakeSquad/moonBunny/cloth.png` | PNG |
| 80 | `apps/web/public/images/pancakeSquad/moonBunny/glasses.png` | `file/nft-collections/pancakeSquad/moonBunny/glasses.png` | PNG |
| 81 | `apps/web/public/images/pancakeSquad/moonBunny/pancake.png` | `file/nft-collections/pancakeSquad/moonBunny/pancake.png` | PNG |

---

## 10. 其他资源

| 序号 | 原始文件 | 参考副本 | 格式 | 说明 |
|------|---------|---------|------|------|
| 82 | `apps/web/public/images/hero.png` | `file/misc/hero.png` | PNG | 首页主视觉 |
| 83 | `apps/web/public/images/check-your-network.png` | `file/misc/check-your-network.png` | PNG | 网络错误提示 |
| 84 | `apps/web/public/images/help.png` | `file/misc/help.png` | PNG | 帮助图标 |
| 85 | `apps/web/public/images/bunny-santa.svg` | `file/misc/bunny-santa.svg` | SVG | 圣诞主题 |
| 86 | `apps/web/public/images/easter-battle.png` | `file/misc/easter-battle.png` | PNG | 复活节主题 |

---

## 统计汇总

| 类别 | 文件数 | 优先级 |
|------|--------|--------|
| Logo 系列 | 6 | **P0** |
| Favicon | 1 | **P0** |
| 加载动画 | 1 | **P0** |
| 导航图标 | 2 | **P1** |
| Toggle 组件 | 5 | **P1** |
| 代币图标 | 3 | **P1** |
| 背景图案 | 4 | **P2** |
| 首页装饰 | 37 | **P2** |
| NFT 系列 | 22 | **P3** |
| 其他资源 | 5 | **P3** |
| **总计** | **86** | - |

---

## 交付检查清单

### P0 - 必须 (上线前必须完成)

- [ ] `logo.png` - 主 Logo
- [ ] `Logo.tsx` - Logo SVG 组件
- [ ] `LogoRound.tsx` - 圆形 Logo
- [ ] `LogoWithText.tsx` - 带文字 Logo
- [ ] `favicon.ico` - 网站图标
- [ ] `pancake-3d-spinner-v2.gif` → `simpleflow-spinner.gif` - 加载动画

### P1 - 重要 (上线后尽快完成)

- [ ] `nav-title-dark.png` - 深色导航 Logo
- [ ] `nav-title-light.png` - 浅色导航 Logo
- [ ] `PancakeToggle/` → `SimpleFlowToggle/` - Toggle 组件
- [ ] `cake.svg` → `sdx.svg` - SDX 代币图标
- [ ] `cakeGrey.png` → `sdxGrey.png` - 灰色代币图标
- [ ] `burnt-cake.png` → `burnt-sdx.png` - 燃烧图标

### P2 - 一般 (可分批完成)

- [ ] `pan-bg.svg` - 主背景
- [ ] `pan-bg-mobile.svg` - 移动端背景
- [ ] `pan-bg2.svg` - 备用背景
- [ ] `cake-bg.svg` - 代币背景
- [ ] `flying-pancakes/` → `flying-decorations/` - 首页装饰 (36 个文件)

### P3 - 可选 (根据业务需求)

- [ ] NFT 系列 (22 个文件)
- [ ] 节日主题图片
- [ ] 其他装饰图片

---

*文档创建时间: 2024-12-25*
