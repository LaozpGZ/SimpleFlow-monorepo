import { Currency } from '@pancakeswap/sdk'
import { Flex, FlexGap, SkeletonV2, SwapHorizIcon, Text } from '@pancakeswap/uikit'
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
  const maxDecimalsDigit = price > 1 ? 2 : 6
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
          <SkeletonV2 height="24px" width="120px" isDataReady={Boolean(currency0 && currency1)}>
            <Text bold fontSize="18px">
              {isReversed ? `${currency1?.symbol}/${currency0?.symbol}` : symbol}
            </Text>
          </SkeletonV2>
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
            <SkeletonV2 height="14px" minHeight="auto" width="40px" isDataReady={priceChangePercent !== -1}>
              <PriceChange isPositive={priceChangePercent > 0}>
                {priceChangePercent.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
                %
              </PriceChange>
            </SkeletonV2>
          </StatItem>
          <StatItem>
            <Text fontSize="12px" color="textSubtle">
              24h High
            </Text>
            <SkeletonV2 height="14px" minHeight="auto" width="40px" isDataReady={high24h !== -1}>
              <Text bold>
                {high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: maxDecimalsDigit })}
              </Text>
            </SkeletonV2>
          </StatItem>

          <StatItem>
            <Text fontSize="12px" color="textSubtle">
              24h Low
            </Text>
            <SkeletonV2 height="14px" minHeight="auto" width="40px" isDataReady={low24h !== -1}>
              <Text bold>
                {low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: maxDecimalsDigit })}
              </Text>
            </SkeletonV2>
          </StatItem>
        </FlexGap>
        <SkeletonV2 height="24px" minHeight="auto" width="90px" isDataReady={price !== -1}>
          <PriceText>
            {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: maxDecimalsDigit })}
          </PriceText>
        </SkeletonV2>
      </PriceInfo>
    </Container>
  )
}

export default PriceHeader
