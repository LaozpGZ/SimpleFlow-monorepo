# SimpleDex V3 流动性注入报告

> **报告生成时间**: 2025-12-22 13:30:00  
> **网络**: SimpleChain Testnet (Chain ID: 1914)  
> **区块浏览器**: https://testnet-explorer.simplechain.com  
> **部署者**: `0x7CB23b51FDDe5678Eef3c222B147c579A5fE562C`

---

## 执行摘要

| 指标 | 数值 |
|------|------|
| **总池子数量** | 7 |
| **正常运行** | 7 ✅ |
| **无流动性** | 0 ⚠️ |
| **未初始化** | 0 ❌ |
| **WSRW 使用量** | 50/60 (实际注入 50 WSRW，保留 14 WSRW) |

---

## 池子状态详情

| # | 交易对 | Fee | 池子地址 | 状态 | Liquidity | 注入量 |
|---|--------|-----|----------|------|-----------|--------|
| 1 | WBTC/USDT | 0.25% | [`0x851D...dD62`](https://testnet-explorer.simplechain.com/address/0x851D390bdA232082C6368Ee1c245F6Eea5eadD62) | ✅ OK | 16,768,725,942 | 0.01 WBTC + 888 USDT |
| 2 | WBTC/USDC | 0.25% | [`0x2F74...9d8F`](https://testnet-explorer.simplechain.com/address/0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F) | ✅ OK | 16,764,442,264 | 0.01 WBTC + 888 USDC |
| 3 | DAI/USDT | 0.01% | [`0x44fB...51ad`](https://testnet-explorer.simplechain.com/address/0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad) | ✅ OK | 10,252,583,134,053 | 500 DAI + 500 USDT |
| 4 | DAI/USDC | 0.01% | [`0x1eaC...0b57`](https://testnet-explorer.simplechain.com/address/0x1eaC1C35f06231357F4a61ceb14962735Fa20b57) | ✅ OK | 10,252,583,134,053 | 500 DAI + 500 USDC |
| 5 | WBTC/WSRW | 0.25% | [`0x7469...0a74`](https://testnet-explorer.simplechain.com/address/0x74698cde37436b62d60C877D39B5EdB6c9C70a74) | ⚠️ 低 | 58 | 之前已有少量 |
| 6 | WSRW/USDT | 0.25% | [`0x88eb...3e25`](https://testnet-explorer.simplechain.com/address/0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25) | ✅ OK | 8,655,770 | 25 WSRW + 2,500 USDT |
| 7 | WSRW/USDC | 0.25% | [`0xd716...213a`](https://testnet-explorer.simplechain.com/address/0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a) | ✅ OK | 8,655,770 | 25 WSRW + 2,500 USDC |

---

## NFT 头寸创建记录

| 池子 | NFT ID | Liquidity | Token0 实际量 | Token1 实际量 |
|------|--------|-----------|---------------|---------------|
| WSRW/USDT | #8 | 43,278,852 | 24.99 WSRW | 1 USDT |
| WSRW/USDC | #9 | 43,278,852 | 24.99 WSRW | 1 USDC |
| WBTC/USDT | #10 | 29,781,257 | 888 USDT | 0.00998 WBTC |
| WBTC/USDC | #11 | 29,795,205 | 0.00999 WBTC | 888 USDC |
| DAI/USDT | #12 | 500,000,000 | 500 USDT | 500 DAI |
| DAI/USDC | #13 | 500,000,000 | 500 DAI | 500 USDC |

---

## 核心合约地址

| 合约 | 地址 | 用途 |
|------|------|------|
| **Factory** | [`0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5`](https://testnet-explorer.simplechain.com/address/0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5) | 池子工厂 |
| **PositionManager** | [`0x53074FeB375dD50b600c9986180ab90974112284`](https://testnet-explorer.simplechain.com/address/0x53074FeB375dD50b600c9986180ab90974112284) | NFT 头寸管理 |
| **SwapRouter** | [`0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0`](https://testnet-explorer.simplechain.com/address/0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0) | 交易路由 |
| **SmartRouter** | [`0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12`](https://testnet-explorer.simplechain.com/address/0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12) | 智能路由 |
| **Quoter** | [`0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5`](https://testnet-explorer.simplechain.com/address/0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5) | 报价查询 |
| **QuoterV2** | [`0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A`](https://testnet-explorer.simplechain.com/address/0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A) | 报价查询V2 |

---

## 代币地址

| 代币 | 地址 | Decimals |
|------|------|----------|
| **WSRW** | [`0x22608aC253B934D5078cB0d12f7F7e377b51798b`](https://testnet-explorer.simplechain.com/address/0x22608aC253B934D5078cB0d12f7F7e377b51798b) | 18 |
| **WBTC** | [`0x770556F853a17893b1187A9754F17c6f57776b7c`](https://testnet-explorer.simplechain.com/address/0x770556F853a17893b1187A9754F17c6f57776b7c) | 8 |
| **USDT** | [`0x3577E5E0E3A47d9a552426638977ee3EddD4552e`](https://testnet-explorer.simplechain.com/address/0x3577E5E0E3A47d9a552426638977ee3EddD4552e) | 6 |
| **USDC** | [`0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769`](https://testnet-explorer.simplechain.com/address/0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769) | 6 |
| **DAI** | [`0xA16171a7dadfb86afC934eaF16daCD86cD435120`](https://testnet-explorer.simplechain.com/address/0xA16171a7dadfb86afC934eaF16daCD86cD435120) | 18 |

---

## 代币余额变化

| 代币 | 注入前 | 注入后 | 消耗 |
|------|--------|--------|------|
| WSRW | 64 | 14 | 50 |
| WBTC | 982.12 | 980.10 | ~0.02 |
| USDT | 8,014,034 | 8,012,646 | ~1,388 |
| USDC | 8,575,397 | 8,574,009 | ~1,388 |
| DAI | 10,099,999 | 10,099,999 | ~0 (已有) |

---

## 快速复制区

### 池子地址
```
WBTC/USDT: 0x851D390bdA232082C6368Ee1c245F6Eea5eadD62
WBTC/USDC: 0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F
DAI/USDT:  0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad
DAI/USDC:  0x1eaC1C35f06231357F4a61ceb14962735Fa20b57
WBTC/WSRW: 0x74698cde37436b62d60C877D39B5EdB6c9C70a74
WSRW/USDT: 0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25
WSRW/USDC: 0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a
```

### 代币地址
```
WSRW: 0x22608aC253B934D5078cB0d12f7F7e377b51798b
WBTC: 0x770556F853a17893b1187A9754F17c6f57776b7c
USDT: 0x3577E5E0E3A47d9a552426638977ee3EddD4552e
USDC: 0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769
DAI:  0xA16171a7dadfb86afC934eaF16daCD86cD435120
```

---

## TypeScript 配置

```typescript
export const SIMPLEDEX_V3_CONFIG = {
  chainId: 1914,
  chainName: "SimpleChain Testnet",
  rpcUrl: "https://testnet-rpc.simplechain.com",
  explorerUrl: "https://testnet-explorer.simplechain.com",
  
  // 核心合约
  factory: "0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5",
  positionManager: "0x53074FeB375dD50b600c9986180ab90974112284",
  swapRouter: "0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0",
  smartRouter: "0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12",
  quoter: "0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5",
  quoterV2: "0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A",
};

export const POOLS = {
  'WBTC/USDT': { address: '0x851D390bdA232082C6368Ee1c245F6Eea5eadD62', fee: 2500 },
  'WBTC/USDC': { address: '0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F', fee: 2500 },
  'DAI/USDT': { address: '0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad', fee: 100 },
  'DAI/USDC': { address: '0x1eaC1C35f06231357F4a61ceb14962735Fa20b57', fee: 100 },
  'WBTC/WSRW': { address: '0x74698cde37436b62d60C877D39B5EdB6c9C70a74', fee: 2500 },
  'WSRW/USDT': { address: '0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25', fee: 2500 },
  'WSRW/USDC': { address: '0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a', fee: 2500 },
};

export const TOKENS = {
  WSRW: { address: '0x22608aC253B934D5078cB0d12f7F7e377b51798b', decimals: 18, symbol: 'WSRW' },
  WBTC: { address: '0x770556F853a17893b1187A9754F17c6f57776b7c', decimals: 8, symbol: 'WBTC' },
  USDT: { address: '0x3577E5E0E3A47d9a552426638977ee3EddD4552e', decimals: 6, symbol: 'USDT' },
  USDC: { address: '0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769', decimals: 6, symbol: 'USDC' },
  DAI: { address: '0xA16171a7dadfb86afC934eaF16daCD86cD435120', decimals: 18, symbol: 'DAI' },
};
```

---

## 注意事项

1. **WBTC/WSRW 池流动性较低** (Liquidity: 58)，可能需要后续补充
2. **Fee Tier 重要**: 前端查询路由时必须使用正确的 fee tier (2500 = 0.25%, 100 = 0.01%)
3. **WSRW 余额**: 当前剩余 14 WSRW，已满足保留 20 个的要求（包含原有的 4 个）

---

*报告生成时间: 2025-12-22 13:30:00*  
*由 AddAllPoolsLiquidity.s.sol 和 generate-liquidity-report.sh 自动生成*
