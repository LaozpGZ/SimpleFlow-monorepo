import { Box, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const LogoWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
`

const ImageContainer = styled.div<{
  gap: number
  isFirstSmall: boolean
  size: number
  index: number
  isActive?: boolean
}>(({ gap, isFirstSmall, size, index, isActive }) => {
  const logoSize = isFirstSmall && index === 0 ? '20px' : `${size}px`
  return `
  position: relative;
  width: ${isActive ? size * 2 : size}px;
  transition: all 0.3s;
  &:not(:first-child) {
    margin-left: ${gap}px;
  }

  &:first-child {
    margin-top: ${isFirstSmall ? '-12px' : '0'};
  }
`
})

const OverlapLogo = styled.img<{
  gap: number
  size: number
  isFirstSmall: boolean
  index: number
  borderRadius: string
  isActive: boolean
}>(({ gap, size, isFirstSmall, index, borderRadius, isActive }) => {
  const logoSize = isFirstSmall && index === 0 ? '20px' : `${size}px`

  return `
    position: absolute;
    top: 0;
    left: 0;
    transition: all 0.3s;
    width: ${logoSize};
    opacity: ${isActive ? 1 : 0};
    height: auto;
    flex-shrink: 0;
    border: ${gap < 0 && !isFirstSmall ? '2px solid white' : 'none'};
    border-radius: ${borderRadius};
  `
})

const ExpandLogo = styled.img<{
  gap: number
  size: number
  isFirstSmall: boolean
  index: number
  borderRadius: string
  isActive: boolean
}>(({ size, isFirstSmall, index, borderRadius, isActive }) => {
  const logoSize = isFirstSmall && index === 0 ? '20px' : `${size}px`

  return `
    position: absolute;
    top: 0;
    left: 0;
    transition: all 0.3s;
    width: ${logoSize};
    opacity: ${isActive ? 1 : 0};
    transition: all 0.3s;
    transform: scale(${isActive ? 2 : 1});
    transform-origin: top left;
    will-change: transform;
    height: auto;
    flex-shrink: 0;
    border-radius: ${borderRadius};
  `
})

const ExtraCount = styled(Box)<{ gap: number; size: number; borderRadius: string }>`
  display: flex;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  flex-shrink: 0;
  border: ${({ gap }) => (gap < 0 ? '2px solid white' : 'none')};
  margin-left: ${({ gap }) => `${gap}px`};
  border-radius: ${({ borderRadius }) => borderRadius};
  background-color: ${({ theme }) => theme.colors.secondary10};
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.secondary};
`

interface MultipleLogosProps {
  logos: string[]
  maxDisplay?: number
  gap?: number
  isFirstSmall?: boolean
  children?: React.ReactNode
  borderRadius?: string
  clickExpand?: {
    logos: string[]
  }
}

export const MultipleLogos = ({
  logos,
  maxDisplay = 3,
  gap = -8,
  isFirstSmall = false,
  children,
  borderRadius,
  clickExpand,
}: MultipleLogosProps) => {
  const { isMobile } = useMatchBreakpoints()
  const size = isMobile ? (isFirstSmall ? 28 : 32) : 40

  const displayedLogos = logos.slice(0, maxDisplay)
  const hiddenCount = logos.length - displayedLogos.length
  const [expandIndex, setExpandIcon] = useState<number | undefined>(undefined)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isMobile) {
      return () => {}
    }
    const handleScroll = () => {
      if (expandIndex !== undefined) {
        setExpandIcon(undefined)
      }
    }

    const handleTap = (e: TouchEvent | MouseEvent) => {
      if (expandIndex !== undefined && ref.current && !ref.current.contains(e.target as Node)) {
        setExpandIcon(undefined)
      }
    }
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('touchmove', handleTap)
    document.addEventListener('click', handleTap)
    return () => {
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('touchmove', handleTap)
      document.addEventListener('click', handleTap)
    }
  }, [expandIndex, ref.current])

  return (
    <LogoWrapper ref={ref}>
      {displayedLogos.map((logo, index) => {
        const active = isMobile && index === expandIndex
        const expandIcon = clickExpand?.logos[index]
        return (
          <ImageContainer isActive={active} size={size} index={index} gap={gap} isFirstSmall={isFirstSmall} key={logo}>
            <OverlapLogo
              onClick={() => {
                if (!isMobile || !clickExpand) {
                  return
                }
                setExpandIcon(index)
              }}
              isActive={!active}
              src={logo}
              alt={`logo-${index}`}
              gap={gap}
              size={size}
              index={index}
              isFirstSmall={isFirstSmall && isMobile}
              borderRadius={borderRadius || '50%'}
            />
            {expandIcon && (
              <ExpandLogo
                onClick={() => {
                  if (!isMobile || !clickExpand) {
                    return
                  }
                  setExpandIcon(index)
                }}
                isActive={active}
                src={expandIcon}
                alt={`logo-${index}`}
                gap={gap}
                size={size}
                index={index}
                isFirstSmall={isFirstSmall && isMobile}
                borderRadius={borderRadius || '50%'}
              />
            )}
          </ImageContainer>
        )
      })}
      {hiddenCount > 0 && (
        <ExtraCount borderRadius={borderRadius || '50%'} gap={gap} size={size}>
          +{hiddenCount}
        </ExtraCount>
      )}
      {children}
    </LogoWrapper>
  )
}
