import { Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useAtomValue } from 'jotai'
import React from 'react'
import styled from 'styled-components'
import { homePageDataAtom } from './atom/homePageDataAtom'
import { Partners } from './Partners'
import { StatsSummary } from './StatsSummary'

const Container = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ isMobile }) => (isMobile ? '24px 0px' : '24px')};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  overflow: visible;
  position: relative;
`

const BannerMediaContainer = styled.div`
  max-width: 320px;
  width: 100%;
  margin-bottom: 24px;
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
`

const BannerVideo = styled.video`
  width: 100%;
`

const BannerImage = styled.img`
  width: 100%;
  animation: float 3s ease-in-out infinite;
`

const Highlight1 = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colors.primary60};
`

const Highlight2 = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colors.secondary};
`

const HeadlineText = styled(Text)<{
  isMobile
}>`
  font-family: Kanit;
  font-weight: 600;
  font-size: 40px;
  line-height: 48px;
  letter-spacing: -1%;
  text-align: center;
  margin-top: ${({ isMobile }) => (isMobile ? '0px' : '280px')};
`

const BunnyVideoUrl = `${ASSET_CDN}/web/landing/bunny.webm`

export const PancakeBanner: React.FC = () => {
  const { partners, stats } = useAtomValue(homePageDataAtom)
  const { isMobile } = useMatchBreakpoints()

  return (
    <Container isMobile>
      <BannerMediaContainer>
        {!isMobile && (
          <BannerVideo autoPlay loop muted playsInline>
            <source src={BunnyVideoUrl} type="video/webm" />
          </BannerVideo>
        )}
      </BannerMediaContainer>
      <HeadlineText isMobile={isMobile}>
        Used by <Highlight1>millions.</Highlight1> Trusted with <Highlight2>billions.</Highlight2>
      </HeadlineText>
      <StatsSummary stats={stats} />
      {!isMobile && <Partners partners={partners} />}
    </Container>
  )
}
