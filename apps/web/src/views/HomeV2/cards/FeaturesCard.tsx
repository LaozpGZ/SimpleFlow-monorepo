import { useTranslation } from '@pancakeswap/localization'
import { Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import { homePageDataAtom } from '../atom/homePageDataAtom'
import { RowLayout } from '../component/RowLayout'
import { PerpetualCard } from './PerpetualsCard'
import { PredictionCard } from './PredictionCard'
import { CardSection } from './component/CardSection'

export const FeaturesCard = () => {
  const { isMobile } = useMatchBreakpoints()
  const { tokens, topWinner } = useAtomValue(homePageDataAtom)
  const { t } = useTranslation()

  if (isMobile) {
    return (
      <RowLayout style={{ marginTop: '20px' }}>
        <CardSection title={t('Featured on PancakeSwap')}>
          <PerpetualCard tokens={tokens.filter((x) => x.symbol === 'BTC' || x.symbol === 'ETH')} />
          <PredictionCard token={tokens.find((x) => x.symbol === 'BNB')!} winner={topWinner} />
        </CardSection>
      </RowLayout>
    )
  }

  return (
    <>
      <RowLayout>
        <FeaturedText>{t('Featured on PancakeSwap')}</FeaturedText>
      </RowLayout>
      <RowLayout
        style={{
          marginTop: '40px',
        }}
      >
        <PerpetualCard tokens={tokens.filter((x) => x.symbol === 'BTC' || x.symbol === 'ETH')} />
        <PredictionCard token={tokens.find((x) => x.symbol === 'BNB')!} winner={topWinner} />
      </RowLayout>
    </>
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
