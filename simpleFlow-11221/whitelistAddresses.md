# SimpleDex V3 白名单地址

> 网络: SimpleChain Testnet (Chain ID: 1914)

---

## 📋 JSON 格式

### 代币白名单 (Tokens)

```json
{
  "tokens": [
    {
      "symbol": "WSRW",
      "address": "0x22608aC253B934D5078cB0d12f7F7e377b51798b",
      "decimals": 18
    },
    {
      "symbol": "WBTC",
      "address": "0x770556F853a17893b1187A9754F17c6f57776b7c",
      "decimals": 8
    },
    {
      "symbol": "USDT",
      "address": "0x3577E5E0E3A47d9a552426638977ee3EddD4552e",
      "decimals": 6
    },
    {
      "symbol": "USDC",
      "address": "0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769",
      "decimals": 6
    },
    {
      "symbol": "DAI",
      "address": "0xA16171a7dadfb86afC934eaF16daCD86cD435120",
      "decimals": 18
    },
    {
      "symbol": "SDX",
      "address": "0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75",
      "decimals": 18
    },
    {
      "symbol": "WSOL",
      "address": "0xbB0543b26A291648D67B91a8A0f150f6122FEd03",
      "decimals": 18
    }
  ]
}
```

### 测试账户白名单 (Test Accounts)

```json
{
  "testAccounts": [
    {
      "name": "test1",
      "address": "0x31bbA26B33F6B15359876C86D06AC0848C6C2C29"
    },
    {
      "name": "test2",
      "address": "0x2Ef1e4Ff5e4866F7F5989d12cAbaCbB2Ac37909C"
    },
    {
      "name": "test3",
      "address": "0xefB66bFEEe4c72ca55001bcB6e4542B1d087E856"
    },
    {
      "name": "test4",
      "address": "0x86b330E5D253D2eEAE9316ecc2e62322B90eF809"
    }
  ]
}
```

### 完整白名单配置

```json
{
  "network": "simplechain-testnet",
  "chainId": 1914,
  "whitelistedTokens": [
    "0x22608aC253B934D5078cB0d12f7F7e377b51798b",
    "0x770556F853a17893b1187A9754F17c6f57776b7c",
    "0x3577E5E0E3A47d9a552426638977ee3EddD4552e",
    "0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769",
    "0xA16171a7dadfb86afC934eaF16daCD86cD435120",
    "0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75",
    "0xbB0543b26A291648D67B91a8A0f150f6122FEd03"
  ],
  "whitelistedAccounts": [
    "0x31bbA26B33F6B15359876C86D06AC0848C6C2C29",
    "0x2Ef1e4Ff5e4866F7F5989d12cAbaCbB2Ac37909C",
    "0xefB66bFEEe4c72ca55001bcB6e4542B1d087E856",
    "0x86b330E5D253D2eEAE9316ecc2e62322B90eF809"
  ]
}
```

---

## 🎨 前端设置格式

### TypeScript/JavaScript 配置

```typescript
// config/tokens.ts
export const WHITELISTED_TOKENS = {
  WSRW: {
    address: "0x22608aC253B934D5078cB0d12f7F7e377b51798b",
    decimals: 18,
    symbol: "WSRW",
    name: "Wrapped SRW"
  },
  WBTC: {
    address: "0x770556F853a17893b1187A9754F17c6f57776b7c",
    decimals: 8,
    symbol: "WBTC",
    name: "Wrapped Bitcoin"
  },
  USDT: {
    address: "0x3577E5E0E3A47d9a552426638977ee3EddD4552e",
    decimals: 6,
    symbol: "USDT",
    name: "Tether USD"
  },
  USDC: {
    address: "0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin"
  },
  DAI: {
    address: "0xA16171a7dadfb86afC934eaF16daCD86cD435120",
    decimals: 18,
    symbol: "DAI",
    name: "Dai Stablecoin"
  },
  SDX: {
    address: "0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75",
    decimals: 18,
    symbol: "SDX",
    name: "SimpleDex Token"
  },
  WSOL: {
    address: "0xbB0543b26A291648D67B91a8A0f150f6122FEd03",
    decimals: 18,
    symbol: "WSOL",
    name: "Wrapped Solana"
  }
} as const;

// 白名单地址数组
export const TOKEN_WHITELIST: string[] = [
  "0x22608aC253B934D5078cB0d12f7F7e377b51798b", // WSRW
  "0x770556F853a17893b1187A9754F17c6f57776b7c", // WBTC
  "0x3577E5E0E3A47d9a552426638977ee3EddD4552e", // USDT
  "0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769", // USDC
  "0xA16171a7dadfb86afC934eaF16daCD86cD435120", // DAI
  "0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75", // SDX
  "0xbB0543b26A291648D67B91a8A0f150f6122FEd03", // WSOL
];

// 测试账户白名单
export const TEST_ACCOUNTS: string[] = [
  "0x31bbA26B33F6B15359876C86D06AC0848C6C2C29", // test1
  "0x2Ef1e4Ff5e4866F7F5989d12cAbaCbB2Ac37909C", // test2
  "0xefB66bFEEe4c72ca55001bcB6e4542B1d087E856", // test3
  "0x86b330E5D253D2eEAE9316ecc2e62322B90eF809", // test4
];
```

### 环境变量格式 (.env)

```bash
# Tokens
NEXT_PUBLIC_WSRW_ADDRESS=0x22608aC253B934D5078cB0d12f7F7e377b51798b
NEXT_PUBLIC_WBTC_ADDRESS=0x770556F853a17893b1187A9754F17c6f57776b7c
NEXT_PUBLIC_USDT_ADDRESS=0x3577E5E0E3A47d9a552426638977ee3EddD4552e
NEXT_PUBLIC_USDC_ADDRESS=0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769
NEXT_PUBLIC_DAI_ADDRESS=0xA16171a7dadfb86afC934eaF16daCD86cD435120
NEXT_PUBLIC_SDX_ADDRESS=0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75
NEXT_PUBLIC_WSOL_ADDRESS=0xbB0543b26A291648D67B91a8A0f150f6122FEd03
```

---

## 📊 地址汇总表

### 代币地址

| Symbol | Address | Decimals |
|--------|---------|----------|
| WSRW | `0x22608aC253B934D5078cB0d12f7F7e377b51798b` | 18 |
| WBTC | `0x770556F853a17893b1187A9754F17c6f57776b7c` | 8 |
| USDT | `0x3577E5E0E3A47d9a552426638977ee3EddD4552e` | 6 |
| USDC | `0xf373DeaAc4a65d92c6543C4ad879bebA55ef9769` | 6 |
| DAI | `0xA16171a7dadfb86afC934eaF16daCD86cD435120` | 18 |
| SDX | `0x961245FCe30FC5a3C7F4ee8AFa05f85cF5AB8C75` | 18 |
| WSOL | `0xbB0543b26A291648D67B91a8A0f150f6122FEd03` | 18 |

### 测试账户

| Name | Address |
|------|---------|
| test1 | `0x31bbA26B33F6B15359876C86D06AC0848C6C2C29` |
| test2 | `0x2Ef1e4Ff5e4866F7F5989d12cAbaCbB2Ac37909C` |
| test3 | `0xefB66bFEEe4c72ca55001bcB6e4542B1d087E856` |
| test4 | `0x86b330E5D253D2eEAE9316ecc2e62322B90eF809` |

---

*最后更新: 2024-12-22*

