import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
import { WalletAdaptedNetwork, WalletConfigV3, WalletIds } from '../types'
import { EvmConnectorNames, SolanaConnectorNames } from './connectorNames'
import {
  isBinanceWeb3WalletInstalled,
  isBraveWalletInstalled,
  isCoin98Installed,
  isCyberWalletInstalled,
  isMathWalletInstalled,
  isMetamaskInstalled,
  isOkxWalletInstalled,
  isOperaWalletInstalled,
  isRabbyWalletInstalled,
  isSafePalInstalled,
  isTokenPocketInstalled,
  isTrustWalletInstalled,
} from './installed'
import { ASSET_CDN } from './url'

const createQrCode = () => {}

function getBinanceConnectorId() {
  const globalWindow = safeGetWindow()

  if (!globalWindow) return EvmConnectorNames.BinanceW3W

  // use Binance App
  if (globalWindow.isBinance) return EvmConnectorNames.Injected

  // use Binance Web3 Wallet Extension
  if (globalWindow.binancew3w) return EvmConnectorNames.BinanceW3W

  return EvmConnectorNames.BinanceW3W
}

export const getWalletsConfig = ({
  chainId,
  connect,
}: {
  chainId: number
  connect: any // TODO: @ChefJerry add type
}): WalletConfigV3<EvmConnectorNames | SolanaConnectorNames>[] => {
  // const qrCode = createQrCode(chainId, connect)
  const qrCode = () => Promise.resolve('')
  return [
    {
      id: WalletIds.Metamask,
      title: 'Metamask',
      icon: `${ASSET_CDN}/web/wallets/metamask.png`,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isMetamaskInstalled()
      },
      connectorId: EvmConnectorNames.MetaMask, // may conflict with solana connector
      deepLink: 'https://metamask.app.link/dapp/pancakeswap.finance/',
      qrCode,
      downloadLink: 'https://metamask.app.link/dapp/pancakeswap.finance/',
      MEVSupported: true,
    },
    {
      id: WalletIds.Trust,
      title: 'Trust Wallet',
      icon: `${ASSET_CDN}/web/wallets/trust.png`,
      connectorId: EvmConnectorNames.TrustWallet,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isTrustWalletInstalled()
      },
      deepLink: 'https://link.trustwallet.com/open_url?coin_id=20000714&url=https://pancakeswap.finance/',
      downloadLink: 'https://trustwallet.com/browser-extension',
      guide: {
        desktop: 'https://trustwallet.com/browser-extension',
        mobile: 'https://trustwallet.com/',
      },
      qrCode,
      MEVSupported: true,
    },
    {
      id: WalletIds.Okx,
      title: 'OKX Wallet',
      icon: `${ASSET_CDN}/web/wallets/okx-wallet.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isOkxWalletInstalled()
      },
      downloadLink: 'https://www.okx.com/download',
      deepLink:
        'https://www.okx.com/download?deeplink=okx%3A%2F%2Fwallet%2Fdapp%2Furl%3FdappUrl%3Dhttps%253A%252F%252Fpancakeswap.finance',
      guide: {
        desktop: 'https://www.okx.com/web3',
        mobile: 'https://www.okx.com/web3',
      },
      qrCode,
    },
    {
      id: WalletIds.BinanceW3W,
      title: 'Binance Wallet',
      icon: `${ASSET_CDN}/web/wallets/binance-w3w.png`,
      connectorId: getBinanceConnectorId(),
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isBinanceWeb3WalletInstalled()
      },
      MEVSupported: true,
    },
    {
      id: WalletIds.Coinbase,
      title: 'Coinbase Wallet',
      icon: `${ASSET_CDN}/web/wallets/coinbase.png`,
      connectorId: EvmConnectorNames.WalletLink,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
    },
    {
      id: WalletIds.Walletconnect,
      title: 'WalletConnect',
      icon: `${ASSET_CDN}/web/wallets/walletconnect.png`,
      connectorId: EvmConnectorNames.WalletConnect,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
    },
    {
      id: WalletIds.Opera,
      title: 'Opera Wallet',
      icon: `${ASSET_CDN}/web/wallets/opera.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM],
      get installed() {
        return isOperaWalletInstalled()
      },
      downloadLink: 'https://www.opera.com/crypto/next',
    },
    {
      id: WalletIds.Brave,
      title: 'Brave Wallet',
      icon: `${ASSET_CDN}/web/wallets/brave.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM],
      get installed() {
        return isBraveWalletInstalled()
      },
      downloadLink: 'https://brave.com/wallet/',
    },
    {
      id: WalletIds.Rabby,
      title: 'Rabby Wallet',
      icon: `${ASSET_CDN}/web/wallets/rabby.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM],
      get installed() {
        return isRabbyWalletInstalled()
      },
      guide: {
        desktop: 'https://rabby.io/',
      },
      downloadLink: {
        desktop: 'https://rabby.io/',
      },
      qrCode,
      MEVSupported: true,
    },
    {
      id: WalletIds.Math,
      title: 'MathWallet',
      icon: `${ASSET_CDN}/web/wallets/mathwallet.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isMathWalletInstalled()
      },
      qrCode,
    },
    {
      id: WalletIds.Tokenpocket,
      title: 'TokenPocket',
      icon: `${ASSET_CDN}/web/wallets/tokenpocket.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isTokenPocketInstalled()
      },
      qrCode,
    },
    {
      id: WalletIds.SafePal,
      title: 'SafePal',
      icon: `${ASSET_CDN}/web/wallets/safepal.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isSafePalInstalled()
      },
      downloadLink: 'https://safepal.com/en/extension',
      qrCode,
    },
    {
      id: WalletIds.Coin98,
      title: 'Coin98',
      icon: `${ASSET_CDN}/web/wallets/coin98.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isCoin98Installed()
      },
      qrCode,
    },
    {
      id: WalletIds.Cyberwallet,
      title: 'CyberWallet',
      icon: `${ASSET_CDN}/web/wallets/cyberwallet.png`,
      connectorId: EvmConnectorNames.Injected,
      networks: [WalletAdaptedNetwork.EVM],
      get installed() {
        return isCyberWalletInstalled()
      },
      isNotExtension: true,
      guide: {
        desktop: 'https://docs.cyber.co/sdk/cyber-account#supported-chains',
      },
    },
  ]
}
