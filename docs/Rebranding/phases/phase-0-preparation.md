# Phase 0: 准备工作

> **状态**: 待开始  
> **预计时间**: 2-3 周 (可与代码工作并行)  
> **负责方**: 外包设计 / 运维 / 运营

---

## 0.1 设计新 Logo 和品牌资源

**负责方**: 外包设计团队  
**预计时间**: 2-3 周

### 交付物清单

参考 `brand-assets-spec.md` 文档，需要交付：

| 类别 | 文件数 | 优先级 |
|------|--------|--------|
| Logo 系列 | 6+ | **P0** |
| Favicon | 1 | **P0** |
| 加载动画 | 1 | **P0** |
| 导航图标 | 2 | **P1** |
| Toggle 组件 | 5 | **P1** |
| 代币图标 (SDX) | 3 | **P1** |
| 背景图案 | 4 | **P2** |
| 首页装饰 | 30+ | **P2** |

### 参考资源

原始文件已拷贝至 `docs/Rebranding/file/` 目录：
- `file/logo/` - Logo 参考
- `file/favicon/` - Favicon 参考
- `file/spinner/` - 加载动画参考
- `file/token-icons/` - 代币图标参考

### 检查清单

- [ ] 发送 `brand-assets-spec.md` 给设计团队
- [ ] 确认设计风格和主色调
- [ ] 收到初稿并审核
- [ ] 收到最终稿
- [ ] 验收所有交付物

---

## 0.2 注册子域名

**负责方**: 运维  
**预计时间**: 1 天

### 需要配置的子域名

| 子域名 | 用途 |
|--------|------|
| `simpleflow.finance` | 主站 |
| `assets.simpleflow.finance` | 静态资源 CDN |
| `api.simpleflow.finance` | API 网关 |
| `thegraph.simpleflow.finance` | Graph API 代理 |
| `profile.simpleflow.finance` | 用户资料 API |
| `farms-api.simpleflow.finance` | 农场 API |
| `wallet-api.simpleflow.finance` | 钱包 API |
| `notification.simpleflow.finance` | 通知服务 |
| `docs.simpleflow.finance` | 文档站点 |
| `tokens.simpleflow.finance` | Token 列表 |

### 检查清单

- [ ] 域名 DNS 配置
- [ ] SSL 证书申请
- [ ] CDN 配置
- [ ] 验证所有子域名可访问

---

## 0.3 部署 API 基础设施

**负责方**: 运维  
**预计时间**: 1 周

### 需要部署的服务

| 服务 | 当前域名 | 新域名 |
|------|---------|--------|
| Graph API 代理 | `thegraph.pancakeswap.com` | `thegraph.simpleflow.finance` |
| Profile API | `profile.pancakeswap.com` | `profile.simpleflow.finance` |
| Farms API | `farms-api.pancakeswap.com` | `farms-api.simpleflow.finance` |
| Wallet API | `wallet-api.pancakeswap.com` | `wallet-api.simpleflow.finance` |
| Notification Hub | `notification-hub.pancakeswap.com` | `notification.simpleflow.finance` |

### Cloudflare Workers

需要更新的 Workers:
- `apis/farms/`
- `apis/proxy-worker/`
- `apis/routing/`

### 检查清单

- [ ] 部署所有 API 服务
- [ ] 配置环境变量
- [ ] 测试 API 可用性
- [ ] 配置监控告警

---

## 0.4 创建社交媒体账号

**负责方**: 运营  
**预计时间**: 1 天

### 需要创建的账号

| 平台 | 账号名 | 链接 |
|------|--------|------|
| Twitter/X | @simpleflow_fi | `https://twitter.com/simpleflow_fi` |
| Telegram | SimpleFlow | `https://t.me/simpleflow` |
| Discord | SimpleFlow | `https://discord.gg/simpleflow` |
| Medium | @simpleflow | `https://medium.com/@simpleflow` |
| GitHub | simpleflow-finance | `https://github.com/simpleflow-finance` |

### 检查清单

- [ ] 注册所有社交媒体账号
- [ ] 设置头像和封面图 (等待设计完成)
- [ ] 编写简介文案
- [ ] 配置自动化工具 (如需要)

---

## 0.5 外部服务配置

**负责方**: 运维/开发  
**预计时间**: 1 天

### 需要更新的服务

| 服务 | 需要更新 |
|------|---------|
| **Crowdin** | 项目名称和 ID |
| **TheGraph** | Subgraph 部署名称 |
| **Sentry** | 项目名称和 DSN |
| **Vercel/Netlify** | 项目配置 |
| **WalletConnect** | projectId 和项目名称 |
| **Google Analytics** | 新的 GA ID |

### 检查清单

- [ ] 创建新的 Sentry 项目
- [ ] 创建新的 GA 属性
- [ ] 更新 WalletConnect 项目
- [ ] 更新 Crowdin 项目

---

## 完成标准

Phase 0 完成的标志：

- [ ] 所有设计资源已交付
- [ ] 所有子域名已配置并可访问
- [ ] 所有 API 服务已部署
- [ ] 所有社交媒体账号已创建
- [ ] 所有外部服务已配置

---

*下一步: [Phase 1-2: Git 清理和主题色](./phase-1-2-git-theme.md)*
