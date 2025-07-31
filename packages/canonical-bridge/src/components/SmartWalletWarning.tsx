import { useBytecode } from 'wagmi'
import { useTranslation } from '@pancakeswap/localization'
import { Message, MessageText } from '@pancakeswap/uikit'
import { useChainFromWidget } from '../hooks/useChainFromWidget'
import { chains } from '../configs'
import { useInputObserver } from '../hooks/useInputObserver'

export const SmartWalletWarning = () => {
  const fromChain = useChainFromWidget('from')
  const toChain = useChainFromWidget('to')
  const accountValue = useInputObserver('.bccb-widget-to-account-input input')

  const { t } = useTranslation()

  const selectedChainName = fromChain === 'solana' ? toChain : fromChain

  const chainId = chains.find((chain) => chain.name.toLowerCase() === selectedChainName?.toLowerCase())?.id

  const { data: evmBytecode } = useBytecode({
    address: accountValue as `0x${string}`,
    chainId,
    query: {
      enabled: Boolean(accountValue && chainId),
    },
  })

  const isSmartWallet = Boolean(evmBytecode && evmBytecode !== '0x')

  if (!isSmartWallet) return null

  return (
    <Message variant="warning" m="16px 0">
      <MessageText>
        {t(
          'Smart contract wallets are currently not supported on Bridge. To continue, please switch back to an EOA (Externally Owned Account) wallet before interacting with the product.',
        )}
      </MessageText>
    </Message>
  )
}
