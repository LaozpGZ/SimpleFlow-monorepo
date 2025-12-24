# 替换钱包

/SimpleFlow-monorepo/packages/ui-wallets/src/components/WalletSelect/WalletChainSelect.tsx

        <SquareChainIcon src={`${ASSET_CDN}/web/chains/square/${ChainId.MONAD_TESTNET}.svg`} alt="monad" />
        <SquareChainIcon src={`${ASSET_CDN}/web/chains/square/${ChainId.SIMPLECHAIN}.svg`} alt="simplechain" />
        

packages/ui-wallets/src/config/wallets.ts

这个文件是 钱包配置文件，用于定义 DApp 支持的各种加密钱包。

主要内容
1. getWalletsConfig 函数 (第63-375行)
返回所有支持的钱包配置列表，每个钱包包含：

id - 钱包唯一标识
title - 显示名称
icon - 图标 URL
networks - 支持的网络类型 (EVM / Solana)
installed - getter，检测钱包是否已安装
connectorId - EVM 连接器名称
solanaAdapterName - Solana 适配器名称
deepLink / downloadLink - 移动端深链接和下载链接
qrCode - 二维码生成函数
MEVSupported - 是否支持 MEV 保护
2. 支持的钱包列表
类型	钱包
EVM + Solana	MetaMask, Trust, OKX, Binance, Coinbase, TokenPocket, SafePal, Coin98
仅 EVM	WalletConnect, Opera, Brave, Rabby, MathWallet
仅 Solana	Phantom, Solflare, Glow, BitGet, Exodus, Backpack, SquadsX
3. TOP_WALLETS_ID_CONFIG (第377-381行)
定义不同场景下的推荐钱包顺序。

4. CHAIN_TOP_WALLETS_CONFIG (第384-386行)
针对特定链（如 SIMPLECHAIN_MAINNET）的推荐钱包配置。

5. getTopWalletsConfig 函数 (第388-415行)
根据 walletFilter 和 chainId 返回对应的推荐钱包列表。

简而言之：这个文件集中管理了所有钱包的元数据和检测逻辑，供钱包连接 UI 使用。

Feedback submitted



那simplechain的需要怎么找
根据文件内容，SimpleChain 的钱包配置在第 384-386 行：

wallets.ts:384-386
export const CHAIN_TOP_WALLETS_CONFIG: { [chainId: number]: WalletIds[] } = {
  [ChainId.SIMPLECHAIN_MAINNET]: [WalletIds.Metamask, WalletIds.Okx, WalletIds.Walletconnect],
}
SimpleChain 配置说明
当用户连接到 SimpleChain 主网 时，推荐显示的钱包是：

MetaMask
OKX Wallet
WalletConnect
这个配置通过 getTopWalletsConfig 函数（第 388-415 行）生效：

如果传入的 chainId 匹配 CHAIN_TOP_WALLETS_CONFIG 中的键，就返回该链专属的钱包列表
否则回退到通用的 TOP_WALLETS_ID_CONFIG
如果需要修改
要为 SimpleChain 添加或修改推荐钱包，直接编辑 CHAIN_TOP_WALLETS_CONFIG 对象即可，例如添加 Trust Wallet：

typescript
[ChainId.SIMPLECHAIN_MAINNET]: [WalletIds.Metamask, WalletIds.Okx, WalletIds.Trust, WalletIds.Walletconnect],