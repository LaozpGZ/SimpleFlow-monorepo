import { Currency } from '@pancakeswap/sdk'
import { Box } from '@pancakeswap/uikit'
import { useSetAtom } from 'jotai'
import React, { useCallback, useState } from 'react'
import { styled } from 'styled-components'
import { chartPriceDataAtom, livePriceDataAtom } from './atom/chartPriceDataAtom'
import PriceHeader from './PriceHeader'
import TradingViewChart from './TradingViewChart'

interface ChartWithPriceHeaderProps {
  symbol?: string
  currency0?: Currency
  currency1?: Currency
  theme?: 'Light' | 'Dark'
}

const Container = styled(Box)`
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: ${({ theme }) => theme.card.background};
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  ${({ theme }) => theme.mediaQueries.md} {
    height: fit-content;
  }
`

const ChartWithPriceHeader: React.FC<ChartWithPriceHeaderProps> = ({
  symbol = 'CAKE/BNB',
  currency0,
  currency1,
  theme = 'Dark',
}) => {
  const [isReversed, setIsReversed] = useState(false)
  const setPriceData = useSetAtom(chartPriceDataAtom)
  const setLivePriceData = useSetAtom(livePriceDataAtom)

  const on24HPriceDataChange = useCallback((h: number, l: number, c: number, changes: number) => {
    setPriceData({
      price: c,
      priceChangePercent: changes,
      high24h: h,
      low24h: l,
    })
  }, [])
  const onLiveDataChanges = useCallback((c: number, subscriptionId: string) => {
    console.log('c', c)
    console.log('subscriptionId', subscriptionId)
    setLivePriceData((prev) => ({
      ...prev,
      [subscriptionId]: c,
    }))
  }, [])

  return (
    <Container>
      <PriceHeader
        symbol={symbol}
        currency0={currency0}
        currency1={currency1}
        isReversed={isReversed}
        setIsReversed={setIsReversed}
      />
      <TradingViewChart
        theme={theme}
        currency0={isReversed ? currency1 : currency0}
        currency1={isReversed ? currency0 : currency1}
        on24HPriceDataChange={on24HPriceDataChange}
        // @ts-ignore
        onLiveDataChanges={onLiveDataChanges}
      />
    </Container>
  )
}

export default ChartWithPriceHeader
