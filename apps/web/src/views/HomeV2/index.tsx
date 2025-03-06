import { Box, PageSection } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import SimpleSwapForHomePage from 'views/SwapSimplify/SimpleSwapForHomePage'
import { homePageDataAtom } from './atom/homePageDataAtom'
import { BridgeCryptoCard, CakeStatsCard, TokensCard, TradingPairsCard } from './cards'
import { ScrollableFullScreen } from './component/ScrollableFullScreen'
import { FavoriteDEXBanner } from './FavoriteDEXBanner'
import { PancakeBanner } from './PancakeBanner'

const Wrapper = styled(Box)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
`

const Section = styled(PageSection)`
  width: 100%;
  max-width: 1200px;
`

export const HomeV2 = () => {
  const { tokens, chains, pools, currencies, cakeRelated } = useAtomValue(homePageDataAtom)
  const cakeToken = tokens.find((x) => x.symbol === 'CAKE')!
  return (
    <Wrapper>
      <ScrollableFullScreen>
        <RowLayout>
          <FavoriteDEXBanner chains={chains} />
          <SimpleSwapForHomePage />
        </RowLayout>
      </ScrollableFullScreen>

      <RowLayout
        mt="24px"
        style={{
          marginTop: '24px',
        }}
      >
        <TokensCard tokens={tokens} />
        <TradingPairsCard pairs={pools} />
      </RowLayout>

      <RowLayout
        mt="24px"
        style={{
          marginTop: '24px',
        }}
      >
        <BridgeCryptoCard chains={chains} currencies={currencies} />
        <CakeStatsCard cakeToken={cakeToken} figures={cakeRelated} />
      </RowLayout>

      <RowLayout
        style={{
          marginTop: '160px',
        }}
      >
        <PancakeBanner />
      </RowLayout>
    </Wrapper>
  )
}

const RowLayout = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  & > div {
    flex: 1;
  }
`
