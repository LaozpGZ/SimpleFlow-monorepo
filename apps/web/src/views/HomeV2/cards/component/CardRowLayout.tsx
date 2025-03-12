import { Flex } from '@pancakeswap/uikit'
import { HoverProvider } from 'hooks/useHover'
import styled, { css } from 'styled-components'

const Layout = styled(Flex)<{ $isLast?: boolean }>`
  ${({ $isLast, theme }) =>
    !$isLast &&
    css`
      border-bottom: 1px solid ${theme.colors.cardBorder};
    `}
  padding: 20px 0px;
  height: 80px;
`

export const CardRowLayout = ({
  left,
  children,
  isLast,
}: {
  left: React.ReactNode
  children: React.ReactNode
  isLast?: boolean
}) => {
  return (
    <HoverProvider>
      <Layout alignItems="center" justifyContent="space-between" py="8px" $isLast={isLast}>
        <Flex alignItems="center">{left}</Flex>
        <Flex alignItems="center">{children}</Flex>
      </Layout>
    </HoverProvider>
  )
}
