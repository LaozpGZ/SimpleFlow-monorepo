你说得对。viem 确实不原生支持 SimpleChain，所以不能从 viem/chains 导入 simplechainTestnet。

从截图看，之前的修改方式是正确的：

移除了从 viem/chains 导入 monadTestnet
手动定义了 simplechainTestnet 对象，包含所有必要的链配置
这个做法是正确的，因为：

SimpleChain 是自定义链，viem 没有内置支持
需要手动定义链配置对象，使用 as const satisfies Chain 来确保类型正确

```
  monadTestnet,
  scrollSepolia as scrollSepolia_,
  zksync,
  zksyncSepoliaTestnet,
} from 'viem/chains'

const simplechainTestnet = {
  id: 1914,
  name: 'SimpleChain Testnet',
  nativeCurrency: { name: 'SRW', symbol: 'SRW', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.simplechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SimpleChain Explorer',
      url: 'https://testnet-explorer.simplechain.com',
    },
  },
  testnet: true,
} as const satisfies Chain
```