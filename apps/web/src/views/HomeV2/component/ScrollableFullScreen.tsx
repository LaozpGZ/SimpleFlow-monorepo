import { ChevronDownIcon } from '@pancakeswap/uikit'
import React, { useState } from 'react'
import styled from 'styled-components'

interface ScrollableFullScreenProps {
  children: React.ReactNode
  headerSelector?: string
}

const FullScreenContainer = styled.div<{ offsetHeight: number }>`
  scroll-snap-align: start;
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

  return (
    <FullScreenContainer offsetHeight={headerHeight}>
      {children}
      <ScrollDownArrow>
        <ChevronDownIcon width="32px" color="textSubtle" />
      </ScrollDownArrow>
    </FullScreenContainer>
  )
}
