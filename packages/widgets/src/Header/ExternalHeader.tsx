'use client'

import { LanguageProvider } from '@pancakeswap/localization'
import { dark, light, UIKitProvider } from '@pancakeswap/uikit'
import '@pancakeswap/uikit/styles'
import { styled } from 'styled-components'
import { PancakeSwapBottomNavigation } from './components/PancakeSwapBottomNavigation'
import { PancakeSwapNavigation } from './components/PancakeSwapNavigation'
import { PancakeSwapHeader } from './PancakeSwapHeader'

interface Props {
  theme: 'dark' | 'light'
  rightSlot?: React.ReactNode
  asContainer?: boolean
}
export const ExternalHeader: React.FC<Props> = ({ theme, rightSlot, asContainer = true }) => {
  const themeData = theme === 'dark' ? dark : light
  return (
    <Container>
      <UIKitProvider theme={themeData}>
        <LanguageProvider>
          <PancakeSwapHeader
            navigation={<PancakeSwapNavigation />}
            bottomNavigation={<PancakeSwapBottomNavigation />}
            asContainer={asContainer}
            rightSlot={rightSlot}
          />
        </LanguageProvider>
      </UIKitProvider>
    </Container>
  )
}

const Container = styled.div`
  * {
    font-family: Kanit, sans-serif;
  }
  svg {
    width: 20px;
  }
  width: 100%;
`
