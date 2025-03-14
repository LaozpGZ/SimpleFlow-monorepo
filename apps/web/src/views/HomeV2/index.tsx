import { Box, domAnimation, LazyAnimatePresence, MotionBox, Skeleton, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import { Suspense } from 'react'
import styled from 'styled-components'
import SimpleSwapForHomePage from 'views/SwapSimplify/SimpleSwapForHomePage'
import { homePageDataAtom } from './atom/homePageDataAtom'
import { BridgeCryptoCard, EarnTradingFeesCard, SwapWithBestPriceCard, VoteForEmissionCard } from './cards'
import { FeaturesCard } from './cards/FeaturesCard'
import { RowLayout } from './component/RowLayout'
import { ScrollableFullScreen } from './component/ScrollableFullScreen'
import { FavoriteDEXBanner } from './FavoriteDEXBanner'
import { useScrollToNearestSnap } from './hook/useScrollToNearestSnap'
import { PancakeBanner } from './PancakeBanner'

const MobileContainer = styled(Box)`
  scroll-snap-align: start;
`

// Helper functions for tablet layout
const getSidePadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '16px'
  if (isTablet) return '20px'
  return '24px'
}

const getMarginTopForBanner = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return `40px`
  if (isTablet) return `160px`
  return `200px`
}

const getMarginTop = (isMobile: boolean, isTablet: boolean, base: number) => {
  if (isMobile) return base
  if (isTablet) return base * 1.2
  return base * 1.5
}

const BgBox = styled(Box)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
`
export const HomeV2 = () => {
  return (
    <Suspense
      fallback={
        <BgBox
          style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Skeleton
            style={{
              background: `rgba(255, 255, 255, 0.3)`,
            }}
            animation="waves"
            width="80%"
            height="50vh"
            variant="round"
            borderRadius="0"
          />
        </BgBox>
      }
    >
      <BgBox>
        <HomeV2Inner />
      </BgBox>
    </Suspense>
  )
}
const HomeV2Inner = () => {
  const { tokens, chains, pools, currencies, cakeRelated } = useAtomValue(homePageDataAtom)
  const cakeToken = tokens.find((x) => x.symbol === 'CAKE')!

  const { isMobile, isTablet } = useMatchBreakpoints()
  const Container = isTablet || isMobile ? MobileContainer : ScrollableFullScreen

  useScrollToNearestSnap('homepage-snap')

  return (
    <>
      <Container
        style={{
          minHeight: '100vh',
        }}
      >
        <RowLayout sidePadding="0">
          <FavoriteDEXBanner chains={chains} />
          <LazyAnimatePresence features={domAnimation}>
            <MotionBox
              style={{
                willChange: 'transform',
                flexShrink: 0,
                flex: 1,
                width: '100%',
              }}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            >
              <SimpleSwapForHomePage />
            </MotionBox>
          </LazyAnimatePresence>
        </RowLayout>
      </Container>

      <RowLayout
        className="homepage-snap"
        sidePadding={getSidePadding(isMobile, isTablet)}
        mt={getMarginTop(isMobile, isTablet, 24)}
        style={{
          marginTop: getMarginTop(isMobile, isTablet, 24),
        }}
      >
        <SwapWithBestPriceCard tokens={tokens} />
        <EarnTradingFeesCard pairs={pools} />
      </RowLayout>

      <RowLayout
        sidePadding={getSidePadding(isMobile, isTablet)}
        mt={getMarginTop(isMobile, isTablet, 24)}
        style={{
          marginTop: getMarginTop(isMobile, isTablet, 24),
        }}
      >
        <BridgeCryptoCard chains={chains} currencies={currencies} />
        <VoteForEmissionCard cakeToken={cakeToken} figures={cakeRelated} />
      </RowLayout>

      <FeaturesCard />

      <RowLayout
        className="homepage-snap"
        fullScreen
        sidePadding="0px"
        style={{
          marginTop: getMarginTopForBanner(isMobile, isTablet),
        }}
      >
        <PancakeBanner />
      </RowLayout>
    </>
  )
}
