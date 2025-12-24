import { useTranslation } from '@pancakeswap/localization'
import { Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import { homePageDataAtom } from '../atom/homePageDataAtom'
import { RowLayout } from '../component/RowLayout'
import { PerpetualCard } from './PerpetualsCard'
import { CardSection } from './component/CardSection'

export const FeaturesCard = () => {
  const { isMobile, isTablet } = useMatchBreakpoints()
  const { tokens } = useAtomValue(homePageDataAtom)
  const { t } = useTranslation()

  if (isMobile) {
    return (
      <RowLayout style={{ marginTop: '20px' }} sidePadding="16px">
        <CardSection title={t('Featured on PancakeSwap')}>
          <PerpetualCard tokens={tokens.filter((x) => x.symbol === 'BTC' || x.symbol === 'ETH')} />
        </CardSection>
      </RowLayout>
    )
  }
  if (isTablet) {
    return (
      <>
        <RowLayout sidePadding="24px" className="homepage-snap">
          <FeaturedText isMobile={isMobile} isTablet={isTablet}>
            {t('Featured on PancakeSwap')}
          </FeaturedText>
        </RowLayout>
        <RowLayout
          style={{
            marginTop: '30px',
          }}
        >
          <PerpetualCard tokens={tokens.filter((x) => x.symbol === 'BTC' || x.symbol === 'ETH')} />
        </RowLayout>
      </>
    )
  }

  return (
    <>
      <RowLayout sidePadding="24px" className="homepage-snap">
        <FeaturedText isMobile={isMobile} isTablet={isTablet}>
          {t('Featured on PancakeSwap')}
        </FeaturedText>
      </RowLayout>
      <RowLayout
        style={{
          marginTop: '40px',
        }}
      >
        <PerpetualCard tokens={tokens.filter((x) => x.symbol === 'BTC' || x.symbol === 'ETH')} />
      </RowLayout>
    </>
  )
}

const FeaturedText = styled(Text)<{ isMobile?: boolean; isTablet?: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${(props) => {
    if (props.isMobile) return '24px'
    if (props.isTablet) return '28px'
    return '32px'
  }};
  line-height: 38.4px;
  letter-spacing: -1%;
  margin-top: ${(props) => {
    if (props.isMobile) return '20px'
    if (props.isTablet) return '40px'
    return '60px'
  }};
  color: ${({ theme }) => theme.colors.text};
`
