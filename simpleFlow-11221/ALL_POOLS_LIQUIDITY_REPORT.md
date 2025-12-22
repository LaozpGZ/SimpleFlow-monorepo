# SimpleDex V3 流动性池完整汇总报告

> **报告生成日期**: 2024-12-21  
> **最后验证时间**: 2024-12-23  
> **网络**: SimpleChain Testnet (Chain ID: 1914)  
> **区块浏览器**: https://testnet-explorer.simplechain.com  
> **部署者**: `0x7CB23b51FDDe5678Eef3c222B147c579A5fE562C`
> **验证状态**: ✅ 全部验证通过

---

## 部署概览

| 指标 | 数值 |
|------|------|
| **总池子数量** | 7 个 |
| **已存在池子** | 4 个 (WBTC/USDT, WBTC/USDC, DAI/USDT, DAI/USDC) |
| **新创建池子** | 3 个 (WBTC/WSRW, WSRW/USDT, WSRW/USDC) |
| **涉及代币** | 5 种 (WBTC, WSRW, USDT, USDC, DAI) |
| **原生包装代币** | WSRW |

---

## 1. 核心合约地址

| 合约 | 地址 | 区块浏览器 |
|------|------|-----------|
| **Factory** | `0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5` | [查看](https://testnet-explorer.simplechain.com/address/0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5) |
| **PoolDeployer** | `0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d` | [查看](https://testnet-explorer.simplechain.com/address/0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d) |
| **PositionManager** | `0x53074FeB375dD50b600c9986180ab90974112284` | [查看](https://testnet-explorer.simplechain.com/address/0x53074FeB375dD50b600c9986180ab90974112284) |
| **SwapRouter** | `0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0` | [查看](https://testnet-explorer.simplechain.com/address/0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0) |
| **SmartRouter** | `0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12` | [查看](https://testnet-explorer.simplechain.com/address/0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12) |
| **Quoter** | `0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5` | [查看](https://testnet-explorer.simplechain.com/address/0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5) |
| **QuoterV2** | `0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A` | [查看](https://testnet-explorer.simplechain.com/address/0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A) |
| **TickLens** | `0x64272699d818646781a4fCAa435C98A05b2d9668` | [查看](https://testnet-explorer.simplechain.com/address/0x64272699d818646781a4fCAa435C98A05b2d9668) |
| **Multicall3** | `0xcA11bde05977b3631167028862bE2a173976CA11` | [查看](https://testnet-explorer.simplechain.com/address/0xcA11bde05977b3631167028862bE2a173976CA11) |

### INIT_CODE_HASH

```
0x2485b4b8c1eb9eba7259fb706aa57ea101810c610dec7a2c4ec0c47cbc2e9395
```


NEXT_PUBLIC_PERMIT2=0x339b28A97Cb2311F85B75C375cC0CD7D2F2417d0
PERMIT2=0x339b28A97Cb2311F85B75C375cC0CD7D2F2417d0


---

## 2. 代币信息

| 代币 | 地址 | Decimals | 区块浏览器 |
|------|------|----------|-----------|
| **WSRW** | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 | [查看](https://testnet-explorer.simplechain.com/address/0x22608aC253B934D5078cB0d12f7F7e377b51798b) |
| **WBTC** | `0x770556F853a17893b1187A9754F17c6f57776b7c` | 8 | [查看](https://testnet-explorer.simplechain.com/address/0x770556F853a17893b1187A9754F17c6f57776b7c) |
| **USDT** | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 | [查看](https://testnet-explorer.simplechain.com/address/0x3577E5E0E3A47d9a552426638977ee3EddD4552e) |
| **USDC** | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 | [查看](https://testnet-explorer.simplechain.com/address/0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769) |
| **DAI** | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 | [查看](https://testnet-explorer.simplechain.com/address/0xA16171a7dadfb86afC934eaF16daCD86cD435120) |

---

## 3. 所有流动性池汇总

### 池子总览

| # | 交易对 | Fee | 池子地址 | 状态 | 流动性 | 区块浏览器 |
|---|--------|-----|----------|------|--------|-----------|
| 1 | WBTC/USDT | 2500 (0.25%) | `0x851D390bdA232082C6368Ee1c245F6Eea5eadD62` | ✅ 已验证 | 1.676e10 | [查看](https://testnet-explorer.simplechain.com/address/0x851D390bdA232082C6368Ee1c245F6Eea5eadD62) |
| 2 | WBTC/USDC | 2500 (0.25%) | `0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F` | ✅ 已验证 | 1.676e10 | [查看](https://testnet-explorer.simplechain.com/address/0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F) |
| 3 | DAI/USDT | 100 (0.01%) | `0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad` | ✅ 已验证 | 1.025e13 | [查看](https://testnet-explorer.simplechain.com/address/0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad) |
| 4 | DAI/USDC | 100 (0.01%) | `0x1eaC1C35f06231357F4a61ceb14962735Fa20b57` | ✅ 已验证 | 1.025e13 | [查看](https://testnet-explorer.simplechain.com/address/0x1eaC1C35f06231357F4a61ceb14962735Fa20b57) |
| 5 | WBTC/WSRW | 2500 (0.25%) | `0x74698cde37436b62d60C877D39B5EdB6c9C70a74` | ✅ 已验证 | 58 | [查看](https://testnet-explorer.simplechain.com/address/0x74698cde37436b62d60C877D39B5EdB6c9C70a74) |
| 6 | WSRW/USDT | 2500 (0.25%) | `0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25` | ✅ 已验证 | 8.655e6 | [查看](https://testnet-explorer.simplechain.com/address/0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25) |
| 7 | WSRW/USDC | 2500 (0.25%) | `0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a` | ✅ 已验证 | 8.655e6 | [查看](https://testnet-explorer.simplechain.com/address/0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a) |

---

## 4. 每个池子详细信息

### 4.1 WBTC/USDT 池

| 属性 | 值 |
|------|-----|
| **池子地址** | `0x851D390bdA232082C6368Ee1c245F6Eea5eadD62` |
| **Token0** | USDT (`0x3577E5E0E3A47d9a552426638977ee3EddD4552e`) |
| **Token1** | WBTC (`0x770556F853a17893b1187A9754F17c6f57776b7c`) |
| **Fee** | 2500 (0.25%) |
| **Tick Spacing** | 50 |
| **流动性** | 16,768,725,942 (1.676e10) |
| **状态** | ✅ 已验证 |
| **区块浏览器** | [查看池子](https://testnet-explorer.simplechain.com/address/0x851D390bdA232082C6368Ee1c245F6Eea5eadD62) |

---

### 4.2 WBTC/USDC 池

| 属性 | 值 |
|------|-----|
| **池子地址** | `0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F` |
| **Token0** | WBTC (`0x770556F853a17893b1187A9754F17c6f57776b7c`) |
| **Token1** | USDC (`0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769`) |
| **Fee** | 2500 (0.25%) |
| **Tick Spacing** | 50 |
| **流动性** | 16,764,442,264 (1.676e10) |
| **状态** | ✅ 已验证 |
| **区块浏览器** | [查看池子](https://testnet-explorer.simplechain.com/address/0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F) |

---

### 4.3 DAI/USDT 池 (稳定币)

| 属性 | 值 |
|------|-----|
| **池子地址** | `0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad` |
| **Token0** | USDT (`0x3577E5E0E3A47d9a552426638977ee3EddD4552e`) |
| **Token1** | DAI (`0xA16171a7dadfb86afC934eaF16daCD86cD435120`) |
| **Fee** | 100 (0.01%) |
| **Tick Spacing** | 1 |
| **流动性** | 10,252,583,134,053 (1.025e13) |
| **状态** | ✅ 已验证 |
| **区块浏览器** | [查看池子](https://testnet-explorer.simplechain.com/address/0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad) |

---

### 4.4 DAI/USDC 池 (稳定币)

| 属性 | 值 |
|------|-----|
| **池子地址** | `0x1eaC1C35f06231357F4a61ceb14962735Fa20b57` |
| **Token0** | DAI (`0xA16171a7dadfb86afC934eaF16daCD86cD435120`) |
| **Token1** | USDC (`0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769`) |
| **Fee** | 100 (0.01%) |
| **Tick Spacing** | 1 |
| **流动性** | 10,252,583,134,053 (1.025e13) |
| **状态** | ✅ 已验证 |
| **区块浏览器** | [查看池子](https://testnet-explorer.simplechain.com/address/0x1eaC1C35f06231357F4a61ceb14962735Fa20b57) |

---

### 4.5 WBTC/WSRW 池

| 属性 | 值 |
|------|-----|
| **池子地址** | `0x74698cde37436b62d60C877D39B5EdB6c9C70a74` |
| **Token0** | WSRW (`0x22608aC253B934D5078cB0d12f7F7e377b51798b`) |
| **Token1** | WBTC (`0x770556F853a17893b1187A9754F17c6f57776b7c`) |
| **Fee** | 2500 (0.25%) |
| **Tick Spacing** | 50 |
| **流动性** | 58 |
| **状态** | ✅ 已验证 |
| **区块浏览器** | [查看池子](https://testnet-explorer.simplechain.com/address/0x74698cde37436b62d60C877D39B5EdB6c9C70a74) |

---

### 4.6 WSRW/USDT 池

| 属性 | 值 |
|------|-----|
| **池子地址** | `0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25` |
| **Token0** | WSRW (`0x22608aC253B934D5078cB0d12f7F7e377b51798b`) |
| **Token1** | USDT (`0x3577E5E0E3A47d9a552426638977ee3EddD4552e`) |
| **Fee** | 2500 (0.25%) |
| **Tick Spacing** | 50 |
| **流动性** | 8,655,770 (8.655e6) |
| **状态** | ✅ 已验证 |
| **区块浏览器** | [查看池子](https://testnet-explorer.simplechain.com/address/0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25) |

---

### 4.7 WSRW/USDC 池

| 属性 | 值 |
|------|-----|
| **池子地址** | `0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a` |
| **Token0** | WSRW (`0x22608aC253B934D5078cB0d12f7F7e377b51798b`) |
| **Token1** | USDC (`0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769`) |
| **Fee** | 2500 (0.25%) |
| **Tick Spacing** | 50 |
| **流动性** | 8,655,770 (8.655e6) |
| **状态** | ✅ 已验证 |
| **区块浏览器** | [查看池子](https://testnet-explorer.simplechain.com/address/0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a) |

---

## 5. 费率配置说明

| Fee | 百分比 | Tick Spacing | 适用类型 | 本批次池子 |
|-----|--------|-------------|---------|-----------|
| 100 | 0.01% | 1 | 稳定币对 | DAI/USDT, DAI/USDC |
| 500 | 0.05% | 10 | 低波动性 | - |
| 2500 | 0.25% | 50 | 中等波动性 | WBTC/USDT, WBTC/USDC, WBTC/WSRW, WSRW/USDT, WSRW/USDC |
| 10000 | 1% | 200 | 高波动性 | - |

---

## 6. 地址快速索引

### 6.1 所有池子地址

| # | 交易对 | 池子地址 |
|---|--------|----------|
| 1 | WBTC/USDT | `0x851D390bdA232082C6368Ee1c245F6Eea5eadD62` |
| 2 | WBTC/USDC | `0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F` |
| 3 | DAI/USDT | `0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad` |
| 4 | DAI/USDC | `0x1eaC1C35f06231357F4a61ceb14962735Fa20b57` |
| 5 | WBTC/WSRW | `0x74698cde37436b62d60C877D39B5EdB6c9C70a74` |
| 6 | WSRW/USDT | `0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25` |
| 7 | WSRW/USDC | `0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a` |

### 6.2 所有代币地址

| 代币 | 地址 | Decimals |
|------|------|----------|
| WSRW | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 |
| WBTC | `0x770556F853a17893b1187A9754F17c6f57776b7c` | 8 |
| USDT | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 |
| USDC | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 |
| DAI | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 |

---

## 7. 快速复制区

### 核心合约地址
```
Factory:         0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5
PoolDeployer:    0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d
PositionManager: 0x53074FeB375dD50b600c9986180ab90974112284
SwapRouter:      0x3B3Dedee55A83fb79f2659257b0B55B597D0D3D0
SmartRouter:     0xC4E1763C9F2fa88406f5d8aba0a6d30dfC5F8E12
Quoter:          0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5
QuoterV2:        0x06B24ED37b44719d64d0b564e9FE4a4914B8B64A
TickLens:        0x64272699d818646781a4fCAa435C98A05b2d9668
Multicall3:      0xcA11bde05977b3631167028862bE2a173976CA11
```

### 池子地址 (按顺序)
```
0x851D390bdA232082C6368Ee1c245F6Eea5eadD62
0x2F7444DD0553CEBDAfdAE99f5aC568b3e6cf9d8F
0x44fB7EbEB324915632847Bb0A0EdDFD94A9351ad
0x1eaC1C35f06231357F4a61ceb14962735Fa20b57
0x74698cde37436b62d60C877D39B5EdB6c9C70a74
0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25
0xd716aa0131379B1E88048db7A8e8a3f8f3c3213a
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

## 8. 部署验证清单

- [x] 4 个已存在池子确认
- [x] 3 个新 WSRW 池子创建成功
- [x] 外围合约使用正确的 WSRW 地址
- [x] INIT_CODE_HASH 配置正确
- [x] 所有合约已上链确认
- [x] 所有 7 个池子流动性验证通过
- [x] 所有外围合约 Factory 指向正确

---

## 9. 关键地址确认 (已链上验证)

### WSRW 代币地址
```
0x22608aC253B934D5078cB0d12f7F7e377b51798b
```
- Symbol: WSRW
- Decimals: 18
- 状态: ✅ 已验证

### WSRW/USDT 池子地址
```
0x88ebBc42a8ec9E4438cF9a14672C365e900C3e25
```
- Token0: WSRW (`0x22608aC253B934D5078cB0d12f7F7e377b51798b`)
- Token1: USDT (`0x3577E5E0E3A47d9a552426638977ee3EddD4552e`)
- Fee: 2500 (0.25%)
- 流动性: 8,655,770
- 状态: ✅ 已验证

---

*报告生成时间: 2024-12-21*  
*最后验证时间: 2024-12-23*

