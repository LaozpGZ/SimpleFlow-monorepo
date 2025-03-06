import { Button } from '@pancakeswap/uikit'
import { HomepageChain, HomePageCurrency } from 'pages/api/home/types'
import React from 'react'
import { CardRowLayout } from './CardRowLayout'
import { CardSection } from './CardSection'
import { MultipleCurrencyLogos } from './component/MultipleCurrencyLogos'

interface BridgeAndBuyCryptoCardProps {
  chains: HomepageChain[]
  currencies: HomePageCurrency[]
}

export const BridgeCryptoCard: React.FC<BridgeAndBuyCryptoCardProps> = ({ chains, currencies }) => {
  return (
    <CardSection title="Bridge & Buy Crypto" subtitle="Seamlessly">
      <CardRowLayout
        icon={<MultipleCurrencyLogos maxDisplay={4} tokens={chains.map((chain) => ({ logo: chain.logo }))} />}
      >
        <Button scale="sm">Bridge Now →</Button>
      </CardRowLayout>

      <CardRowLayout
        icon={<MultipleCurrencyLogos maxDisplay={4} tokens={currencies.map((currency) => ({ logo: currency.logo }))} />}
        isLast
      >
        <Button scale="sm">Buy Crypto Now →</Button>
      </CardRowLayout>
    </CardSection>
  )
}
