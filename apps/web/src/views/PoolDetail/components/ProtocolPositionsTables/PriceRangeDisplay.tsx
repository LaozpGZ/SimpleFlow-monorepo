import { useTranslation } from '@pancakeswap/localization'
import { Flex, FlexGap, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

const PriceRangeBar = styled.div<{ position: number; outOfRange: boolean }>`
  width: 80px;
  height: 4px;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 2px;
  position: relative;
  margin-top: 2px;

  &::after {
    content: '';
    position: absolute;
    left: ${({ position }) => Math.max(0, Math.min(100, position))}%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme, outOfRange }) => (outOfRange ? theme.colors.failure : theme.colors.success)};
    border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ position, outOfRange }) => (outOfRange ? '0%' : `${Math.max(0, Math.min(100, position))}%`)};
    background: ${({ theme, outOfRange }) => (outOfRange ? 'transparent' : theme.colors.success)};
    border-radius: 2px;
  }
`

const PercentageText = styled(Text)<{ isNegative?: boolean }>`
  color: ${({ theme, isNegative }) => (isNegative ? theme.colors.failure : theme.colors.success)};
  font-size: 11px;
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

  // Check if we have infinity values
  const hasInfinity = minPrice.includes('∞') || maxPrice.includes('∞')

  return (
    <Flex flexDirection="column" alignItems="flex-start" width="100%">
      {/* Price Range - Bold and separated */}
      <FlexGap alignItems="center" gap="8px" mb="4px">
        <Text fontSize="16px" bold style={{ fontFamily: hasInfinity ? 'monospace' : 'inherit' }}>
          {minPrice} - {maxPrice}
        </Text>
        {outOfRange && (
          <Text fontSize="12px" color="failure">
            {t('Out of range')}
          </Text>
        )}
      </FlexGap>

      {/* Progress bar with percentages - only show if not infinity and percentages exist */}
      {showPercentages && minPercentage && maxPercentage && !hasInfinity && (
        <FlexGap alignItems="center" gap="8px" width="100%" mb="4px">
          <PercentageText isNegative={minPercentage.includes('-')}>{minPercentage}</PercentageText>

          <PriceRangeBar position={rangePosition} outOfRange={outOfRange} />

          <PercentageText isNegative={maxPercentage.includes('-')}>{maxPercentage}</PercentageText>
        </FlexGap>
      )}

      {/* Show special message for infinity ranges */}
      {hasInfinity && (
        <Text color="textSubtle" fontSize="12px" mb="4px">
          {minPrice === '0' && maxPrice === '∞'
            ? t('Full range')
            : minPrice === '∞' && maxPrice === '∞'
            ? t('Invalid range')
            : t('Unbounded range')}
        </Text>
      )}

      {/* Token pair label */}
      <Text color="textSubtle" fontSize="12px">
        {token0Symbol} per {token1Symbol}
      </Text>
    </Flex>
  )
}
