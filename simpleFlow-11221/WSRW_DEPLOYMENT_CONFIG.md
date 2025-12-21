# SimpleDex V3 WSRW 部署配置

> **更新日期**: 2024-12-21  
> **网络**: SimpleChain Testnet (Chain ID: 1914)  
> **WSRW 地址**: `0x22608aC253B934D5078cB0d12f7F7e377b51798b`

---

## 1. 网络配置

| 配置项 | 值 |
|--------|-----|
| 网络名称 | SimpleChain Testnet |
| Chain ID | 1914 |
| RPC URL | https://testnet-rpc.simplechain.com |
| 区块浏览器 | https://testnet-explorer.simplechain.com |
| 原生代币 | SRW |

---

## 2. 核心合约地址

| 合约 | 地址 |
|------|------|
| **SimpleDexV3Factory** | `0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5` |
| **SimpleDexV3PoolDeployer** | `0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d` |
| **INIT_CODE_HASH** | `0x2485b4b8c1eb9eba7259fb706aa57ea101810c610dec7a2c4ec0c47cbc2e9395` |

---

## 3. 外围合约地址（使用 WSRW 重新部署）

| 合约 | 地址 |
|------|------|
| **NonfungiblePositionManager** | `0x53074FeB375dD50b600c9986180ab90974112284` |
| **SwapRouter** | `0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0` |
| **Quoter** | `0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5` |
| **QuoterV2** | `0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A` |
| **TickLens** | `0x64272699d818646781a4fCAa435C98A05b2d9668` |
| **NFTDescriptorEx** | `0x1cAe3DBF42C78d0f6EaEDE9af986da51817af816` |
| **NFTPositionDescriptor** | `0x8153cC97E0abCC61E67C27Ed89D79609a138b029` |

---

## 4. 其他合约

| 合约 | 地址 |
|------|------|
| **SmartRouter** | `0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12` |
| **SmartRouterHelper** | `0xc0E9a1b48B45940FE09964f2cc5d77F2fDb3BC30` |
| **MixedRouteQuoterV1** | `0x57e0F9E6B1c5996a2C6f6fCD35E1698910fB8AfF` |
| **Multicall3** | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| **InterfaceMulticallV2** | `0xC005b39086AF12248eA2507C22b0e38f0463a79b` |

---

## 5. 代币地址

| 代币 | 地址 | Decimals |
|------|------|----------|
| **WSRW** | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 |
| **WBTC** | `0x770556F853a17893b1187A9754F17c6f57776b7c` | 8 |
| **USDT** | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 |
| **USDC** | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 |
| **DAI** | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 |

---

## 6. WSRW 池子地址

| 交易对 | Fee | 池子地址 |
|--------|-----|----------|
| **WBTC/WSRW** | 2500 (0.25%) | `0x74698cde37436b62d60C877D39B5EdB6c9C70a74` |
| **WSRW/USDT** | 2500 (0.25%) | `0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25` |
| **WSRW/USDC** | 2500 (0.25%) | `0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a` |

---

## 7. 旧池子地址（参考）

| 交易对 | Fee | 池子地址 |
|--------|-----|----------|
| WBTC/USDT | 2500 | `0x851D390bdA232082C6368Ee1c245F6Eea5eadD62` |
| WBTC/USDC | 2500 | `0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F` |
| DAI/USDT | 100 | `0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad` |
| DAI/USDC | 100 | `0x1eaC1C35f06231357F4a61ceb14962735Fa20b57` |

---

## 8. 环境变量配置 (.env)

```bash
# ============================================
# SimpleDex V3 - WSRW 配置
# Network: SimpleChain Testnet (Chain ID: 1914)
# Updated: 2024-12-21
# ============================================

# Network
NEXT_PUBLIC_CHAIN_ID=1914
NEXT_PUBLIC_CHAIN_NAME="SimpleChain Testnet"
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.simplechain.com
NEXT_PUBLIC_EXPLORER_URL=https://testnet-explorer.simplechain.com

# V3 Core
NEXT_PUBLIC_V3_FACTORY=0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5
NEXT_PUBLIC_V3_POOL_DEPLOYER=0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d
NEXT_PUBLIC_INIT_CODE_HASH=0x2485b4b8c1eb9eba7259fb706aa57ea101810c610dec7a2c4ec0c47cbc2e9395

# V3 Periphery (WSRW 版本)
NEXT_PUBLIC_POSITION_MANAGER=0x53074FeB375dD50b600c9986180ab90974112284
NEXT_PUBLIC_SWAP_ROUTER=0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0
NEXT_PUBLIC_QUOTER=0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5
NEXT_PUBLIC_QUOTER_V2=0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A
NEXT_PUBLIC_TICK_LENS=0x64272699d818646781a4fCAa435C98A05b2d9668

# Smart Router
NEXT_PUBLIC_SMART_ROUTER=0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12

# Multicall
NEXT_PUBLIC_MULTICALL3=0xcA11bde05977b3631167028862bE2a173976CA11
NEXT_PUBLIC_INTERFACE_MULTICALL_V2=0xC005b39086AF12248eA2507C22b0e38f0463a79b

# 代币
NEXT_PUBLIC_WSRW=0x22608aC253B934D5078cB0d12f7F7e377b51798b
NEXT_PUBLIC_WBTC=0x770556F853a17893b1187A9754F17c6f57776b7c
NEXT_PUBLIC_USDT=0x3577E5E0E3A47d9a552426638977ee3EddD4552e
NEXT_PUBLIC_USDC=0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769
NEXT_PUBLIC_DAI=0xA16171a7dadfb86afC934eaF16daCD86cD435120

# WSRW 池子
NEXT_PUBLIC_POOL_WBTC_WSRW=0x74698cde37436b62d60C877D39B5EdB6c9C70a74
NEXT_PUBLIC_POOL_WSRW_USDT=0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25
NEXT_PUBLIC_POOL_WSRW_USDC=0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a
```

---

## 9. TypeScript 配置对象

```typescript
export const SIMPLEDEX_V3_CONFIG = {
  chainId: 1914,
  chainName: "SimpleChain Testnet",
  rpcUrl: "https://testnet-rpc.simplechain.com",
  explorerUrl: "https://testnet-explorer.simplechain.com",
  
  // 核心合约
  factory: "0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5",
  poolDeployer: "0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d",
  initCodeHash: "0x2485b4b8c1eb9eba7259fb706aa57ea101810c610dec7a2c4ec0c47cbc2e9395",
  
  // 外围合约 (WSRW 版本)
  positionManager: "0x53074FeB375dD50b600c9986180ab90974112284",
  swapRouter: "0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0",
  quoter: "0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5",
  quoterV2: "0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A",
  tickLens: "0x64272699d818646781a4fCAa435C98A05b2d9668",
  
  // 其他合约
  smartRouter: "0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12",
  multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
  interfaceMulticallV2: "0xC005b39086AF12248eA2507C22b0e38f0463a79b",
};

export const TOKENS = {
  WSRW: {
    address: "0x22608aC253B934D5078cB0d12f7F7e377b51798b",
    decimals: 18,
    symbol: "WSRW",
    name: "Wrapped SRW",
  },
  WBTC: {
    address: "0x770556F853a17893b1187A9754F17c6f57776b7c",
    decimals: 8,
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
  },
  USDT: {
    address: "0x3577E5E0E3A47d9a552426638977ee3EddD4552e",
    decimals: 6,
    symbol: "USDT",
    name: "Tether USD",
  },
  USDC: {
    address: "0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
  },
  DAI: {
    address: "0xA16171a7dadfb86afC934eaF16daCD86cD435120",
    decimals: 18,
    symbol: "DAI",
    name: "Dai Stablecoin",
  },
};

export const WSRW_POOLS = {
  "WBTC/WSRW": {
    address: "0x74698cde37436b62d60C877D39B5EdB6c9C70a74",
    token0: TOKENS.WSRW,
    token1: TOKENS.WBTC,
    fee: 2500,
  },
  "WSRW/USDT": {
    address: "0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25",
    token0: TOKENS.WSRW,
    token1: TOKENS.USDT,
    fee: 2500,
  },
  "WSRW/USDC": {
    address: "0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a",
    token0: TOKENS.WSRW,
    token1: TOKENS.USDC,
    fee: 2500,
  },
};
```

---

## 10. 快速复制区

### 核心合约
```
Factory:      0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5
PoolDeployer: 0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d
```

### 外围合约 (WSRW)
```
PositionManager: 0x53074FeB375dD50b600c9986180ab90974112284
SwapRouter:      0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0
Quoter:          0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5
QuoterV2:        0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A
TickLens:        0x64272699d818646781a4fCAa435C98A05b2d9668
```

### 代币
```
WSRW: 0x22608aC253B934D5078cB0d12f7F7e377b51798b
WBTC: 0x770556F853a17893b1187A9754F17c6f57776b7c
USDT: 0x3577E5E0E3A47d9a552426638977ee3EddD4552e
USDC: 0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769
DAI:  0xA16171a7dadfb86afC934eaF16daCD86cD435120
```

### WSRW 池子
```
WBTC/WSRW: 0x74698cde37436b62d60C877D39B5EdB6c9C70a74
WSRW/USDT: 0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25
WSRW/USDC: 0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a
```

---

*生成时间: 2024-12-21*

