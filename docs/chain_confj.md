@chains.ts#L94-118 这个我感觉不应该放这里@chains.ts  应该像linea 那样
你说得对。simplechainTestnet 的定义不应该放在测试文件里，应该像 linea 那样放在 chains.ts 中，然后在测试文件中导入使用。

我看到 chains.ts 已经有 simplechain 和 simplechainTestnet 的定义了（第143-144行）。

所以测试文件应该从那里导入，而不是自己定义。让我检查一下测试文件的导入情况：

你说得对。这个测试文件里 linea 和 opbnbTestnet 也是自己定义的，但更好的做法是从一个共享的地方导入。

不过问题是 apps/web/src/config/chains.ts 是 web app 的配置，测试包 universal-router-sdk 不应该直接依赖它。

更好的方案是：

删除测试文件中的 simplechainTestnet 定义
从 CHAINS 数组中移除它（因为测试可能不需要这个链）
或者如果测试确实需要这个链，可以考虑把链定义放到一个共享的 package（如 pancakeswap/chains）里。

你想怎么处理？

简单方案：从测试文件中删除 simplechainTestnet 相关代码
完整方案：保留但接受当前结构（测试文件有自己的链定义）
Feedback submitted