export const walletSupportDefaultMevOnBSC = ['isTrustWallet', 'isTrust', 'isBinance']
// wallet support mev on bsc default, but it not using PCS RPC

export const walletSupportCustomRPCNative = ['isMetaMask', 'isOkxWallet', 'isCoinbaseWallet']
// wallet support wallet_addEthereumChain native

export const walletSupportManualRPCConfig = ['isSafePal', 'isRabby', 'isTokenPocket']
// wallet support manual config on wallet app, don't support support wallet_addEthereumChain native

export const walletPretendToMetamask = [
  'isBraveWallet',
  'isApexWallet',
  'isAvalanche',
  'isBitKeep',
  'isBlockWallet',
  'isKuCoinWallet',
  'isMathWallet',
  'isOkxWallet',
  'isOKExWallet',
  'isOneInchIOSWallet',
  'isOneInchAndroidWallet',
  'isOpera',
  'isPortal',
  'isPhantom',
  'isRabby',
  'isTokenPocket',
  'isTokenary',
  'isUniswapWallet',
  'isZerion',
]
// wallet support mev on bsc default, but it not using PCS RPC

export const rpcData = {
  'Network Name': 'PancakeSwap MEV Guard',
  'RPC URL': 'https://bscrpc.pancakeswap.finance',
  'Chain ID': '56',
  'Currency symbol': 'BNB',
  'Block Explorer URL': 'https://bscscan.com',
}

export const walletConfig = [
  {
    title: 'Trust Wallet',
    image: 'trust.png',
    doc: 'https://community.trustwallet.com/t/how-to-add-a-custom-network-on-the-trust-wallet-mobile-app/626781',
  },
  {
    title: 'Rabbit Wallet',
    image: 'rabby.png',
    doc: 'https://support.rabby.io/hc/en-us',
  },
  {
    title: 'SafePal',
    image: 'safepal.png',
    doc: 'https://safepalsupport.zendesk.com/hc/en-us/articles/14688426876443-How-to-add-a-Custom-network-in-the-SafePal-software-wallet',
  },
  {
    title: 'Others',
    image: 'others.png',
    doc: 'https://support.metamask.io/networks-and-sidechains/managing-networks/how-to-add-a-custom-network-rpc/',
  },
]
