import { Box } from '@pancakeswap/uikit'
import styled from 'styled-components'

const LogoWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
`

const OverlapLogo = styled.img<{ gap: number; size: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  flex-shrink: 0;
  border: ${({ gap }) => (gap < 0 ? '2px solid white' : 'none')};
  border-radius: 50%;

  &:not(:first-child) {
    margin-left: ${({ gap }) => `${gap}px`};
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
  size?: number
  children?: React.ReactNode
}

export const MultipleLogos = ({ logos, maxDisplay = 3, gap = -8, size = 40, children }: MultipleLogosProps) => {
  const displayedLogos = logos.slice(0, maxDisplay)
  const hiddenCount = logos.length - displayedLogos.length

  return (
    <LogoWrapper>
      {displayedLogos.map((logo, index) => (
        <OverlapLogo key={logo} src={logo} alt={`logo-${index}`} gap={gap} size={size} />
      ))}
      {hiddenCount > 0 && <ExtraCount size={size}>+{hiddenCount}</ExtraCount>}
      {children}
    </LogoWrapper>
  )
}
