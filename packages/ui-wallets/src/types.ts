import { ModalV2Props, SvgProps } from '@pancakeswap/uikit'

type LinkOfTextAndLink = string | { text: string; url: string }

type DeviceLink = {
  desktop?: LinkOfTextAndLink
  mobile?: LinkOfTextAndLink
}

export type LinkOfDevice = string | DeviceLink

export enum WalletAdaptedNetwork {
  EVM = 'evm',
  Solana = 'solana',
}

export enum WalletIds {
  Injected = 'injected',

  // Multi-Chain Wallets (EVM + Solana)
  Metamask = 'metamask',
  Okx = 'okx',
  BinanceW3W = 'BinanceW3W',
  Trust = 'trust',
  Tokenpocket = 'tokenpocket',
  Coin98 = 'coin98',
  SafePal = 'safePal',
  Walletconnect = 'walletconnect',
  Coinbase = 'coinbase',
  Math = 'math',

  // EVM Only Wallets
  Opera = 'opera',
  Brave = 'brave',
  Rabby = 'rabby',
  // Blocto = 'blocto',
  Cyberwallet = 'cyberwallet',
  Petra = 'petra',
  Martian = 'martian',
  Pontem = 'pontem',
  Fewcha = 'fewcha',
  Rise = 'rise',
  Msafe = 'msafe',

  // Solana Only Wallets
  Phantom = 'phantom', // Not support BNB Chain/ Arbitrum yet, mark as Solana only now
  Solflare = 'solflare',
  Slope = 'slope',
  Torus = 'torus',
  Glow = 'glow',
  BitPie = 'bitpie',
  BitGet = 'bitget',
  Exodus = 'exodus',
  Backpack = 'backpack',
  Solong = 'solong',
}

export type WalletConfigV2<T = unknown> = {
  id: WalletIds
  title: string
  icon: string | React.FC<React.PropsWithChildren<SvgProps>>
  connectorId: T
  deepLink?: string
  installed?: boolean
  guide?: LinkOfDevice
  downloadLink?: LinkOfDevice
  mobileOnly?: boolean
  qrCode?: (cb?: () => void) => Promise<string>
  isNotExtension?: boolean
  MEVSupported?: boolean
}

export type WalletConfigV3<T = unknown> = WalletConfigV2<T> & {
  networks: Array<WalletAdaptedNetwork>
}

export type ConnectData = {
  accounts: readonly [string, ...string[]]
  chainId: number | string | undefined
}

export interface WalletModalV2Props<T = unknown> extends ModalV2Props {
  wallets: WalletConfigV2<T>[]
  topWallets: WalletConfigV2<T>[]
  login: (connectorID: T) => Promise<ConnectData | undefined>
  docLink: string
  docText: string
  mevDocLink: string | null
  onWalletConnectCallBack?: (walletTitle?: string, address?: string) => void
  fullSize?: boolean
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
  onReopenWalletModal?: () => void
}

export interface WalletModalV3Props<T = unknown> extends ModalV2Props {
  wallets: WalletConfigV3<T>[]
  topWallets: WalletConfigV3<T>[]
  login: (connectorID: T) => Promise<ConnectData | undefined>
  docLink: string
  docText: string
  mevDocLink: string | null
  onWalletConnectCallBack?: (walletTitle?: string, address?: string) => void
  fullSize?: boolean
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
  onReopenWalletModal?: () => void
}
