// Import polyfills first
import './src/polyfills'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Box, Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { AppContainer } from './src/AppContainer'
import { makeStore } from './src/state'
import SwapSimplify from './src/views/SwapSimplify'

const StyledSwapContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.backgroundBubblegum};
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const Container = styled.div<{ isMobile: boolean }>`
  min-height: ${({ isMobile }) => (isMobile ? '100vh' : '100%')};
  background: ${({ theme }) => theme.colors.backgroundBubblegum};
  width: 100%;
`

function SwapApp() {
  const { isMobile } = useMatchBreakpoints()

  // Create Redux store for Vite
  const store = React.useMemo(() => makeStore(), [])

  return (
    <AppContainer isVite store={store}>
      <Container isMobile={isMobile}>
        <StyledSwapContainer>
          <Flex width="100%" height="100%" justifyContent="center" alignItems="center" flexDirection="column">
            <SwapSimplify />
          </Flex>
        </StyledSwapContainer>
      </Container>
    </AppContainer>
  )
}

// Initialize the app
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<SwapApp />)
} else {
  console.error('Root element not found')
}
