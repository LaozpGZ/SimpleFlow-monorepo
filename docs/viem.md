你说得对！simplechainTestnet 不是 viem 官方的链，这个导入会报错。

这个文件有问题：

simplechainTestnet 不存在于 viem/chains
应该像 apps/web/src/config/chains.ts 那样自己定义
让我看看这个测试文件应该怎么修复：

确实有问题。simplechainTestnet 不存在于 viem/chains，需要：

从导入中移除 simplechainTestnet
在文件中自定义 simplechainTestnet 链（像 opbnbTestnet 和 linea 那样）