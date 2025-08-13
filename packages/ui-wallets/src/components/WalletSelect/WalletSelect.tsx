import { useTranslation } from '@pancakeswap/localization'
import { Column } from '@pancakeswap/uikit'
import { useCallback, useMemo } from 'react'
import uniqBy from 'lodash/uniqBy'
import { WalletAdaptedNetwork, WalletConfigV3 } from '../../types'
import { scrollbarClass } from '../WalletModal.css'
import { MoreWalletSection } from './MoreWalletSection'
import { WalletSelectItem, WalletSelectSection } from './WalletSelectSection'

export type WalletSelectProps = {
  wallets: WalletConfigV3[]
  topWallets: WalletConfigV3[]
  previouslyUsedWallets: [WalletConfigV3[], WalletConfigV3[]]
  solanaOnly?: boolean
  onMultiChainWalletSelected?: (wallet: WalletConfigV3) => void
  onWalletSelected?: (wallet: WalletConfigV3, network: WalletAdaptedNetwork) => void
  style?: React.CSSProperties
}

export const WalletSelect: React.FC<WalletSelectProps> = ({
  wallets,
  topWallets,
  previouslyUsedWallets,
  solanaOnly,
  onMultiChainWalletSelected,
  onWalletSelected,
  style = {},
}) => {
  const { t } = useTranslation()

  const moreWallets = useMemo(() => {
    return wallets.filter(
      (wallet) =>
        !(
          topWallets.includes(wallet) ||
          previouslyUsedWallets?.[0]?.includes(wallet) ||
          previouslyUsedWallets?.[1]?.includes(wallet)
        ),
    )
  }, [wallets, topWallets, previouslyUsedWallets])

  const previous = useMemo(() => {
    return uniqBy([...(previouslyUsedWallets?.[0] ?? []), ...(previouslyUsedWallets?.[1] ?? [])], 'id')
  }, [previouslyUsedWallets])

  const topWallets_ = useMemo(() => {
    return topWallets.filter((wallet) => !previous.some((prev) => prev.id === wallet.id))
  }, [topWallets, previous])

  const handleWalletClick = useCallback(
    (wallet: WalletConfigV3) => {
      if (solanaOnly) {
        if (wallet.networks.includes(WalletAdaptedNetwork.Solana)) {
          onWalletSelected?.(wallet, WalletAdaptedNetwork.Solana)
        }
        return
      }

      if (wallet.networks.length === 1) {
        onWalletSelected?.(wallet, wallet.networks[0])
        return
      }

      onMultiChainWalletSelected?.(wallet)
    },
    [solanaOnly],
  )

  return (
    <Column
      overflowY="auto"
      overflowX="hidden"
      gap="16px"
      style={{ paddingRight: '16px', marginRight: '-24px', ...style }}
      className={scrollbarClass}
    >
      {previous?.length && (
        <WalletSelectSection label={t('Previously used')}>
          {previous.map((wallet) => (
            <WalletSelectItem key={wallet.id} wallet={wallet} onClick={handleWalletClick} />
          ))}
        </WalletSelectSection>
      )}
      {topWallets_.length > 0 && (
        <WalletSelectSection label={t('Top Wallets')}>
          {topWallets_.map((wallet) => (
            <WalletSelectItem key={wallet.id} wallet={wallet} onClick={handleWalletClick} />
          ))}
        </WalletSelectSection>
      )}
      <MoreWalletSection onClick={handleWalletClick} wallets={moreWallets} />
    </Column>
  )
}
