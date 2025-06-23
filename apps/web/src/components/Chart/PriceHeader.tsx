import { Currency } from '@pancakeswap/sdk'
import { Flex, FlexGap, SwapHorizIcon, Text } from '@pancakeswap/uikit'
import { DoubleCurrencyLogo } from '@pancakeswap/widgets-internal'
import { useAtomValue } from 'jotai'
import React from 'react'
import { styled } from 'styled-components'
import { chartPriceDataAtom } from './atom/chartPriceDataAtom'

interface PriceHeaderProps {
  symbol?: string
  currency0?: Currency
  currency1?: Currency
  isReversed: boolean
  setIsReversed: (isReversed: boolean) => void
}

const Container = styled(Flex)`
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 16px 16px 0 0;
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
`

const TokenSymbol = styled(Flex)`
  align-items: center;
  gap: 8px;
`

const PriceInfo = styled(Flex)`
  align-items: center;
  gap: 16px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
`

const PriceText = styled(Text)`
  font-size: 24px;
  font-weight: 600;

  @media (max-width: 576px) {
    font-size: 20px;
  }
`

const PriceChange = styled(Text)<{ isPositive: boolean }>`
  color: ${({ isPositive, theme }) => (isPositive ? theme.colors.success : theme.colors.failure)};
  font-size: 14px;
  font-weight: 600;
`

const StatItem = styled(Flex)`
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`

const PriceHeader: React.FC<PriceHeaderProps> = ({
  symbol = 'CAKE/BNB',
  currency0,
  currency1,
  isReversed,
  setIsReversed,
}) => {
  const { price, priceChangePercent, high24h, low24h } = useAtomValue(chartPriceDataAtom)
  return (
    <Container>
      <FlexGap gap="8px">
        <TokenSymbol>
          <DoubleCurrencyLogo
            currency0={isReversed ? currency1 : currency0}
            currency1={isReversed ? currency0 : currency1}
            size={24}
            margin
            innerMargin="-8px"
          />
          <Text bold fontSize="18px">
            {isReversed ? `${currency1?.symbol}/${currency0?.symbol}` : symbol}
          </Text>
        </TokenSymbol>
        <SwapHorizIcon
          color="primary"
          width="24px"
          height="24px"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsReversed(!isReversed)}
        />
      </FlexGap>

      <PriceInfo>
        <FlexGap gap="16px">
          <StatItem>
            <Text fontSize="12px" color="textSubtle">
              24h Change
            </Text>
            <PriceChange isPositive={priceChangePercent > 0}>
              {priceChangePercent.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
              %
            </PriceChange>
          </StatItem>
          <StatItem>
            <Text fontSize="12px" color="textSubtle">
              24h High
            </Text>
            <Text bold>{high24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</Text>
          </StatItem>

          <StatItem>
            <Text fontSize="12px" color="textSubtle">
              24h Low
            </Text>
            <Text bold>{low24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</Text>
          </StatItem>
        </FlexGap>
        <PriceText>{price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</PriceText>
      </PriceInfo>
    </Container>
  )
}

export default PriceHeader
