PancakeSwap专属设置代币配置机制
本代码图展示了PancakeSwap如何为每个区块链网络配置专属设置代币的核心机制，包括WNATIVE映射系统[1a]、动态原生代币获取[2a]、交易基础代币配置[3a]和跨链代币映射[4a]等关键组件。


1
原生代币包装配置系统
展示PancakeSwap如何为每个区块链网络配置专属的包装原生代币. Hide guide

AI generated guide
Motivation
PancakeSwap需要支持多个区块链网络，每个链都有其原生代币（如BSC的BNB、Ethereum的ETH）。但在DeFi协议中，原生代币无法直接用于智能合约交互，需要将其包装成ERC20代币形式。系统必须为每个链配置正确的包装代币地址和属性，确保用户在不同链上都能正常进行交易、添加流动性等操作。

Details
核心配置结构
系统通过WNATIVE对象[1a]建立链ID到包装代币的映射关系。每个链的包装代币都在对应的常量文件中定义：

BSC链：使用WBNB作为包装代币[1b]，地址为0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
Ethereum链：使用WETH作为包装代币[1c]，地址为0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
其他链：类似地配置相应的WETH变体
原生代币属性
NATIVE对象[1d]定义了每个链原生代币的基本属性（名称、符号、精度），这些属性用于创建Native类的实例，提供统一的接口来处理不同链的原生代币。

配置导出
所有配置通过模块导出方式提供，包括WBNB[164]、WETH9[9]和NATIVE[237]常量，确保整个系统都能正确访问每个链的专属代币配置。


1a
WNATIVE映射定义
constants.ts:207
export const WNATIVE = { [ChainId.ETHEREUM]: WETH9[ChainId.ETHEREUM], [ChainId.BSC]: WBNB[ChainId.BSC], [ChainId.ARBITRUM_ONE]: WETH9[ChainId.ARBITRUM_ONE],
WBNB配置

1b
BSC链WBNB配置
constants.ts:164
export const WBNB = { [ChainId.BSC]: new ERC20Token( ChainId.BSC, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapped BNB', 'https://www.binance.org', ),
WETH9配置

1c
Ethereum链WETH配置
constants.ts:9
export const WETH9 = { [ChainId.ETHEREUM]: new ERC20Token( ChainId.ETHEREUM, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether', 'https://weth.io', ),

1d
原生代币属性定义
constants.ts:237
export const NATIVE = { [ChainId.ETHEREUM]: ETHER, [ChainId.BSC]: BNB, [ChainId.ARBITRUM_ONE]: ETHER,
常量导出系统
导出WBNB常量
导出WETH9常量
导出NATIVE常量

2
动态获取原生代币机制
展示如何根据链ID动态获取对应的原生代币和包装代币. See guide








2c
React Hook获取原生货币
useNativeCurrency.ts:8
export function useUnifiedNativeCurrency(overrideChainId?: UnifiedChainId): UnifiedNativeCurrency { const { chainId: chainId_ } = useActiveChainId() const chainId = overrideChainId ?? chainId_ return useMemo(() => { try { if (chainId === NonEVMChainId.SOLANA) { return SOL } return Native.onChain(overrideChainId ?? chainId ?? ChainId.BSC) } catch (e) { return Native.onChain(ChainId.BSC) } }, [overrideChainId, chainId]) }
useActiveChainId() 获取当前链ID
useMemo() 缓存计算结果
检查是否为SOLANA链

2a
Native.onChain方法
native.ts:33
public static onChain(chainId: number): Native { if (chainId in this.cache) { return this.cache[chainId] } invariant(!!NATIVE[chainId as keyof typeof NATIVE], 'NATIVE_CURRENCY') const { decimals, name, symbol } = NATIVE[chainId as keyof typeof WNATIVE] return (this.cache[chainId] = new Native({ chainId, decimals, symbol, name })) }
检查缓存中是否存在
从NATIVE配置获取属性
创建Native实例并缓存
异常处理回退到BSC链
Native实例使用

2b
获取包装代币
native.ts:25
public get wrapped(): Token { const wnative = WNATIVE[this.chainId as keyof typeof WNATIVE] invariant(!!wnative, 'WRAPPED') return wnative }
从WNATIVE映射查找
返回对应包装代币

3
交易配置中的基础代币设置
展示每个链在交易界面中使用的建议基础代币配置. See guide







exchange.ts 配置入口

3a
建议基础代币配置
exchange.ts:62
export const SUGGESTED_BASES: ChainTokenList = { [ChainId.ETHEREUM]: [USDC[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM], WNATIVE[ChainId.ETHEREUM], WBTC_ETH], [ChainId.BSC]: [bscTokens.usdt, bscTokens.cake, bscTokens.btcb], [ChainId.ARBITRUM_ONE]: [arbitrumTokens.weth, arbitrumTokens.usdt, arbitrumTokens.usdc],
ETHEREUM: [USDC, USDT, WNATIVE, WBTC]
BSC: [bscTokens.usdt, cake, btcb]
ARBITRUM: [weth, usdt, usdc]

3b
流动性跟踪基础代币
exchange.ts:92
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = { [ChainId.ETHEREUM]: [USDC[ChainId.ETHEREUM], WNATIVE[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM], WBTC_ETH], [ChainId.BSC]: [bscTokens.wbnb, bscTokens.dai, bscTokens.busd, bscTokens.usdt, bscTokens.cake], [ChainId.ARBITRUM_ONE]: [arbitrumTokens.weth, arbitrumTokens.usdt, arbitrumTokens.usdc],
ETHEREUM: [USDC, WNATIVE, USDT, WBTC]
BSC: [wbnb, dai, busd, usdt, cake]
ARBITRUM: [weth, usdt, usdc]
具体链代币配置

3c
BSC链代币配置
bsc.ts:6
export const bscTokens = { wbnb: WBNB[ChainId.BSC], bnb: new ERC20Token( ChainId.BSC, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'BNB', 'BNB', 'https://www.binance.com/', ),
wbnb: WBNB[ChainId.BSC]
bnb: ERC20Token(BNB地址)

3d
Arbitrum链代币配置
arb.ts:5
export const arbitrumTokens = { weth: WETH9[ChainId.ARBITRUM_ONE], usdt: USDT[ChainId.ARBITRUM_ONE], usdc: USDC[ChainId.ARBITRUM_ONE],
weth: WETH9[ChainId.ARBITRUM_ONE]
usdt: USDT[ChainId.ARBITRUM_ONE]
usdc: USDC[ChainId.ARBITRUM_ONE]

4
跨链代币映射系统
展示代币在不同链之间的映射和配置机制. See guide






common.ts 核心映射配置

4a
USDC跨链映射
common.ts:246
export const USDC = { [ChainId.BSC]: USDC_BSC, [ChainId.ETHEREUM]: USDC_ETH, [ChainId.ARBITRUM_ONE]: new ERC20Token( ChainId.ARBITRUM_ONE, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6, 'USDC', 'USD Coin', 'https://www.centre.io/usdc', ),
BSC链USDC配置
Ethereum链USDC配置
Arbitrum链USDC配置

4b
CAKE代币跨链映射
common.ts:144
export const CAKE = { [ChainId.ETHEREUM]: new ERC20Token( ChainId.ETHEREUM, '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898', 18, 'CAKE', 'PancakeSwap Token', 'https://pancakeswap.finance/', ), [ChainId.BSC]: CAKE_MAINNET, [ChainId.ARBITRUM_ONE]: new ERC20Token( ChainId.ARBITRUM_ONE, '0x1b896893dfc86bb67Cf57767298b9073D2c1bA2c',
BSC主网CAKE
Ethereum桥接CAKE
Arbitrum桥接CAKE
其他稳定币映射
USDT跨链配置
BUSD跨链配置
exchange.ts 链特性配置

4c
链刷新时间配置
exchange.ts:39
export const CHAIN_REFRESH_TIME = { [ChainId.ETHEREUM]: 12_000, [ChainId.BSC]: 6_000, [ChainId.ARBITRUM_ONE]: 10_000, [ChainId.ZKSYNC]: 3_000,
Ethereum: 12秒
BSC: 6秒
Arbitrum: 10秒
基础代币配置
SUGGESTED_BASES
BASES_TO_TRACK_LIQUIDITY_FOR