import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

import { getImageUrl } from './utils'

const MevIntroSectionWrapper = styled.div`
  position: relative;
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(139.73deg, #e5fdff 0%, #f3efff 100%);

  min-height: 700px;
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 160px;
  }
`
const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const InnerWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
`

const WaveBg = styled.img`
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 0;
`

const CardsWrapper = styled.div`
  display: flex;
  gap: 24px;
  width: 100%;
`
const Card = styled.div`
  position: relative;
  min-height: 184px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 24px;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom-width: 2px;
  flex-basis: calc(100% / 3 - 40px / 3);
  overflow: hidden;
`
export const ImageBox = styled.img`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40%;
`

export const MevIntroSection: React.FC = () => {
  const { t } = useTranslation()
  return (
    <MevIntroSectionWrapper>
      <Wrapper>
        <InnerWrapper>
          <FlexGap width="100%" gap="8px" alignItems="center" justifyContent="center">
            <Text fontSize="64px" lineHeight="78px" bold>
              {t('Free and Automated')}
            </Text>
            <Text fontSize="64px" lineHeight="78px" bold color="secondary">
              {t('MEV Protection')}
            </Text>
          </FlexGap>
          <Text fontSize="20px" lineHeight="30px" textAlign="center" bold maxWidth="800px">
            {t(
              'Frontrunning and sandwich attacks occur when someone identifies your transaction in the public mempool and trades ahead of you. This can result in you receiving a worse price and potentially losing the entire amount of slippage tolerance.',
            )}
          </Text>
          <CardsWrapper>
            <Card>
              <Text maxWidth="60%">
                {t('Enjoy safe, secure and private Swaps without frontrunning and sandwich attacks.')}
              </Text>
              <ImageBox src={getImageUrl('card-1.png')} />
            </Card>
            <Card>
              <Text maxWidth="60%">
                {t('Fast and reliable RPC endpoint for your daily usage, beyond Swapping and trading.')}
              </Text>{' '}
              <ImageBox src={getImageUrl('card2.png')} />
            </Card>
            <Card>
              <Text maxWidth="60%">{t('Easy to set up and completely free solution for all kinds of Swappers.')}</Text>
              <ImageBox src={getImageUrl('card3.png')} />
            </Card>
          </CardsWrapper>
        </InnerWrapper>
      </Wrapper>
      <WaveBg src={getImageUrl('intro-wave.png')} />
    </MevIntroSectionWrapper>
  )
}
