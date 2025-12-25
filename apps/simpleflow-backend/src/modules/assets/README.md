# Assets Module - 资源/图标管理模块

## 📚 模块说明

自主管理代币图标、链图标、符号图标等资源，支持从外部CDN自动下载并缓存。

## ✨ 功能特性

- **本地存储**: 图标存储在本地文件系统，完全自主可控
- **多源Fallback**: 本地 → PancakeSwap CDN → TrustWallet CDN
- **自动缓存**: 从CDN下载的图标自动保存到本地
- **图片优化**: 自动调整大小（默认128x128）和压缩
- **批量导入**: 支持批量下载常用代币图标
- **管理接口**: 上传、删除、列表查询

## 📁 文件结构

```
public/assets/
├── tokens/           # 代币图标
│   ├── 56/          # BSC链
│   │   └── 0x....png
│   ├── 1/           # Ethereum链
│   └── 137/         # Polygon链
├── chains/          # 链图标
│   ├── 56.png       # BSC
│   ├── 1.png        # Ethereum
│   └── 137.png      # Polygon
└── symbols/         # 符号图标
    ├── cake.png
    ├── eth.png
    └── bnb.png
```

## 🔧 环境变量

| 变量 | 默认值 | 说明 |
|-----|-------|------|
| `ASSETS_STORAGE_PATH` | `./public/assets` | 图标存储路径 |
| `ASSETS_FALLBACK_ENABLED` | `true` | 是否启用CDN回源 |
| `ASSETS_PCS_CDN_URL` | `https://tokens.pancakeswap.finance` | PancakeSwap CDN地址 |
| `ASSETS_TRUSTWALLET_URL` | `https://assets-cdn.trustwallet.com` | TrustWallet CDN地址 |
| `ASSETS_ICON_SIZE` | `128` | 图标优化尺寸(px) |

## 🚀 API接口

### 获取图标

```bash
# 获取代币图标
GET /assets/token/:chainId/:address
示例: /assets/token/56/0x55d398326f99059ff775485246999027b3197955

# 获取符号图标
GET /assets/symbol/:symbol
示例: /assets/symbol/CAKE

# 获取链图标
GET /assets/chain/:chainId
示例: /assets/chain/56
```

### 上传图标

```bash
# 上传代币图标
POST /assets/token/upload
Content-Type: multipart/form-data
Body: chainId, address, file

# 上传链图标
POST /assets/chain/upload
Body: chainId, file

# 上传符号图标
POST /assets/symbol/upload
Body: symbol, file
```

### 删除图标

```bash
# 删除代币图标
DELETE /assets/token/:chainId/:address

# 删除链图标
DELETE /assets/chain/:chainId
```

### 管理接口

```bash
# 获取统计信息
GET /assets/stats

# 列出资源
GET /assets/list?type=token&chainId=56

# 批量导入
POST /assets/import
Body: { chainId: 56, tokens: [{ address: "...", symbol: "CAKE" }] }
```

## 📦 使用方式

### 1. 初始化下载常用图标

```bash
cd apps/simpleflow-backend
pnpm download:assets
```

### 2. 前端调用示例

```typescript
// 获取代币图标
const tokenIconUrl = `https://your-backend.com/assets/token/${chainId}/${tokenAddress}`;

// 获取链图标
const chainIconUrl = `https://your-backend.com/assets/chain/${chainId}`;

// 获取符号图标
const symbolIconUrl = `https://your-backend.com/assets/symbol/CAKE`;
```

### 3. 替换前端CDN配置

在 `apps/web` 中修改：
- 将 `https://tokens.pancakeswap.finance` 替换为你的后端地址
- 将 `https://assets-cdn.trustwallet.com` 替换为你的后端地址

## 🔍 支持的链

| ChainId | 网络 |
|---------|------|
| 1 | Ethereum |
| 56 | BSC (BNB Chain) |
| 137 | Polygon |
| 250 | Fantom |
| 42161 | Arbitrum One |
| 8453 | Base |
| 59144 | Linea |
| 204 | opBNB |
| 324 | zkSync Era |
| 10 | Optimism |

## 📝 注意事项

1. **缓存时间**: 图标接口默认缓存24小时
2. **文件大小**: 上传限制5MB
3. **图片格式**: 仅支持PNG格式
4. **自动优化**: 上传的图片会自动调整为128x128并压缩
