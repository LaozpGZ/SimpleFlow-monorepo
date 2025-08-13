import { useTranslation } from '@pancakeswap/localization'
import { Column } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import uniqBy from 'lodash/uniqBy'
import { WalletAdaptedNetwork, WalletConfigV3 } from '../../types'
import { scrollbarClass } from '../WalletModal.css'
import { MoreWalletSection } from './MoreWalletSection'
import { WalletSelectItem, WalletSelectSection } from './WalletSelectSection'

export type WalletSelectProps = {
  wallets: WalletConfigV3[]
  topWallets: WalletConfigV3[]
  previouslyUsedWallets: [WalletConfigV3[], WalletConfigV3[]]
  onClick: (wallet: WalletConfigV3, network: WalletAdaptedNetwork) => void
  displayCount?: number | 'all'
  style?: React.CSSProperties
}

export const WalletSelect: React.FC<WalletSelectProps> = ({
  wallets,
  topWallets,
  previouslyUsedWallets,
  onClick,
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

  return (
    <Column
      overflowY="auto"
      overflowX="hidden"
      gap="16px"
      style={{ paddingRight: '16px', marginRight: '-24px', ...style }}
      className={scrollbarClass}
    >
      <WalletSelectSection label={t('Previously used')}>
        {previous.map((wallet) => (
          <WalletSelectItem key={wallet.id} wallet={wallet} onClick={onClick} />
        ))}
      </WalletSelectSection>
      <WalletSelectSection label={t('Top Wallets')}>
        {topWallets.map((wallet) => (
          <WalletSelectItem key={wallet.id} wallet={wallet} onClick={onClick} />
        ))}
      </WalletSelectSection>
      <MoreWalletSection onClick={onClick} wallets={moreWallets} />
    </Column>
  )
}
