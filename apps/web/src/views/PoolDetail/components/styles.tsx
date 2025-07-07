import { Button } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const ActionButton = styled(Button).attrs({
  scale: 'sm',
  variant: 'tertiary',
})<{ isIcon?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: ${({ isIcon }) => (isIcon ? '48px' : '')};
  background-color: transparent;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.default};
  color: ${({ theme }) => theme.colors.primary60};
  padding: 16px;
  transition: opacity 0.2s ease;
  &:disabled {
    opacity: 0.1 !important;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    opacity: 0.6;
  }
`
