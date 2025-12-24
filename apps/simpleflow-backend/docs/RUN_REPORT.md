# SimpleFlow Backend 运行报告

> 生成时间: 2025-12-25
> 环境: 本地开发环境

---

## 📋 概述

SimpleFlow Backend 是基于 NestJS 框架构建的后端 API 服务，用于替代原有的 Cloudflare Workers API。本报告记录了服务的部署和运行状态。

---

## ✅ 状态总结

| 检查项 | 状态 | 响应时间 | 说明 |
|--------|------|----------|------|
| Health Check | ✓ 通过 | 22ms | 服务正常运行 |
| Tokens - Default List | ✓ 通过 | 9ms | 默认代币列表端点 |
| Tokens - Extended List | ✓ 通过 | 9ms | 扩展代币列表端点 |
| Tokens - By Chain | ✓ 通过 | 9ms | 按链获取代币端点 |
| Tokens - Search | ✓ 通过 | 9ms | 代币搜索端点 |

**总检查数**: 5 | **通过**: 5 | **失败**: 0 | **警告**: 0 | **平均响应时间**: 11.60ms

---

## 🚀 服务信息

### 基本信息

| 属性 | 值 |
|------|-----|
| 服务名称 | SimpleFlow Backend API |
| 运行时间 | 113+ 秒 |
| 端口 | 3000 |
| 内存使用 (RSS) | 97.3 MB |
| 堆内存使用 | 31.7 MB / 34.8 MB |

### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 根端点，返回欢迎信息 |
| `/health` | GET | 健康检查端点 |
| `/tokens/list/default` | GET | 获取默认代币列表 |
| `/tokens/list/extended` | GET | 获取扩展代币列表 |
| `/tokens/:chainId` | GET | 按链ID获取代币 |
| `/tokens/search/:query` | GET | 搜索代币 |

---

## 🏗️ 架构组件

### 已实现模块

| 模块 | 状态 | 描述 |
|------|------|------|
| **Health Module** | ✅ 运行中 | 健康检查和状态监控 |
| **Tokens Module** | ✅ 运行中 | 代币列表和搜索 API |
| **Cache Module** | ✅ 运行中 | 内存缓存服务 (cache-manager) |
| **RPC Module** | ✅ 运行中 | 多链 RPC 连接池 (4条链) |
| **Logger Module** | ✅ 运行中 | 日志服务 |

### 待实现模块

| 模块 | 状态 | 说明 |
|------|------|------|
| **Farms Module** | ⏳ 暂时禁用 | 农场数据 API (等待 workspace 包编译问题修复) |
| **Routing Module** | ⏳ 暂时禁用 | 路由计算 API (等待 workspace 包编译问题修复) |

---

## 🔧 配置信息

### 环境变量

```bash
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
```

### RPC 配置

| 链 | Chain ID | 状态 |
|----|----------|------|
| Ethereum | 1 | ✅ 已初始化 |
| BSC | 56 | ✅ 已初始化 |
| BSC Testnet | 97 | ✅ 已初始化 |
| SimpleChain | 8802 | ✅ 已初始化 |

---

## 📊 性能指标

### 响应时间

- **最快**: 9ms
- **最慢**: 22ms
- **平均**: 11.60ms

### 内存使用

```
RSS (常驻集大小):     97.3 MB
Heap Total:           34.8 MB
Heap Used:            31.7 MB
External:             2.4 MB
Array Buffers:       26.9 KB
```

---

## ⚠️ 已知问题

### 1. Workspace 包编译问题

**问题描述**: `@pancakeswap/smart-router` 和 `@pancakeswap/farms` 等 workspace 包在 NestJS 构建时无法正确解析。

**影响范围**:
- Farms Module (暂时禁用)
- Routing Module (暂时禁用)

**临时解决方案**: 已暂时禁用受影响的模块，保留核心 Health 和 Tokens 功能。

**后续计划**:
1. 修复 tsconfig.json 的 workspace 包解析配置
2. 或者将依赖改为直接从 npm 安装编译后的版本
3. 或者使用 tsc 直接编译而不是 nest build

### 2. Token List 文件位置

**问题描述**: 服务启动时找不到 `dist/tokens/` 目录下的代币列表文件。

**影响**: 代币列表返回空数组（0 tokens）

**解决方案**: 启动前运行 `pnpm build:tokens` 或修改代码从项目根目录读取

---

## 📝 快速启动

### 开发模式

```bash
cd apps/simpleflow-backend
pnpm install
pnpm build:tokens  # 构建代币列表
pnpm build         # 构建项目
PORT=3000 node dist/main.js
```

### 运行健康检查

```bash
# 使用默认配置 (localhost:3000)
pnpm exec tsx scripts/health-check.ts

# 指定服务器地址
BASE_URL=http://your-server:3000 pnpm exec tsx scripts/health-check.ts
```

---

## 🎯 下一步计划

1. **修复 Farms 和 Routing 模块**
   - 解决 workspace 包编译问题
   - 重新启用完整功能

2. **完善 Token List**
   - 从 `dist/tokens/` 移动到项目根目录
   - 或者在启动时自动复制

3. **添加更多健康检查**
   - 数据库连接检查
   - RPC 节点健康检查
   - 外部 API 可用性检查

4. **监控和告警**
   - 集成 Prometheus 指标
   - 添加日志聚合

---

## 📞 支持

如有问题，请联系开发团队或查看项目文档。

---

*本报告由 SimpleFlow Backend 健康检查脚本自动生成*
