# SimpleChain Testnet 代币列表配置变更报告

> 报告日期: 2024-12-22
> 
> 网络: SimpleChain Testnet (Chain ID: 1914)

---

## 📋 变更概述

本次变更为 SimpleChain Testnet 添加了完整的代币列表配置，使白名单中的 7 个认证代币能够在前端正确显示和使用。

---

## 📁 变更的文件

### 1. `apps/web/src/config/constants/lists.ts`

#### 变更内容

| 行号 | 变更类型 | 内容 |
|------|----------|------|
| 21 | 新增 | `export const PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT = ''` |
| 40 | 新增 | `const SIMPLECHAIN_TESTNET_URLS = [PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT]` |
| 71 | 新增 | `...SIMPLECHAIN_TESTNET_URLS,` (在 DEFAULT_LIST_OF_LISTS 中) |
| 105 | 新增 | `[ChainId.SIMPLECHAIN_TESTNET]: SIMPLECHAIN_TESTNET_URLS,` (在 MULTI_CHAIN_LIST_URLS 中) |

#### 变更详情

**添加 1: 代币列表 URL 常量**
```typescript
// 第 21 行
export const PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT = ''
```
- **作用**: 定义 SimpleChain Testnet 的官方代币列表 URL
- **说明**: 当前设为空字符串，表示使用内置代币定义而非远程 JSON 文件
- **后续**: 如果托管了远程代币列表 JSON，可以更新此 URL

**添加 2: URL 数组**
```typescript
// 第 40 行
const SIMPLECHAIN_TESTNET_URLS = [PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT]
```
- **作用**: 创建 SimpleChain Testnet 的代币列表 URL 数组
- **说明**: 遵循项目现有模式，每条链都有一个 URL 数组

**添加 3: 默认列表配置**
```typescript
// 第 71 行 (在 DEFAULT_LIST_OF_LISTS 数组中)
...SIMPLECHAIN_TESTNET_URLS,
```
- **作用**: 将 SimpleChain Testnet 代币列表注册到默认加载列表中
- **影响**: 应用启动时会尝试加载此链的代币列表

**添加 4: 多链映射配置**
```typescript
// 第 105 行 (在 MULTI_CHAIN_LIST_URLS 对象中)
[ChainId.SIMPLECHAIN_TESTNET]: SIMPLECHAIN_TESTNET_URLS,
```
- **作用**: 建立 ChainId 与代币列表 URL 的映射关系
- **影响**: 当用户切换到 SimpleChain Testnet 时，系统知道从哪里获取代币数据

---

### 2. `apps/web/src/config/constants/tokenLists/pancake-simplechain-testnet.tokenlist.json` (新建)

#### 文件内容

```json
{
  "name": "SimpleChain Testnet Default",
  "timestamp": "2024-12-22T00:00:00Z",
  "version": { "major": 1, "minor": 0, "patch": 0 },
  "tags": {},
  "logoURI": "https://pancakeswap.finance/logo.png",
  "keywords": ["simplechain", "testnet", "default"],
  "tokens": [
    { "name": "Wrapped SRW", "symbol": "WSRW", "address": "0x22608aC253B934D5078cB0d12f7F7e377b51798b", "chainId": 1914, "decimals": 18 },
    { "name": "Wrapped Bitcoin", "symbol": "WBTC", "address": "0x770556F853a17893b1187A9754F17c6f57776b7c", "chainId": 1914, "decimals": 8 },
    { "name": "Tether USD", "symbol": "USDT", "address": "0x3577E5E0E3A47d9a552426638977ee3EddD4552e", "chainId": 1914, "decimals": 6 },
    { "name": "USD Coin", "symbol": "USDC", "address": "0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769", "chainId": 1914, "decimals": 6 },
    { "name": "Dai Stablecoin", "symbol": "DAI", "address": "0xA16171a7dadfb86afC934eaF16daCD86cD435120", "chainId": 1914, "decimals": 18 },
    { "name": "SimpleDex Token", "symbol": "SDX", "address": "0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75", "chainId": 1914, "decimals": 18 },
    { "name": "Wrapped Solana", "symbol": "WSOL", "address": "0xbB0543b26A291648D67B91a8A0f150f6122FEd03", "chainId": 1914, "decimals": 18 }
  ]
}
```

#### 作用

- **标准化格式**: 遵循 [Uniswap Token Lists](https://tokenlists.org/) 标准
- **本地备份**: 作为代币信息的本地参考文件
- **可扩展性**: 未来可托管到服务器并更新 `PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT` URL

---

## 🔗 与现有配置的关系

### 已存在的配置 (无需修改)

| 文件 | 配置项 | 状态 |
|------|--------|------|
| `packages/tokens/src/constants/simplechainTestnet.ts` | 7 个代币的 ERC20Token 实例 | ✅ 已配置 |
| `packages/tokens/src/allTokens.ts` | simplechainTestnetTokens 导出 | ✅ 已配置 |
| `apps/web/src/config/constants/exchange.ts` | SUGGESTED_BASES | ✅ 已配置 |
| `apps/web/src/config/constants/exchange.ts` | BASES_TO_TRACK_LIQUIDITY_FOR | ✅ 已配置 |
| `apps/web/src/config/constants/exchange.ts` | PINNED_PAIRS | ✅ 已配置 |
| `apps/web/src/config/chains.ts` | simplechainTestnet 链定义 | ✅ 已配置 |

### 本次新增的配置

| 文件 | 配置项 | 状态 |
|------|--------|------|
| `apps/web/src/config/constants/lists.ts` | PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT | ✅ 新增 |
| `apps/web/src/config/constants/lists.ts` | SIMPLECHAIN_TESTNET_URLS | ✅ 新增 |
| `apps/web/src/config/constants/lists.ts` | DEFAULT_LIST_OF_LISTS 条目 | ✅ 新增 |
| `apps/web/src/config/constants/lists.ts` | MULTI_CHAIN_LIST_URLS 条目 | ✅ 新增 |
| `apps/web/src/config/constants/tokenLists/` | pancake-simplechain-testnet.tokenlist.json | ✅ 新建 |

---

## 🎯 配置作用说明

### 代币列表系统工作流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                         用户切换到 SimpleChain Testnet               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MULTI_CHAIN_LIST_URLS[ChainId.SIMPLECHAIN_TESTNET]                 │
│  → 获取该链对应的代币列表 URL 数组                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  从 URL 加载代币列表 JSON (如果 URL 为空则使用内置代币)                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  代币选择器 / Swap 页面显示可用代币                                   │
│  用户可以搜索和选择 WSRW, WBTC, USDT, USDC, DAI, SDX, WSOL          │
└─────────────────────────────────────────────────────────────────────┘
```

### 各配置项的具体作用

| 配置项 | 作用 | 影响范围 |
|--------|------|----------|
| `PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT` | 定义官方代币列表来源 | 代币列表加载 |
| `SIMPLECHAIN_TESTNET_URLS` | 该链所有代币列表来源的集合 | 多来源代币聚合 |
| `DEFAULT_LIST_OF_LISTS` | 应用启动时预加载的列表 | 初始化性能 |
| `MULTI_CHAIN_LIST_URLS` | 链 ID 到列表 URL 的映射 | 链切换时的代币加载 |

---

## 📊 白名单代币汇总

| Symbol | Name | Address | Decimals |
|--------|------|---------|----------|
| WSRW | Wrapped SRW | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 |
| WBTC | Wrapped Bitcoin | `0x770556F853a17893b1187A9754F17c6f57776b7c` | 8 |
| USDT | Tether USD | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 |
| USDC | USD Coin | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 |
| DAI | Dai Stablecoin | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 |
| SDX | SimpleDex Token | `0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75` | 18 |
| WSOL | Wrapped Solana | `0xbB0543b26A291648D67B91a8A0f150f6122FEd03` | 18 |

---

## ✅ 变更验证

- [x] `lists.ts` 无 TypeScript/ESLint 错误
- [x] JSON 文件格式正确
- [x] 代币地址与白名单文档一致
- [x] Decimals 值与合约部署一致

---

## 📝 后续建议

1. **托管代币列表**: 可将 JSON 文件托管到 CDN 并更新 `PANCAKE_SIMPLECHAIN_TESTNET_DEFAULT` URL
2. **添加代币图标**: 为每个代币添加 `logoURI` 字段以显示图标
3. **测试验证**: 在前端测试代币选择器是否正确显示所有代币

---

*报告生成时间: 2024-12-22*

