import { ChevronDownIcon } from '@pancakeswap/uikit'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

interface ScrollableFullScreenProps {
  children: React.ReactNode
  headerSelector?: string
}

const FullScreenContainer = styled.div<{ offsetHeight: number }>`
  height: calc(100vh - ${({ offsetHeight }) => offsetHeight}px);
  width: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const ScrollDownArrow = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
`

export const ScrollableFullScreen: React.FC<ScrollableFullScreenProps> = ({ children, headerSelector = '#menu' }) => {
  const [headerHeight, setHeaderHeight] = useState(0)

  const updateHeaderHeight = useCallback(() => {
    const header = document.querySelector(headerSelector)
    setHeaderHeight(header?.clientHeight || 0)
  }, [headerSelector])

  const scrollToNextScreen = useCallback(() => {
    window.scrollTo({ top: window.innerHeight - headerHeight, behavior: 'smooth' })
  }, [headerHeight])

  useEffect(() => {
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)

    let startY = 0
    let scrolled = false

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 10 && !scrolled) {
        scrollToNextScreen()
        scrolled = true
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      startY = event.touches[0].clientY
    }

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0].clientY
      if (startY - currentY > 30 && !scrolled) {
        scrollToNextScreen()
        scrolled = true
      }
    }

    window.addEventListener('wheel', handleWheel)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [scrollToNextScreen, updateHeaderHeight])

  return (
    <FullScreenContainer offsetHeight={headerHeight}>
      {children}
      <ScrollDownArrow onClick={scrollToNextScreen}>
        <ChevronDownIcon width="32px" color="textSubtle" />
      </ScrollDownArrow>
    </FullScreenContainer>
  )
}
