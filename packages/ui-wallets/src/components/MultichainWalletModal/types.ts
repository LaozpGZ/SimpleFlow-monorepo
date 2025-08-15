import { ModalV2Props } from '@pancakeswap/uikit'
import { WalletName } from '@solana/wallet-adapter-base'
import { ConnectData, WalletConfigV3 } from '../../types'

export interface MultichainWalletModalProps extends ModalV2Props {
  evmAddress?: string
  solanaAddress?: string
  wallets?: WalletConfigV3[]
  topWallets?: WalletConfigV3[]
  evmLogin: (wallet: WalletConfigV3) => Promise<ConnectData | undefined>
  createEvmQrCode?: () => () => Promise<string>
  solanaLogin: (walletName: WalletName) => void
  onWalletConnectCallBack?: (walletTitle?: string, address?: string) => void
  fullSize?: boolean
  docText: string
  docLink: string
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
  onReopenWalletModal?: () => void
}
