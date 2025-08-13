import { AtomBox, Heading, Image, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useAtomValue } from 'jotai'
import { errorEvmAtom, errorSolanaAtom } from '../../state/atom'
import { WalletAdaptedNetwork, WalletConfigV3 } from '../../types'
import { ErrorContent } from '../ErrorContent'

export type ConfirmingProps = {
  wallet: WalletConfigV3
  network: WalletAdaptedNetwork
  reConnect: (wallet: WalletConfigV3, network: WalletAdaptedNetwork) => void
}

export const Confirming: React.FC<ConfirmingProps> = ({ wallet, network, reConnect }) => {
  const { t } = useTranslation()
  const evmError = useAtomValue(errorEvmAtom)
  const solanaError = useAtomValue(errorSolanaAtom)
  const error = network === WalletAdaptedNetwork.EVM ? evmError : solanaError

  return (
    <AtomBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ gap: '12px' }}
      textAlign="center"
      width="100%"
    >
      <>
        {typeof wallet.icon === 'string' && (
          <Image src={wallet.icon} width={108} height={108} style={{ borderRadius: '24px', overflow: 'hidden' }} />
        )}
        <Heading as="h1" fontSize="20px" color="secondary">
          {t('Opening')} {wallet.title}
        </Heading>
        {error ? (
          <ErrorContent message={error} onRetry={() => reConnect(wallet, network)} />
        ) : (
          <Text>{t('Please confirm in %wallet%', { wallet: wallet.title })}</Text>
        )}
      </>
    </AtomBox>
  )
}
