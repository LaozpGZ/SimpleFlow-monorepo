import { injected } from 'wagmi/connectors'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
import { WalletAdaptedNetwork, WalletConfigV3 } from '../types'
import { WalletIds } from './walletIds'
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
  isPhantomWalletInstalled,
  isRabbyWalletInstalled,
  isSafePalInstalled,
  isTokenPocketInstalled,
  isTrustWalletInstalled,
} from './installed'
import { ASSET_CDN } from './url'

function getBinanceConnectorId() {
  const globalWindow = safeGetWindow()

  if (!globalWindow) return EvmConnectorNames.BinanceW3W

  // use Binance App
  if (globalWindow.isBinance) return EvmConnectorNames.Injected

  // use Binance Web3 Wallet Extension
  if (globalWindow.binancew3w) return EvmConnectorNames.BinanceW3W

  return EvmConnectorNames.BinanceW3W
}

export const getWalletsConfig = (solanaOnly: boolean): WalletConfigV3[] => {
  // const qrCode = createQrCode(chainId, connect)
  // const qrCode = () => Promise.resolve('')
  const wallets = [
    {
      id: WalletIds.Metamask,
      title: 'Metamask',
      icon: `${ASSET_CDN}/web/wallets/metamask.png`,
      networks: [WalletAdaptedNetwork.EVM, WalletAdaptedNetwork.Solana],
      get installed() {
        return isMetamaskInstalled()
      },
      connectorId: EvmConnectorNames.Injected, // may conflict with solana connector
      deepLink: 'https://metamask.app.link/dapp/pancakeswap.finance/',
      // qrCode,
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
      // qrCode,
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
      // qrCode,
    },
    {
      id: WalletIds.BinanceW3W,
      title: 'Binance Wallet',
      icon: `${ASSET_CDN}/web/wallets/binance-w3w.png`,
      connectorId: EvmConnectorNames.Injected,
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
      // qrCode,
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
      // qrCode,
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
      // qrCode,
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
      // qrCode,
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
      // qrCode,
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

    {
      id: WalletIds.Phantom,
      title: 'Phantom',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9IiNBQjlGRjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00Ni41MjY3IDY5LjkyMjlDNDIuMDA1NCA3Ni44NTA5IDM0LjQyOTIgODUuNjE4MiAyNC4zNDggODUuNjE4MkMxOS41ODI0IDg1LjYxODIgMTUgODMuNjU2MyAxNSA3NS4xMzQyQzE1IDUzLjQzMDUgNDQuNjMyNiAxOS44MzI3IDcyLjEyNjggMTkuODMyN0M4Ny43NjggMTkuODMyNyA5NCAzMC42ODQ2IDk0IDQzLjAwNzlDOTQgNTguODI1OCA4My43MzU1IDc2LjkxMjIgNzMuNTMyMSA3Ni45MTIyQzcwLjI5MzkgNzYuOTEyMiA2OC43MDUzIDc1LjEzNDIgNjguNzA1MyA3Mi4zMTRDNjguNzA1MyA3MS41NzgzIDY4LjgyNzUgNzAuNzgxMiA2OS4wNzE5IDY5LjkyMjlDNjUuNTg5MyA3NS44Njk5IDU4Ljg2ODUgODEuMzg3OCA1Mi41NzU0IDgxLjM4NzhDNDcuOTkzIDgxLjM4NzggNDUuNjcxMyA3OC41MDYzIDQ1LjY3MTMgNzQuNDU5OEM0NS42NzEzIDcyLjk4ODQgNDUuOTc2OCA3MS40NTU2IDQ2LjUyNjcgNjkuOTIyOVpNODMuNjc2MSA0Mi41Nzk0QzgzLjY3NjEgNDYuMTcwNCA4MS41NTc1IDQ3Ljk2NTggNzkuMTg3NSA0Ny45NjU4Qzc2Ljc4MTYgNDcuOTY1OCA3NC42OTg5IDQ2LjE3MDQgNzQuNjk4OSA0Mi41Nzk0Qzc0LjY5ODkgMzguOTg4NSA3Ni43ODE2IDM3LjE5MzEgNzkuMTg3NSAzNy4xOTMxQzgxLjU1NzUgMzcuMTkzMSA4My42NzYxIDM4Ljk4ODUgODMuNjc2MSA0Mi41Nzk0Wk03MC4yMTAzIDQyLjU3OTVDNzAuMjEwMyA0Ni4xNzA0IDY4LjA5MTYgNDcuOTY1OCA2NS43MjE2IDQ3Ljk2NThDNjMuMzE1NyA0Ny45NjU4IDYxLjIzMyA0Ni4xNzA0IDYxLjIzMyA0Mi41Nzk1QzYxLjIzMyAzOC45ODg1IDYzLjMxNTcgMzcuMTkzMSA2NS43MjE2IDM3LjE5MzFDNjguMDkxNiAzNy4xOTMxIDcwLjIxMDMgMzguOTg4NSA3MC4yMTAzIDQyLjU3OTVaIiBmaWxsPSIjRkZGREY4Ii8+Cjwvc3ZnPg==',
      connectorId: SolanaConnectorNames.Phantom,
      networks: [WalletAdaptedNetwork.Solana],
      get installed() {
        return isPhantomWalletInstalled()
      },
    },
  ]

  if (solanaOnly) {
    return wallets.filter((wallet) =>
      wallet.networks.includes(WalletAdaptedNetwork.Solana),
    ) as WalletConfigV3<SolanaConnectorNames>[]
  }

  return wallets as WalletConfigV3[]
}

export const TOP_WALLETS_ID_CONFIG = {
  MultiChain: [WalletIds.Metamask, WalletIds.BinanceW3W],
  Evm: [WalletIds.Metamask, WalletIds.BinanceW3W, WalletIds.Okx],
  Solana: [WalletIds.Phantom, WalletIds.Solflare, WalletIds.Backpack],
}

export const getTopWalletsConfig = (wallets: WalletConfigV3[], solanaOnly: boolean): WalletConfigV3[] => {
  if (solanaOnly) {
    return TOP_WALLETS_ID_CONFIG.Solana.map((id) => wallets.find((wallet) => wallet.id === id)).filter(
      Boolean,
    ) as WalletConfigV3<SolanaConnectorNames>[]
  }

  return TOP_WALLETS_ID_CONFIG.MultiChain.map((id) => wallets.find((wallet) => wallet.id === id)).filter(
    Boolean,
  ) as WalletConfigV3[]
}
