import { Button } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const ActionButton = styled(Button).attrs({
  scale: 'sm',
  variant: 'tertiary',
})<{ isIcon?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: ${({ isIcon }) => (isIcon ? '48px' : '')};
  background-color: transparent;
  border: 2px solid ${({ theme, disabled }) => (disabled ? theme.colors.textDisabled : theme.colors.primary)};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 16px;
  transition: opacity 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  &:hover:not(:disabled) {
    opacity: 0.6;
  }

  & > svg {
    fill: ${({ theme, disabled }) => (disabled ? theme.colors.textDisabled : theme.colors.primary60)};
  }
`
