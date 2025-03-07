import { useTranslation } from '@pancakeswap/localization'
import { Button } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { HomepageChain, HomePageCurrency } from 'pages/api/home/types'
import React from 'react'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'
import { MultipleCurrencyLogos } from './component/MultipleCurrencyLogos'

interface BridgeAndBuyCryptoCardProps {
  chains: HomepageChain[]
  currencies: HomePageCurrency[]
}

export const BridgeCryptoCard: React.FC<BridgeAndBuyCryptoCardProps> = ({ chains, currencies }) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <CardSection title={t('Bridge & Buy Crypto')} subtitle={t('Seamlessly')}>
      <CardRowLayout
        left={<MultipleCurrencyLogos maxDisplay={4} tokens={chains.map((chain) => ({ logo: chain.logo }))} />}
      >
        <Button scale="sm" onClick={() => router.push('/bridge')}>
          {t('Bridge Now')} →
        </Button>
      </CardRowLayout>

      <CardRowLayout
        left={<MultipleCurrencyLogos maxDisplay={4} tokens={currencies.map((currency) => ({ logo: currency.logo }))} />}
        isLast
      >
        <Button scale="sm" onClick={() => router.push('/swap')}>
          {t('Buy Crypto Now')} →
        </Button>
      </CardRowLayout>
    </CardSection>
  )
}
