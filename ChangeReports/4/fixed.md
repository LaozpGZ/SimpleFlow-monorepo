修复摘要：
packages/chains/src/averageChainBlockTimes.ts - 将 SIMPLECHAIN 的 block time 从 3 修改为 0.7
packages/v2-sdk/src/constants.ts - 添加 SIMPLECHAIN 的 Factory 地址和 INIT_CODE_HASH
packages/tokens/src/constants/simplechain.ts - 重命名 DAI/WSOL 以避免导出冲突，添加 simplechainTestnetTokens 别名
packages/tokens/src/allTokens.ts - 添加 SIMPLECHAIN 到 allTokens 映射
packages/pools/src/constants/contracts.ts - 添加 SIMPLECHAIN 合约地址占位符
packages/smart-router/evm/constants/exchange.ts - 添加 V2_ROUTER_ADDRESS 配置
packages/smart-router/evm/constants/gasModel/index.ts - 添加 gas tokens 配置
packages/smart-router/evm/constants/multicall.ts - 添加 multicall 配置
packages/smart-router/evm/v3-router/providers/onChainQuoteProvider.ts - 添加 SUCCESS_RATE_CONFIG
packages/universal-router-sdk/src/constants.ts - 添加 Universal Router 地址占位符
apps/web/src/config/chains.ts - 创建自定义的 simplechain 和 simplechainTestnet 链定义（而不是从 wagmi/chains 导入）