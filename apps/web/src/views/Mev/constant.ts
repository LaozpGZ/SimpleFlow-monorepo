export const walletSupportDefaultMevOnBSC = ['isTrustWallet', 'isTrust', 'isBinance']
// wallet support mev on bsc default, but it not using PCS RPC

export const walletSupportCustomRPCNative = ['isMetaMask', 'isOkxWallet', 'isCoinbaseWallet']
// wallet support wallet_addEthereumChain native

export const walletSupportManualRPCConfig = ['isSafePal', 'isRabby', 'isTokenPocket']
// wallet support manual config on wallet app, don't support support wallet_addEthereumChain native

export const rpcData = {
  'Network Name': 'PancakeSwap MEV Guard',
  'RPC URL': 'https://bscrpc.pancakeswap.finance',
  'Chain ID': '56',
  'Currency symbol': 'BNB',
  'Block Explorer URL': 'https://bscscan.com',
}
