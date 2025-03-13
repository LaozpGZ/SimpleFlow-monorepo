import { Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const HomepageSymbol = styled(Text)<{
  isCTA?: boolean
}>`
  font-family: Kanit;
  font-weight: 600;
  letter-spacing: -1%;
  cursor: pointer;
  transition: color 0.2s ease-in-out, transform 0.2s ease-in-out;

  &:hover {
    transform: ${({ isCTA }) => (isCTA ? 'scale(1.05)' : 'none')};
  }
`
