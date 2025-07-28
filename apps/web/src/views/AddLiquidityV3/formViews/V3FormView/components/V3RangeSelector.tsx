import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price, Token } from '@pancakeswap/sdk'
import { AutoColumn, FlexGap, Text, Input, Button, Box, RowBetween, useMatchBreakpoints } from '@pancakeswap/uikit'
import { priceToClosestTick, FeeAmount } from '@pancakeswap/v3-sdk'
import { ZoomLevels } from '@pancakeswap/widgets-internal'
import { Bound } from 'config/constants/types'
import { useMemo, useState, useCallback } from 'react'
import { formatRangeSelectorPrice } from 'utils/formatRangeSelectorPrice'
import { styled } from 'styled-components'
import { QUICK_ACTION_CONFIGS } from 'views/AddLiquidityV3/types'
import StepCounter from './StepCounter'

const CustomInputContainer = styled(Box)<{ $small?: boolean }>`
  position: relative;
  max-width: 120px;

  ${({ $small }) =>
    $small
      ? `
          height: 40px;
          width: 30%;
        `
      : `
          height: 56px;
          width: 100%;
        `}
`

const StyledInput = styled(Input)<{ $isValid?: boolean }>`
  height: 100%;
  font-size: 16px;
  text-align: center;
  padding-left: 0px !important;
  padding-right: 32px !important;
  border: ${({ theme, $isValid }) =>
    !$isValid ? `1px solid ${theme.colors.failure}` : `1px solid ${theme.colors.inputSecondary}`};
`

const PercentageLabel = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const ButtonsContainer = styled(FlexGap).attrs({ gap: '8px' })`
  background-color: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.inset2};
`

const QuickActionButton = styled(Button).attrs(({ $isActive }) => ({
  scale: 'xs',
  variant: $isActive ? 'subtle' : 'light',
}))<{
  $isActive?: boolean
}>`
  height: 56px;
  font-size: 16px;
  padding: 0 12px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
`

// currencyA is the base token
export default function V3RangeSelector({
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  getDecrementLower,
  getIncrementLower,
  getDecrementUpper,
  getIncrementUpper,
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
  tickSpaceLimits,
  quickAction,
  handleQuickAction,
}: {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  getDecrementLower: () => Price<Token, Token> | undefined
  getIncrementLower: () => Price<Token, Token> | undefined
  getDecrementUpper: () => Price<Token, Token> | undefined
  getIncrementUpper: () => Price<Token, Token> | undefined
  onLeftRangeInput: (typedValue: Price<Currency, Currency> | undefined) => void
  onRightRangeInput: (typedValue: Price<Currency, Currency> | undefined) => void
  currencyA?: Currency | undefined | null
  currencyB?: Currency | undefined | null
  feeAmount?: FeeAmount
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  tickSpaceLimits?: { [bound in Bound]?: number | undefined }
  quickAction: number | null
  handleQuickAction: (value: number | null, zoomLevel: ZoomLevels) => void
}) {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isTablet

  const tokenA = (currencyA ?? undefined)?.wrapped
  const tokenB = (currencyB ?? undefined)?.wrapped
  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  const leftPrice = isSorted ? priceLower : priceUpper?.invert()
  const rightPrice = isSorted ? priceUpper : priceLower?.invert()

  const leftValue = useMemo(() => {
    if (ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0'

    if (
      tickSpaceLimits?.[Bound.LOWER] !== undefined &&
      leftPrice &&
      priceToClosestTick(leftPrice) <= tickSpaceLimits[Bound.LOWER]
    ) {
      return '0'
    }

    return formatRangeSelectorPrice(leftPrice)
  }, [isSorted, leftPrice, tickSpaceLimits, ticksAtLimit])

  const rightValue = useMemo(() => {
    if (ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞'

    if (
      tickSpaceLimits?.[Bound.LOWER] !== undefined &&
      rightPrice &&
      priceToClosestTick(rightPrice) <= tickSpaceLimits[Bound.LOWER]
    ) {
      return '0'
    }

    if (
      tickSpaceLimits?.[Bound.UPPER] !== undefined &&
      rightPrice &&
      priceToClosestTick(rightPrice) >= tickSpaceLimits[Bound.UPPER]
    ) {
      return '∞'
    }

    return formatRangeSelectorPrice(rightPrice)
  }, [isSorted, rightPrice, tickSpaceLimits, ticksAtLimit])

  const _haveRange = useMemo(() => priceLower !== undefined && priceUpper !== undefined, [priceLower, priceUpper])

  // Get quick action configs for current fee tier - reuse existing configs
  const quickActionConfigs = useMemo(() => {
    if (!feeAmount) return {}
    return QUICK_ACTION_CONFIGS[feeAmount] || {}
  }, [feeAmount])

  // Custom input state - completely separate from quick actions
  const [customInput, setCustomInput] = useState('')

  // Calculate zoom level based purely on percentage - ensure range is always visible
  const calculateZoomLevel = useCallback((percentage: number): ZoomLevels => {
    // Pure percentage calculation: X% means (100-X)% to (100+X)% of current price
    const initialMin = 1 - percentage / 100
    const initialMax = 1 + percentage / 100

    // Use aggressive padding to guarantee the range is always visible in chart
    // For small ranges, be extra generous to avoid cramped view
    let paddingMultiplier: number
    if (percentage <= 5) {
      paddingMultiplier = 2.0 // 200% padding for very tight ranges
    } else if (percentage <= 20) {
      paddingMultiplier = 1.5 // 150% padding for small ranges
    } else {
      paddingMultiplier = 1.2 // 120% padding for larger ranges
    }

    // Calculate padding as a percentage of the range width
    const rangeWidth = initialMax - initialMin
    const paddingAmount = rangeWidth * paddingMultiplier

    const expandedMin = Math.max(0.00001, initialMin - paddingAmount)
    const expandedMax = Math.min(initialMax + paddingAmount, 20) // Cap at 2000% for sanity

    return {
      initialMin,
      initialMax,
      min: expandedMin,
      max: expandedMax,
    }
  }, [])

  // Handle predefined quick action clicks
  const handleQuickActionClick = useCallback(
    (percentage: number) => {
      const zoomLevel = calculateZoomLevel(percentage)
      handleQuickAction(percentage, zoomLevel)
      setCustomInput('') // Clear custom input when using quick action
    },
    [handleQuickAction, calculateZoomLevel],
  )

  // Handle custom input - ONLY update input value with 0-100 validation
  const handleCustomInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target

    // Allow empty input for clearing
    if (value === '') {
      setCustomInput('')
      return
    }

    // Only allow numbers, decimal points, and prevent invalid values
    if (!/^\d*\.?\d*$/.test(value)) {
      return // Block non-numeric input
    }

    const numericValue = parseFloat(value)

    // Allow partial typing (like "1" while typing "10") but block out-of-range completed numbers
    if (!Number.isNaN(numericValue) && (numericValue < 0 || numericValue > 100)) {
      return // Block out-of-range values
    }

    // Allow partial decimals (like "1." or "10.") for better UX
    setCustomInput(value)
  }, [])

  // Apply custom zoom - input is guaranteed to be valid
  const applyCustomZoom = useCallback(() => {
    const numericValue = parseFloat(customInput)
    if (!Number.isNaN(numericValue)) {
      const zoomLevel = calculateZoomLevel(numericValue)
      handleQuickAction(numericValue, zoomLevel)
    }
  }, [customInput, calculateZoomLevel, handleQuickAction])

  // Simple validation - always true since we prevent invalid input
  const isCustomInputValid = useMemo(() => {
    // Input is always valid since we block invalid values in onChange
    return true
  }, [])

  // Handle Full Range - simplified without fee tier logic
  const handleFullRange = useCallback(() => {
    const fullRangeZoomLevel = {
      initialMin: 0,
      initialMax: 2,
      min: 0.00001,
      max: 5,
    }
    handleQuickAction(100, fullRangeZoomLevel)
    setCustomInput('') // Clear custom input
  }, [handleQuickAction])

  return (
    <AutoColumn gap="8px">
      <FlexGap gap="16px" width="100%">
        <StepCounter
          value={leftValue}
          onUserInput={onLeftRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementLower : getIncrementUpper}
          increment={isSorted ? getIncrementLower : getDecrementUpper}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          feeAmount={feeAmount}
          label={leftPrice ? `${currencyB?.symbol}` : '-'}
          title={
            <Text color="secondary" textTransform="uppercase" small bold>
              {t('Min Price')}
            </Text>
          }
          tokenA={currencyA}
          tokenB={currencyB}
        />
        <StepCounter
          value={rightValue}
          onUserInput={onRightRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementUpper : getIncrementLower}
          increment={isSorted ? getIncrementUpper : getDecrementLower}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          feeAmount={feeAmount}
          label={rightPrice ? `${currencyB?.symbol}` : '-'}
          tokenA={currencyA}
          tokenB={currencyB}
          title={
            <Text color="secondary" textTransform="uppercase" small bold>
              {t('Max Price')}
            </Text>
          }
        />
      </FlexGap>

      {/* Quick Action Buttons with Simple Validation */}
      <ButtonsContainer width="100%" justifyContent="space-between">
        {Object.entries(quickActionConfigs)
          ?.sort(([a], [b]) => +a - +b)
          .map(([percentage]) => (
            <QuickActionButton
              key={percentage}
              onClick={() => handleQuickActionClick(Number(percentage))}
              $isActive={Number(percentage) === quickAction}
              width="100%"
            >
              {percentage}%
            </QuickActionButton>
          ))}

        <QuickActionButton
          width="100%"
          minWidth="max-content"
          onClick={handleFullRange}
          $isActive={quickAction === 100}
        >
          {t('Full Range')}
        </QuickActionButton>

        {!isSmallScreen && (
          <CustomInputContainer>
            <StyledInput
              value={customInput}
              onChange={handleCustomInputChange}
              onBlur={applyCustomZoom}
              onKeyDown={(e) => e.key === 'Enter' && applyCustomZoom()}
              placeholder={t('Custom')}
              $isValid={isCustomInputValid}
              type="text"
              inputMode="decimal"
            />
            <PercentageLabel>%</PercentageLabel>
          </CustomInputContainer>
        )}
      </ButtonsContainer>

      {isSmallScreen && (
        <RowBetween mt="8px" alignItems="center">
          <Text>{t('Custom')}</Text>
          <CustomInputContainer $small>
            <StyledInput
              value={customInput}
              onChange={handleCustomInputChange}
              onBlur={applyCustomZoom}
              onKeyDown={(e) => e.key === 'Enter' && applyCustomZoom()}
              placeholder="2.5"
              $isValid={isCustomInputValid}
              type="text"
              inputMode="decimal"
            />
            <PercentageLabel>%</PercentageLabel>
          </CustomInputContainer>
        </RowBetween>
      )}
    </AutoColumn>
  )
}
