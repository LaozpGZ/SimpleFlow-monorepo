import { Box, BoxProps, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import styled from 'styled-components'

// Optional helper function for sidePadding customization
const getSidePadding = (isMobile: boolean, isTablet: boolean, basePadding: string) => {
  if (isMobile) return basePadding
  if (isTablet) return '40px' // Example: slightly bigger padding for tablet
  return '56px' // Example: bigger padding for desktop
}

export const RowLayout = ({
  sidePadding = '24px',
  fullScreen = false,
  ...props
}: BoxProps & { sidePadding?: string; fullScreen?: boolean }) => {
  const { isMobile, isTablet } = useMatchBreakpoints()

  // Keep the same logic for flexDirection (row vs column)
  const flexDirection = useMemo(() => (isTablet || isMobile ? 'column' : 'row'), [isMobile, isTablet])

  // Compute sidePadding based on whether it's mobile, tablet, or desktop
  const computedSidePadding = useMemo(
    () => getSidePadding(isMobile, isTablet, sidePadding),
    [isMobile, isTablet, sidePadding],
  )

  return (
    <StyledRowLayout
      {...props}
      fullScreen={fullScreen}
      flexDirection={flexDirection}
      isMobile={isMobile}
      isTablet={isTablet}
      sidePadding={computedSidePadding}
    />
  )
}

const StyledRowLayout = styled(Box)<{
  flexDirection: 'row' | 'column'
  isMobile: boolean
  isTablet: boolean
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

  ${({ sidePadding }) => `
    padding-left: ${sidePadding};
    padding-right: ${sidePadding};
  `}

  & > div {
    flex: 1;
    /* For mobile view: ensure card width is 100% */
    ${({ isTablet, isMobile }) => (isMobile || isTablet) && 'width: 100%;'}
  }
`
