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
import { PancakeBanner } from './PancakeBanner'

const Wrapper = styled(Box)<{
  isMobile: boolean
}>`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding-top: ${({ isMobile }) => (isMobile ? '67x' : '0')};
  scroll-snap-type: y mandatory;
  height: 100vh;
  overflow: auto;
`
const MobileContainer = styled(Box)`
  scroll-snap-align: start;
`

export const HomeV2 = () => {
  const { tokens, chains, pools, currencies, cakeRelated } = useAtomValue(homePageDataAtom)
  const cakeToken = tokens.find((x) => x.symbol === 'CAKE')!

  const { isMobile } = useMatchBreakpoints()
  const Container = isMobile ? MobileContainer : ScrollableFullScreen
  return (
    <Wrapper isMobile={isMobile} style={{ width: isMobile ? '100vw' : 'calc(100vw - 8px)', boxSizing: 'border-box' }}>
      <Container>
        <RowLayout>
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
        sidePadding="0px"
        style={{
          marginTop: '160px',
        }}
      >
        <PancakeBanner />
      </RowLayout>
    </Wrapper>
  )
}
