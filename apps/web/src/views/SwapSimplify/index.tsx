import { BottomDrawer, Box, Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'

import { MobileCard } from 'components/AdPanel/MobileCard'
import { AutoSlippageProvider } from 'hooks/useAutoSlippageWithFallback'
import { useSwapHotTokenDisplay } from 'hooks/useSwapHotTokenDisplay'
import dynamic from 'next/dynamic'
import { QuoteProvider } from 'quoter/QuoteProvider'
import { styled } from 'styled-components'
import Page from '../Page'
import { StyledSwapContainer } from '../Swap/styles'
import { SwapFeaturesContext } from '../Swap/SwapFeaturesContext'
import { InfinitySwapForm } from './InfinitySwap'

const ChartWithPriceHeader = dynamic(() => import('components/Chart/ChartWithPriceHeader'), { ssr: false })

const Wrapper = styled(Box)`
  width: 100%;
  ${({ theme }) => theme.mediaQueries.md} {
    min-width: 328px;
    max-width: 480px;
  }
`

const InfinitySwapInner = () => {
  const { query } = useRouter()
  const { isMobile, isDesktop } = useMatchBreakpoints()
  const { isChartExpanded, isChartDisplayed, setIsChartDisplayed } = useContext(SwapFeaturesContext)
  const [isSwapHotTokenDisplay, setIsSwapHotTokenDisplay] = useSwapHotTokenDisplay()
  // const { t } = useTranslation()
  const [firstTime, setFirstTime] = useState(true)

  useEffect(() => {
    if (firstTime && query.showTradingReward) {
      setFirstTime(false)
      setIsSwapHotTokenDisplay(true)

      if (!isSwapHotTokenDisplay && isChartDisplayed) {
        setIsChartDisplayed?.((currentIsChartDisplayed) => !currentIsChartDisplayed)
      }
    }
  }, [firstTime, isChartDisplayed, isSwapHotTokenDisplay, query, setIsSwapHotTokenDisplay, setIsChartDisplayed])

  return (
    <Page removePadding hideFooterOnDesktop={isChartExpanded || false} showExternalLink={false} showHelpLink={false}>
      <Flex
        width="100%"
        height="100%"
        justifyContent="center"
        position="relative"
        mt={isChartExpanded ? undefined : isMobile ? '18px' : '42px'}
        p={isChartExpanded ? undefined : isMobile ? '16px' : '24px'}
      >
        {isDesktop && isChartDisplayed && (
          <ChartWithPriceHeader
            currency0={inputCurrency || undefined}
            currency1={outputCurrency || undefined}
            symbol={`${inputCurrency?.symbol}/${outputCurrency?.symbol}`}
            theme="Dark"
          />
        )}
        {!isDesktop && isChartDisplayed && (
          <BottomDrawer
            content={
              <ChartWithPriceHeader
                currency0={inputCurrency || undefined}
                currency1={outputCurrency || undefined}
                symbol={`${inputCurrency?.symbol}/${outputCurrency?.symbol}`}
                theme="Dark"
              />
            }
            isOpen={isChartDisplayed}
            setIsOpen={(isOpen) => setIsChartDisplayed?.(isOpen)}
          />
        )}
        <Flex
          flexDirection="column"
          alignItems="center"
          height="100%"
          width="100%"
          mt={isChartExpanded && !isMobile ? '42px' : undefined}
          position="relative"
          zIndex={1}
        >
          <StyledSwapContainer
            justifyContent="center"
            width="100%"
            style={{ height: '100%' }}
            $isChartExpanded={isChartExpanded}
          >
            <AutoSlippageProvider>
              <Wrapper height="100%">
                <InfinitySwapForm />
              </Wrapper>
            </AutoSlippageProvider>
          </StyledSwapContainer>
        </Flex>
      </Flex>

      <MobileCard />
    </Page>
  )
}

export default function InfinitySwap() {
  return (
    <QuoteProvider>
      <InfinitySwapInner />
    </QuoteProvider>
  )
}
