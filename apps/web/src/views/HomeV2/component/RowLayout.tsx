import { Box, BoxProps, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import styled from 'styled-components'

export const RowLayout = ({
  sidePadding = '24px',
  fullScreen = false,
  ...props
}: BoxProps & { sidePadding?: string; fullScreen?: boolean }) => {
  const { isMobile } = useMatchBreakpoints()
  const flexDirection = useMemo(() => (isMobile ? 'column' : 'row'), [isMobile])

  return (
    <StyledRowLayout
      {...props}
      fullScreen={fullScreen}
      flexDirection={flexDirection}
      isMobile={isMobile}
      sidePadding={sidePadding}
    />
  )
}

const StyledRowLayout = styled(Box)<{
  flexDirection: 'row' | 'column'
  isMobile: boolean
  sidePadding: string
  fullScreen?: boolean
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: ${({ fullScreen }) => (fullScreen ? 'none' : '1200px')};
  margin: 0 auto;
  scroll-snap-align: center;
  ${({ sidePadding }) => `
    padding-left: ${sidePadding};
    padding-right: ${sidePadding};
  `}
  & > div {
    flex: 1;
    ${({ isMobile }) => isMobile && 'width: 100%;'}/* Cards take full width in mobile */
  }
`
