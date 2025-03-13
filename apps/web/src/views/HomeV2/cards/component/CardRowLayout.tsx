import { Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import { HoverProvider } from 'hooks/useHover'
import styled, { css } from 'styled-components'

const Layout = styled(Flex)<{ $isLast?: boolean; isMobile: boolean }>`
  ${({ $isLast, theme }) =>
    !$isLast &&
    css`
      border-bottom: 1px solid ${theme.colors.cardBorder};
    `}
  padding: ${({ isMobile }) => (isMobile ? '0px 0px' : '20px 32px 0 32px')};
  height: 80px;
  &:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }
`

export const CardRowLayout = ({
  left,
  children,
  isLast,
  onClick,
}: {
  left: React.ReactNode
  children: React.ReactNode
  isLast?: boolean
  onClick?: () => void
}) => {
  const { isMobile } = useMatchBreakpoints()
  return (
    <HoverProvider>
      <Layout
        isMobile={isMobile}
        onClick={onClick}
        alignItems="center"
        justifyContent="space-between"
        py="8px"
        $isLast={isLast}
      >
        <Flex alignItems="center">{left}</Flex>
        <Flex alignItems="center">{children}</Flex>
      </Layout>
    </HoverProvider>
  )
}
