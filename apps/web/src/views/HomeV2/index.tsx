import { useTranslation } from '@pancakeswap/localization'
import { Box, PageSection, Text } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import SimpleSwapForHomePage from 'views/SwapSimplify/SimpleSwapForHomePage'
import { homePageDataAtom } from './atom/homePageDataAtom'
import { BridgeCryptoCard, CakeStatsCard, TokensCard, TradingPairsCard } from './cards'
import { PerpetualCard } from './cards/PerpetualsCard'
import { PredictionCard } from './cards/PredictionCard'
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
  const { t } = useTranslation()
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
      <FeaturedText>{t('Featured on PancakeSwap')}</FeaturedText>
      <RowLayout
        style={{
          marginTop: '40px',
        }}
      >
        <PerpetualCard tokens={tokens.filter((x) => x.symbol === 'BTC' || x.symbol === 'ETH')} />
        <PredictionCard />
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

const FeaturedText = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  letter-spacing: -1%;
  margin-top: 60px;
  color: ${({ theme }) => theme.colors.text};
`

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
