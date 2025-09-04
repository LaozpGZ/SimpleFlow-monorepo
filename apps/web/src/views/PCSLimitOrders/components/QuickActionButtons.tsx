import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Button, useMatchBreakpoints, RowBetween, Text, Box, Input } from '@pancakeswap/uikit'
import styled from 'styled-components'

// Quick Select Styles
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
  height: 44px;
  font-size: 16px;
  padding: 0 12px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
`

const CustomInputContainer = styled(Box)<{ $small?: boolean }>`
  position: relative;
  max-width: 160px;

  ${({ $small }) =>
    $small
      ? `
          height: 40px;
          width: 30%;
        `
      : `
          height: 40px;
          width: 120%;
          margin: auto 1px auto 0;
        `}
`

const StyledInput = styled(Input)<{ $isValid?: boolean }>`
  height: 100%;
  font-size: 16px;
  text-align: center;
  padding-left: 8px !important;
  padding-right: 32px !important;
  box-shadow: none;
  border: ${({ theme, $isValid }) =>
    $isValid === false ? `1px solid ${theme.colors.failure}` : `1px solid ${theme.colors.inputSecondary}`};
`

const PercentageLabel = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSubtle};

  display: flex;
  align-items: center;
  gap: 4px;
`

const VerticalLine = styled.div`
  display: inline-block;
  height: 24px;
  width: 1px;
  background-color: ${({ theme }) => theme.colors.inputSecondary};
`

export const QuickActionButtons = () => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isTablet

  return (
    <>
      <ButtonsContainer>
        <QuickActionButton onClick={() => {}} $isActive width={isSmallScreen ? '150%' : '200%'} minWidth="max-content">
          {t('Market')}
        </QuickActionButton>
        <QuickActionButton onClick={() => {}} $isActive={false} width="100%">
          +1%
        </QuickActionButton>
        <QuickActionButton onClick={() => {}} $isActive={false} width="100%">
          +5%
        </QuickActionButton>
        <QuickActionButton onClick={() => {}} $isActive={false} width="100%">
          +10%
        </QuickActionButton>

        {!isSmallScreen && (
          <CustomInputContainer width="120%" minWidth="110px">
            <StyledInput
              value=""
              onChange={() => {}}
              onBlur={() => {}}
              // onKeyDown={(e) => e.key === 'Enter' && void}
              placeholder={t('Custom')}
              type="text"
              inputMode="decimal"
            />
            <PercentageLabel>
              <VerticalLine />
              <span>%</span>
            </PercentageLabel>
          </CustomInputContainer>
        )}
      </ButtonsContainer>
      {isSmallScreen && (
        <RowBetween mt="8px" alignItems="center">
          <Text>{t('Custom')}</Text>
          <CustomInputContainer $small>
            <StyledInput
              value=""
              onChange={() => {}}
              onBlur={() => {}}
              // onKeyDown={(e) => e.key === 'Enter' && null}
              placeholder="2.5"
              type="text"
              inputMode="decimal"
            />
            <PercentageLabel>
              <VerticalLine />
              <span>%</span>
            </PercentageLabel>
          </CustomInputContainer>
        </RowBetween>
      )}
    </>
  )
}
