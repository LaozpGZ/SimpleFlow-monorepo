import { useTranslation } from '@pancakeswap/localization'
import { Message, MessageText } from '@pancakeswap/uikit'
import { useIsSmartContract } from 'hooks/useIsSmartContract'
import { useAccount } from 'wagmi'

const SmartWalletWarning = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const isSmartWallet = useIsSmartContract(address)

  if (!isSmartWallet) return null

  return (
    <Message variant="warning" m="16px 0">
      <MessageText>
        {t(
          'Smart contract wallets are currently not supported on Prediction. To continue, please switch back to an EOA (Externally Owned Account) wallet before interacting with the product.',
        )}
      </MessageText>
    </Message>
  )
}

export default SmartWalletWarning
