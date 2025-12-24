命名不规范。

参考文件中的其他链命名：

bscTestnet (camelCase)
lineaTestnet (camelCase)
zksyncSepoliaTestnet (camelCase)
baseGoerli (camelCase)
simplechainTestnet 应该改为 simpleChainTestnet（注意 Chain 的 C 大写）。

另外，第13行有个问题：使用了中文逗号 ， 而不是英文逗号 ,。

需要我帮你修复这两个问题吗？


还有其他类似的吗？确实有问题。第12行 'Simple' 应该改成 'simplechain'，与其他链保持一致（全小写）。 情况吗？
找到了几处需要修复的：

文件	问题	是否需要修复
NetworkSwitcher.tsx:32	'Simple'	✅ 需要改成 'simplechain'
NetworkSwitcher.tsx:33	'tSimple'	✅ 需要改成 'simplechainTestnet' 或简写
InfoNav/index.tsx:100	name: 'Simple'	✅ 需要改成 'SimpleChain'
V3Info/.../InfoNav.tsx:78	name: 'Simple'	✅ 需要改成 'SimpleChain'
info/constant.ts:49	SIMPLECHAIN: 'SIMPLE'	⚠️ 可能是 token symbol，需确认
RemoveLiquidity 相关	t('Simple')	❌ 这是 UI 文本"简单/详细"，不是链名
分析结果：

文件	当前值	应改为	说明
NetworkSwitcher.tsx:32	'Simple'	'SRW'	这是 SHORT_SYMBOL，参考其他链用原生币符号
NetworkSwitcher.tsx:33	'tSimple'	'tSRW'	testnet 简写
InfoNav/index.tsx:100	name: 'Simple'	name: 'SimpleChain'	显示名应该完整
V3Info/.../InfoNav.tsx:78	name: 'Simple'	name: 'SimpleChain'	同上
info/constant.ts:49	'SIMPLE'	'SRW'	这是 mainToken，应该是原生币符号