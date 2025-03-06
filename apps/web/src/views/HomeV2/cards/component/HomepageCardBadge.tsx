import { Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const HomepageCardBadge = styled(Flex)`
  height: 40px;
  padding-right: 16px;
  padding-left: 16px;
  border-radius: 999px;
  border-width: 3px;
  background: ${({ theme }) => theme.colors.positive10};
  display: flex;
  align-items: center;
`
