# SimpleFlow Backend 运行报告

> 生成时间: 2025-12-25 01:56:54
> 环境: 本地开发环境
> 服务地址: http://localhost:3000

---

## 📋 执行摘要

| 指标 | 结果 |
|------|------|
| 总检查数 | 5 |
| 通过 | 5 |
| 失败 | 0 |
| 警告 | 0 |
| 平均响应时间 | 11.20ms |
| 服务状态 | ✅ 正常运行 |

---

## ✅ 健康检查结果

| 检查项 | 状态 | 响应时间 | 说明 |
|--------|------|----------|------|
| Health Check | ✓ 通过 | 22ms | 服务健康状态正常 |
| Tokens - Default List | ✓ 通过 | 9ms | 默认代币列表端点 |
| Tokens - Extended List | ✓ 通过 | 8ms | 扩展代币列表端点 |
| Tokens - By Chain (BSC) | ✓ 通过 | 8ms | 按链获取代币端点 |
| Tokens - Search | ✓ 通过 | 9ms | 代币搜索端点 |

---

## 🚀 服务信息

### 基本信息

| 属性 | 值 |
|------|-----|
| 服务名称 | SimpleFlow Backend API |
| 运行时间 | 73.19 秒 |
| 端口 | 3000 |
| 内存使用 (RSS) | 96.5 MB |
| 堆内存使用 | 31.7 MB / 34.6 MB |

---

## 🛣️ API 端点

| 端点 | 方法 | 描述 | 状态 |
|------|------|------|------|
| `/` | GET | 根端点 | ✅ |
| `/health` | GET | 健康检查 | ✅ |
| `/tokens/list/default` | GET | 默认代币列表 | ✅ |
| `/tokens/list/extended` | GET | 扩展代币列表 | ✅ |
| `/tokens/:chainId` | GET | 按链获取代币 | ✅ |
| `/tokens/search/:query` | GET | 搜索代币 | ✅ |

---

## 🏗️ 架构组件

| 模块 | 状态 |
|------|------|
| Health Module | ✅ 运行中 |
| Tokens Module | ✅ 运行中 |
| Cache Module | ✅ 运行中 |
| RPC Module | ✅ 运行中 (4条链) |
| Logger Module | ✅ 运行中 |

---

## 📊 性能指标

- **最快**: 8ms
- **最慢**: 22ms
- **平均**: 11.20ms

---

*本报告自动生成*
