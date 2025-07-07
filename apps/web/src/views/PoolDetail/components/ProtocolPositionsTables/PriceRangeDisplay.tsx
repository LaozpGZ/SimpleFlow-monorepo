import { useTranslation } from '@pancakeswap/localization'
import { Flex, FlexGap, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

const PriceRangeContainer = styled.div`
  position: relative;
  width: 180px;
  height: 20px;
  display: flex;
  align-items: center;
`

const PriceRangeBar = styled.div<{ outOfRange: boolean }>`
  width: 100%;
  height: 6px;
  background: ${({ theme, outOfRange }) => (outOfRange ? theme.colors.failure : theme.colors.success)};
  border-radius: 2px;
  position: relative;
`

const CurrentPriceLine = styled.div<{ position: number; outOfRange: boolean }>`
  position: absolute;
  left: ${({ position }) => Math.max(0, Math.min(100, position))}%;
  top: 2px;
  transform: translateX(-50%);
  width: 4px;
  height: 16px;
  background: ${({ theme, outOfRange }) => (outOfRange ? theme.colors.failure : theme.colors.success)};
  border-radius: 1px;
  z-index: 1;
`

const PercentageText = styled(Text)<{ isNegative?: boolean }>`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px;
  font-weight: 400;
`

interface PriceRangeDisplayProps {
  minPrice: string
  maxPrice: string
  minPercentage?: string
  maxPercentage?: string
  rangePosition?: number
  token0Symbol: string
  token1Symbol: string
  outOfRange?: boolean
  removed?: boolean
  showPercentages?: boolean
}

export const PriceRangeDisplay: React.FC<PriceRangeDisplayProps> = ({
  minPrice,
  maxPrice,
  minPercentage,
  maxPercentage,
  rangePosition = 50,
  token0Symbol,
  token1Symbol,
  outOfRange = false,
  removed = false,
  showPercentages = false,
}) => {
  const { t } = useTranslation()

  if (removed) {
    return (
      <Flex flexDirection="column" alignItems="flex-start">
        <Text fontSize="16px" bold color="textSubtle">
          --
        </Text>
        <Text color="textSubtle" fontSize="12px">
          {t('Closed')}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="flex-start" width="100%">
      {/* Price range display */}
      <FlexGap alignItems="center" gap="8px" mb="2px" width="100%" maxWidth="190px">
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          <Text fontSize="16px" bold>
            {minPrice}
          </Text>
          <Text fontSize="16px" bold>
            -
          </Text>
          <Text fontSize="16px" bold>
            {maxPrice}
          </Text>
        </Flex>
      </FlexGap>

      {/* Percentage display below prices */}
      {showPercentages && minPercentage && maxPercentage && (
        <>
          <FlexGap alignItems="center" justifyContent="space-between" width="100%" maxWidth="190px" mb="4px">
            <PercentageText>{minPercentage}</PercentageText>
            <PercentageText>{maxPercentage}</PercentageText>
          </FlexGap>

          {/* Price range bar */}
          <Flex width="100%" maxWidth="190px" justifyContent="center" mb="4px">
            <PriceRangeContainer>
              <PriceRangeBar outOfRange={outOfRange} />
              <CurrentPriceLine position={rangePosition} outOfRange={outOfRange} />
            </PriceRangeContainer>
          </Flex>
        </>
      )}
    </Flex>
  )
}
