PancakeSwap Fork SimpleChain部署配置流程
这个codemap展示了在PancakeSwap前端中添加SimpleChain测试网支持的完整配置流程。关键配置点包括：ChainId定义[1a]、节点配置[2a]、合约地址配置[3a]、Subgraph禁用[4a]和代币集成[5a]。通过修改这些配置文件，可以快速部署PancakeSwap fork到新链上。


1
链配置初始化流程
从ChainId定义到链配置的完整流程，展示如何添加新链支持. See guide



 https://explorer.simplechain.com 
 https://rpc.simplechain.com
 1913
 SRW


 https://testnet-explorer.simplechain.com 
 https://testnet-rpc.simplechain.com
 1914
 SRW




ChainId枚举定义
BSC = 56

1a
ChainId枚举定义
chainId.ts:1
export enum ChainId { BSC = 56, BSC_TESTNET = 97, LINEA = 59144, LINEA_TESTNET = 59140,
需添加SIMPLECHAIN = xxx
链名称映射配置

1b
链名称映射
chainNames.ts:3
export const chainNames: Record<UnifiedChainId, string> = { [ChainId.BSC]: 'bsc', [ChainId.BSC_TESTNET]: 'bscTestnet', [ChainId.LINEA]: 'linea', [ChainId.LINEA_TESTNET]: 'lineaTestnet',
chainFullNames映射
kebabCase名称映射
链配置数组定义

1c
链配置数组
chains.ts:12
export const Chains: Chain[] = [ { id: ChainId.BSC, name: chainNames[ChainId.BSC], fullName: chainFullNames[ChainId.BSC], isEVM: true }, { id: ChainId.LINEA, name: chainNames[ChainId.LINEA], fullName: chainFullNames[ChainId.LINEA], isEVM: true },
BSC链配置
LINEA链配置
需添加SimpleChain配置
testnetChainIds定义
Web应用链集成

1d
Web应用链配置
chains.ts:73
export const CHAINS: [Chain, ...Chain[]] = [ bsc, bscTestnet, linea, lineaTestnet,
导入wagmi链配置
添加BSC相关配置
需添加SimpleChain配置
L2_CHAIN_IDS定义

2
RPC节点配置流程
配置区块链RPC节点，支持多节点冗余和负载均衡. Hide guide

AI generated guide
Motivation
在DeFi应用中，RPC节点稳定性是用户交易体验的关键。如果单个RPC节点宕机，用户将无法进行交易。PancakeSwap通过多节点冗余架构解决这个问题，为每条链配置多个备用节点，确保服务高可用性。

Details
环境变量配置
RPC节点地址通过环境变量动态配置，避免硬编码 [2c]。主要变量包括：

NEXT_PUBLIC_NODE_PRODUCTION - 生产环境主节点
NEXT_PUBLIC_NODE_REAL_API_ETH - NodeReal服务节点
SERVER_NODE_REAL_API_ETH - 服务端专用节点
双层节点架构
系统采用服务端+客户端双层节点配置 [2a][2b]：

SERVER_NODES：服务端API调用使用，配置更稳定的付费节点
PUBLIC_NODES：前端浏览器直接调用，配置公共节点
节点选择机制
节点按优先级顺序排列，系统会自动尝试可用节点。配置示例：

[
  process.env.NEXT_PUBLIC_NODE_PRODUCTION || '',  // 主节点
  getNodeRealUrl(ChainId.BSC, apiKey) || '',      // NodeReal节点
  'https://bsc.publicnode.com',                   // 公共备用节点
  'https://binance.llamarpc.com'                  // 第二备用节点
]
新链部署要点
部署到SimpleChain时，只需在对应位置添加该链的RPC节点URL，无需修改核心逻辑。支持环境变量覆盖，便于不同环境（开发/测试/生产）使用不同节点。

环境变量配置层

2c
环境变量配置
.env.example:1
NEXT_PUBLIC_NODE_REAL_API_ETH= NEXT_PUBLIC_NODE_PRODUCTION=
process.env读取运行时变量
节点配置核心层

2a
服务端节点配置
nodes.ts:27
export const SERVER_NODES = { [ChainId.BSC]: [ getNodeRealUrl(ChainId.BSC, process.env.SERVER_NODE_REAL_API_ETH) || '', process.env.NEXT_PUBLIC_NODE_PRODUCTION || '',
getNodeRealUrl()获取节点
process.env环境变量
备用节点列表

2b
公共节点配置
nodes.ts:87
export const PUBLIC_NODES: Record<ChainId, string[] | readonly string[]> = { [ChainId.BSC]: [ process.env.NEXT_PUBLIC_NODE_PRODUCTION || '', getNodeRealUrl(ChainId.BSC, process.env.NEXT_PUBLIC_NODE_REAL_API_ETH) || '',
NEXT_PUBLIC_* 前端变量
getNodeRealUrl()节点服务
公共节点列表
节点选择逻辑层
服务器端调用SERVER_NODES
客户端调用PUBLIC_NODES

3
V3合约地址配置
配置所有V3相关合约地址，支持多链部署. See guide








3a
合约地址配置
contracts.ts:14
export default { masterChefV3: masterChefV3Addresses, nftPositionManager: NFT_POSITION_MANAGER_ADDRESSES, v3PoolDeployer: DEPLOYER_ADDRESSES, v3Migrator: { [ChainId.BSC]: '0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2', [ChainId.LINEA]: '0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2',
masterChefV3: 农场合约
masterChefV3Addresses (导入)
nftPositionManager: NFT头寸管理
NFT_POSITION_MANAGER_ADDRESSES (导入)
v3PoolDeployer: 池部署器
DEPLOYER_ADDRESSES (导入)

3a
合约地址配置
contracts.ts:14
export default { masterChefV3: masterChefV3Addresses, nftPositionManager: NFT_POSITION_MANAGER_ADDRESSES, v3PoolDeployer: DEPLOYER_ADDRESSES, v3Migrator: { [ChainId.BSC]: '0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2', [ChainId.LINEA]: '0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2',
BSC: 0xbC203d7f...
LINEA: 0xbC203d7f...

3b
报价合约配置
contracts.ts:206
quoter: V3_QUOTER_ADDRESSES,
V3_QUOTER_ADDRESSES (导入)

3c
Infinity合约配置
contracts.ts:273
// inifinity poolManagerCL: INFI_CL_POOL_MANAGER_ADDRESSES, positionManagerCL: INFI_CL_POSITION_MANAGER_ADDRESSES,
poolManagerCL: 集中流动性池管理
INFI_CL_POOL_MANAGER_ADDRESSES
positionManagerCL: 集中流动性头寸
INFI_CL_POSITION_MANAGER_ADDRESSES
外部地址导入
@pancakeswap/farms
@pancakeswap/v3-sdk
@pancakeswap/smart-router
@pancakeswap/infinity-sdk

4
Subgraph和API配置
配置The Graph子图和API端点，支持禁用功能. See guide








getV3Subgraphs() 函数定义
读取配置参数 {noderealApiKey, theGraphApiKey}
返回各链子图映射对象
BSC主网子图URL

4a
V3子图配置
subgraphs.ts:25
export function getV3Subgraphs({ noderealApiKey, theGraphApiKey }: SubgraphParams) { return { [ChainId.BSC]: `https://gateway-arbitrum.network.thegraph.com/api/${theGraphApiKey}/subgraphs/id/Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ`, [ChainId.LINEA]: `https://gateway-arbitrum.network.thegraph.com/api/${theGraphApiKey}/subgraphs/id/6gCTVX98K3A9Hf9zjvgEKwjz7rtD4C1V173RYEdbeMFX`, [ChainId.OPBNB_TESTNET]: null,
OPBNB测试网设置为null (禁用示例)
支持通过null值禁用子图功能
endpoints.ts 配置集成
导入V3_SUBGRAPHS常量
V3_SUBGRAPH_URLS 映射
继承原始子图配置
BSC代理URL配置

4b
子图URL映射
endpoints.ts:49
export const V3_SUBGRAPH_URLS = { ...V3_SUBGRAPHS, [ChainId.BSC]: `${THE_GRAPH_PROXY_API}/exchange-v3-bsc`, [ChainId.LINEA]: `${THE_GRAPH_PROXY_API}/exchange-v3-linea`,
统一管理所有子图端点
API端点环境变量配置
NEXT_PUBLIC_QUOTING_API 报价API

4c
API端点配置
endpoints.ts:67
export const X_API_ENDPOINT = process.env.NEXT_PUBLIC_QUOTING_API export const BRIDGE_API_ENDPOINT = process.env.NEXT_PUBLIC_BRIDGE_API
通过环境变量控制API启用/禁用

5
代币和链配置集成
将新链集成到代币列表和路由系统中. See guide






链ID定义系统
ChainId枚举定义
BSC = 56
LINEA = 59144

5b
测试网链ID
chainId.ts:30
export const testnetChainIds = [ ChainId.GOERLI, ChainId.BSC_TESTNET, ChainId.LINEA_TESTNET, ChainId.BASE_TESTNET,
链类型分类

5c
L2链配置
chains.ts:58
export const L2_CHAIN_IDS: ChainId[] = [ ChainId.ARBITRUM_ONE, ChainId.ZKSYNC, ChainId.LINEA, ChainId.BASE,
测试网标识
代币地址配置
各链代币配置文件

5a
BSC代币配置
bsc.ts:6
export const bscTokens = { wbnb: WBNB[ChainId.BSC], cake: CAKE_MAINNET, busd: BUSD_BSC,
linea.ts (Linea代币)
common.ts (通用代币)
代币聚合系统
allTokens.ts (所有代币)
路由和UI集成
链选择器组件
NetworkSelector.tsx
代币列表系统
tokenLists配置
代币价格查询