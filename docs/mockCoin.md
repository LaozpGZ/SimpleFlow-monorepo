# Simplechain MockCoin 代币配置

> 适用于 SimpleChain Mainnet (ChainId: 1913) 和 SimpleChain Testnet (ChainId: 1914)

## 1. 稳定币（MockERC20，公开 mint）

| 代币 | 地址 | 精度 | 代码引用 |
|------|------|------|----------|
| USDT | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 | `simplechainTokens.usdt` |
| USDC | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 | `simplechainTokens.usdc` |
| DAI | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 | `simplechainTokens.dai` |

## 2. 包装代币（MockERC20，公开 mint）

| 代币 | 地址 | 精度 | 代码引用 |
|------|------|------|----------|
| WBTC | `0xc48DC2507A162E2Ab63e12055CA5C79cf9b19BF2` | 8 | `simplechainTokens.wbtc` |
| WETH | `0x9F19e7749ceE12d56488C394556D52C89d68258A` | 18 | `simplechainTokens.mockWeth` |
| WSOL | `0xbB0543b26A291648D67B91a8A0f150f6122FEd03` | 9 | `simplechainTokens.wsol` |

## 3. 测试代币（MockERC20，公开 mint）

| 代币 | 地址 | 精度 | 代码引用 |
|------|------|------|----------|
| TEST1 | `0x31bbA26B33F6B15359876C86D06AC0848C6C2C29` | 18 | `simplechainTokens.test1` |
| TEST2 | `0x2Ef1e4Ff5e4866F7F5989d12cAbaCbB2Ac37909C` | 18 | `simplechainTokens.test2` |
| TEST3 | `0xefB66bFEEe4c72ca55001bcB6e4542B1d087E856` | 18 | `simplechainTokens.test3` |
| TEST4 | `0x86b330E5D253D2eEAE9316ecc2e62322B90eF809` | 18 | `simplechainTokens.test4` |

## 4. 特殊代币

| 代币 | 地址 | 精度 | 说明 | 代码引用 |
|------|------|------|------|----------|
| WSRW | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 | 需要 deposit 原生 SRW | `simplechainTokens.wsrw` |
| SDX | `0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75` | 18 | 不能 mint，只有 MasterChef 可以 | `simplechainTokens.sdx` |

## 代码配置文件

- **Mainnet**: `packages/tokens/src/constants/simplechain.ts`
- **Testnet**: `packages/tokens/src/constants/simplechainTestnet.ts`

## 兼容性别名

为兼容旧代码，以下别名指向相同地址：
- `wmon`, `weth` → WSRW (包装原生代币)
- `busd`, `ausd` → USDC
- `usdt0` → USDT