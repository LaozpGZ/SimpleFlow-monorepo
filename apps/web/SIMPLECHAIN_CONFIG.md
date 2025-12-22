# SimpleChain 前端配置指南

本文档说明如何为 SimpleChain Testnet 配置前端环境。

## 环境变量配置

在 `apps/web/` 目录下创建 `.env.local` 文件，添加以下内容：

```bash
# 禁用后端性能 API (使用客户端路由)
NEXT_PUBLIC_USE_PERFORMANCE_API=false

# Subgraph URL（SimpleChain 无需设置，留空即可）
NEXT_PUBLIC_SUBGRAPH_URL=

# 默认链 ID
# SimpleChain Testnet: 1914
# SimpleChain Mainnet: 1913
NEXT_PUBLIC_CHAIN_ID=1914
```

## K 线图状态

K 线图功能已在代码中禁用。`CHART_SUPPORT_CHAIN_IDS` 数组为空，SimpleChain 默认不支持 K 线图。

文件位置: `src/views/Swap/SwapFeaturesContext.tsx`

## Subgraph 状态

SimpleChain 的 Subgraph 配置已设置为 `null`。

文件位置: `packages/chains/src/subgraphs.ts`

## 已验证的合约地址

所有 V3 合约地址已配置完成，与链上部署一致：

| 合约 | 地址 |
|------|------|
| Factory | `0xac3695E50cDc22941cffcBBE817EF2c7d7ef4AA5` |
| PoolDeployer | `0x9E04B69a17f4Ce1AC05600EF3bEf66eF423E455d` |
| PositionManager | `0x53074FeB375dD50b600c9986180ab90974112284` |
| Quoter | `0xA88cE47B8e9eF10591Be79793ccBA2C9d04866c5` |
| INIT_CODE_HASH | `0x2485b4b8c1eb9eba7259fb706aa57ea101810c610dec7a2c4ec0c47cbc2e9395` |

## 代币地址

| 代币 | 地址 | Decimals |
|------|------|----------|
| WSRW | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 |
| WBTC | `0x770556F853a17893b1187A9754F17c6f57776b7c` | 8 |
| USDT | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 |
| USDC | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 |
| DAI | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 |

## 路由设置

如需强制禁用多跳路由（Multihops），可在前端设置齿轮图标中取消勾选 "Allow Multihops"。

代码位置: `src/components/Menu/GlobalSettings/SettingsModalV2/CustomizeRoutingTab.tsx`

