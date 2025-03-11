export const walletSupportDefaultMevOnBSC = ['isTrustWallet', 'isTrust', 'isBinance']
// wallet support mev on bsc default, but it not using PCS RPC

export const walletSupportCustomRPCNative = ['isOkxWallet', 'isMetaMask', 'isCoinbaseWallet']
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
    title: 'SafePal',
    image: 'safepal.png',
    doc: 'https://safepalsupport.zendesk.com/hc/en-us/articles/14688426876443-How-to-add-a-Custom-network-in-the-SafePal-software-wallet',
  },
  {
    title: 'Rabbit Wallet',
    image: 'rabby.png',
    doc: 'https://support.rabby.io/hc/en-us',
  },
  {
    title: 'TokenPocket',
    image: 'token-pocket.png',
    doc: 'https://help.tokenpocket.pro/en/wallet-operation/custom-network-token/how-to-add-custom-network',
  },

  {
    title: 'Others',
    image: 'others.png',
    doc: 'https://support.metamask.io/networks-and-sidechains/managing-networks/how-to-add-a-custom-network-rpc/',
  },
]

export const INFO_SECTION_ID = 'mev-info-section'
