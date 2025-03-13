import { Box, domAnimation, LazyAnimatePresence, MotionBox, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
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

export const HomeV2 = () => {
  const { tokens, chains, pools, currencies, cakeRelated } = useAtomValue(homePageDataAtom)
  const cakeToken = tokens.find((x) => x.symbol === 'CAKE')!

  const { isMobile } = useMatchBreakpoints()
  const Container = isMobile ? MobileContainer : ScrollableFullScreen

  useScrollToNearestSnap('homepage-snap')

  return (
    <>
      <Container>
        <RowLayout sidePadding="0">
          <FavoriteDEXBanner chains={chains} />
          <LazyAnimatePresence features={domAnimation}>
            <MotionBox
              style={{
                willChange: 'transform',
                flexShrink: 0,
                flex: 1,
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
        sidePadding={isMobile ? '16px' : '24px'}
        mt="24px"
        style={{
          marginTop: '24px',
        }}
      >
        <SwapWithBestPriceCard tokens={tokens} />
        <EarnTradingFeesCard pairs={pools} />
      </RowLayout>

      <RowLayout
        sidePadding={isMobile ? '16px' : '24px'}
        mt="24px"
        style={{
          marginTop: '24px',
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
          marginTop: '160px',
        }}
      >
        <PancakeBanner />
      </RowLayout>
    </>
  )
}
