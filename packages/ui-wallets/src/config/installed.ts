import { getTrustWalletProvider } from '@pancakeswap/wagmi/connectors/trustWallet'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
import { isCyberWallet } from '@cyberlab/cyber-app-sdk'

function safeCheck<T>(fn: () => T): T | false {
  try {
    return fn()
  } catch {
    return false
  }
}

export const isMetamaskInstalled = () => {
  if (!safeGetWindow()) {
    return false
  }

  try {
    if (window.ethereum?.isMetaMask) {
      // binance wallet doesn't support metamask
      // @ts-ignore
      return !window.ethereum?.isBinance
    }

    // @ts-ignore
    if (window.ethereum?.providers?.some((p) => p.isMetaMask)) {
      return true
    }
  } catch (e) {
    return false
  }

  return false
}

export const isBinanceWeb3WalletInstalled = (): boolean =>
  Boolean(safeCheck(() => safeGetWindow()?.isBinance) || safeCheck(() => safeGetWindow()?.binancew3w))

export const isTrustWalletInstalled = () => {
  return !!getTrustWalletProvider()
}

export const isOkxWalletInstalled = (): boolean => Boolean(safeCheck(() => safeGetWindow()?.okxwallet))

export const isOperaWalletInstalled = (): boolean => Boolean(safeCheck(() => safeGetWindow()?.ethereum?.isOpera))

export const isBraveWalletInstalled = (): boolean => Boolean(safeCheck(() => safeGetWindow()?.ethereum?.isBraveWallet))

export const isRabbyWalletInstalled = (): boolean => Boolean(safeCheck(() => safeGetWindow()?.ethereum?.isRabby))

export const isMathWalletInstalled = (): boolean => Boolean(safeCheck(() => safeGetWindow()?.ethereum?.isMathWallet))

export const isTokenPocketInstalled = (): boolean =>
  Boolean(safeCheck(() => safeGetWindow()?.ethereum?.isTokenPocket) || safeCheck(() => safeGetWindow()?.tokenpocket))

export const isSafePalInstalled = (): boolean => Boolean(safeCheck(() => safeGetWindow()?.ethereum?.isSafePal))

export const isCoin98Installed = (): boolean =>
  Boolean(safeCheck(() => safeGetWindow()?.ethereum?.isCoin98) || safeCheck(() => safeGetWindow()?.coin98))

export const isCyberWalletInstalled = (): boolean => Boolean(safeCheck(() => safeGetWindow() && isCyberWallet()))

export const isPhantomWalletInstalled = (): boolean =>
  Boolean(safeCheck(() => safeGetWindow()?.phantom?.solana?.isPhantom))
