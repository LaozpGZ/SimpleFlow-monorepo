import { ModalV2Props } from '@pancakeswap/uikit'
import { EvmConnectorNames, SolanaConnectorNames } from '../../config/connectorNames'
import { ConnectData, WalletConfigV3 } from '../../types'

export interface MultichainWalletModalProps extends ModalV2Props {
  wallets?: WalletConfigV3[]
  topWallets?: WalletConfigV3[]
  evmLogin: (connectorID: EvmConnectorNames) => Promise<ConnectData | undefined>
  solanaLogin: (connectorID: SolanaConnectorNames) => Promise<ConnectData | undefined>
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
