[根目录](../../CLAUDE.md) > [packages](../) > **farms**

---

# packages/farms - 农场逻辑包

> 最后更新：2025-12-24 19:19:46

## 变更记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-12-24 19:19:46 | 初始化 | 首次创建模块文档 |

---

## 模块职责

`@pancakeswap/farms` 负责 PancakeSwap 农场数据获取和计算逻辑。

**核心功能：**
- V2 农场数据获取和计算
- V3 农场数据获取和计算
- Universal Farms（统一农场）
- APR（年化收益率）计算
- 农场价格计算
- 多链农场支持

---

## 入口与启动

### 包信息

```json
{
  "name": "@pancakeswap/farms",
  "version": "1.3.0",
  "private": true
}
```

### 构建命令

```bash
# 构建
pnpm --filter @pancakeswap/farms build

# 测试
pnpm --filter @pancakeswap/farms test
```

---

## 对外接口

### 主要导出

```typescript
// V2 农场
export * from './v2/fetchFarmsV2'
export * from './v2/fetchPublicFarmData'
export * from './v2/farmPrices'

// V3 农场
export * from './fetchFarmsV3'
export * from './fetchUniversalFarms'

// 农场配置
export * from './defineFarmV3Configs'
export * from './getLegacyFarmConfig'

// APR 计算
export * from './apr'

// 工具函数
export * from './utils'
```

---

## 关键依赖与配置

### 依赖

```json
{
  "dependencies": {
    "@pancakeswap/price-api-sdk": "workspace:*",
    "@pancakeswap/chains": "workspace:*",
    "@pancakeswap/sdk": "workspace:*",
    "@pancakeswap/stable-swap-sdk": "workspace:*",
    "@pancakeswap/swap-sdk-core": "workspace:*",
    "@pancakeswap/token-lists": "workspace:*",
    "@pancakeswap/tokens": "workspace:*",
    "@pancakeswap/utils": "workspace:*",
    "@pancakeswap/v3-sdk": "workspace:*",
    "bignumber.js": "^9.0.0",
    "dayjs": "^1.11.10",
    "viem": "catalog:"
  }
}
```

---

## 数据模型

### 文件结构

```
packages/farms/src/
├── v2/                    # V2 农场
│   ├── fetchFarmsV2.ts
│   ├── fetchPublicFarmData.ts
│   ├── farmPrices.ts
│   ├── filterFarmsByQuery.ts
│   ├── locators.ts
│   ├── deserializeFarm.ts
│   └── ...
├── farms/                 # 农场配置（按链）
│   ├── eth.ts
│   ├── bsc.ts
│   ├── bscTestnet.ts
│   ├── arb.ts
│   ├── polygonZkEVM.ts
│   ├── linea.ts
│   ├── base.ts
│   ├── zkSync.ts
│   ├── opBNB.ts
│   ├── opBnbTestnet.ts
│   └── ...
├── constants/             # 常量
│   ├── v3/
│   │   └── index.ts
│   └── common/
│       └── index.ts
├── defineFarmV3Configs.ts # V3 农场配置定义
├── fetchFarmsV3.ts        # V3 农场获取
├── fetchUniversalFarms.ts # Universal 农场获取
├── apr.ts                 # APR 计算
├── types.ts               # 类型定义
├── utils.ts               # 工具函数
└── scripts/
    └── build.ts           # 构建脚本
```

### 核心类型

```typescript
// V2 农场
interface Farm {
  pid: number
  lpAddress: string
  token: Token
  quoteToken: Token
  earningToken: Token
  lpSymbol: string
  lpTotalSupply: JSBI
  lpTotalInQuoteToken: JSBI
  tokenAmount: JSBI
  quoteTokenAmount: JSBI
  quoteTokenPriceUsd: number
  earningsValue: number
  apr: number
}

// V3 农场
interface V3Farm {
  pool: Pool
  rewardToken: Token
  rewardTokenPrice: number
  rewardPerSecond: JSBI
  totalStaked: JSBI
  apr: number
}
```

---

## 测试与质量

### 测试

- `fetchFarmsV3.test.ts` - V3 农场测试
- `index.test.ts` - 主测试文件

### 测试命令

```bash
# 运行测试
pnpm --filter @pancakeswap/farms test

# 更新快照
pnpm --filter @pancakeswap/farms update:snapshot
```

---

## 常见问题 (FAQ)

### Q: V2 和 V3 农场有什么区别？

A:
- **V2 农场**：基于 LP 代币质押，奖励基于 LP 份额
- **V3 农场**：基于 NFT 头寸质押，可以精确控制价格区间

### Q: APR 如何计算？

A: APR 计算考虑以下因素：
1. 代币价格
2. 奖励代币发行速度
3. 总质押量
4. 池子手续费收益（如有）

计算逻辑在 `apr.ts` 中。

### Q: 如何添加新链的农场？

A:
1. 在 `src/farms/` 创建新链配置文件（如 `solana.ts`）
2. 实现农场配置数组
3. 在 `src/farms/index.ts` 中导出

### Q: 农场数据从哪里获取？

A:
- **V2**：通过子图（GraphQL）获取
- **V3**：通过 multicall 获取链上数据
- **价格**：通过 `@pancakeswap/price-api-sdk` 获取

---

## 相关文件清单

### 核心文件

- `src/v2/fetchFarmsV2.ts` - V2 农场获取
- `src/fetchFarmsV3.ts` - V3 农场获取
- `src/apr.ts` - APR 计算
- `src/types.ts` - 类型定义

### 配置文件

- `src/farms/bsc.ts` - BSC 农场配置
- `src/constants/v3/index.ts` - V3 常量

---

*本模块文档由 AI 架构师生成。*
