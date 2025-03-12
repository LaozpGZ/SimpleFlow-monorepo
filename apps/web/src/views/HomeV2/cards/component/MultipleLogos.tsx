import { Box, useMatchBreakpoints } from '@pancakeswap/uikit'
import styled from 'styled-components'

const LogoWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
`

const OverlapLogo = styled.img<{ gap: number; size: number; isFirstSmall: boolean; index: number }>`
  width: ${({ size, isFirstSmall, index }) => (isFirstSmall && index === 0 ? '20px' : `${size}px`)};
  height: ${({ size, isFirstSmall, index }) => (isFirstSmall && index === 0 ? '20px' : `${size}px`)};
  flex-shrink: 0;
  border: ${({ gap, isFirstSmall }) => (gap < 0 && !isFirstSmall ? '2px solid white' : 'none')};
  border-radius: 50%;

  &:not(:first-child) {
    margin-left: ${({ gap }) => `${gap}px`};
  }
  &:first-child {
    margin-top: ${({ isFirstSmall }) => `${isFirstSmall ? '-12px' : '0'}`}; 
  }
}
`

const ExtraCount = styled(Box)<{ size: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary10};
  border: 3px solid white;
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ size }) => `${size / 2}px`};
  color: ${({ theme }) => theme.colors.text};
`

interface MultipleLogosProps {
  logos: string[]
  maxDisplay?: number
  gap?: number
  isFirstSmall?: boolean
  children?: React.ReactNode
}

export const MultipleLogos = ({
  logos,
  maxDisplay = 3,
  gap = -8,
  isFirstSmall = false,
  children,
}: MultipleLogosProps) => {
  const { isMobile } = useMatchBreakpoints()
  const size = isMobile ? (isFirstSmall ? 28 : 32) : 40

  const displayedLogos = logos.slice(0, maxDisplay)
  const hiddenCount = logos.length - displayedLogos.length

  return (
    <LogoWrapper>
      {displayedLogos.map((logo, index) => (
        <OverlapLogo
          key={logo}
          src={logo}
          alt={`logo-${index}`}
          gap={gap}
          size={size}
          index={index}
          isFirstSmall={isFirstSmall && isMobile}
        />
      ))}
      {hiddenCount > 0 && <ExtraCount size={size}>+{hiddenCount}</ExtraCount>}
      {children}
    </LogoWrapper>
  )
}
