import { Text } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useAtomValue } from 'jotai'
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { homePageDataAtom } from './atom/homePageDataAtom'
import { Partners } from './Partners'
import { StatsSummary } from './StatsSummary'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  overflow: visible;
  position: relative;
`

const float = keyframes`
  0%, 100% { transform: translate(-50%, -200px); }
  50% { transform: translate(-50%, -100px); }
`

const BannerImage = styled.img`
  max-width: 320px;
  width: 100%;
  margin-bottom: 24px;
  animation: ${float} 3s ease-in-out infinite;
  position: absolute;
  top: -50px;
  left: 50%;
`

const Highlight1 = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colors.primary60};
`

const Highlight2 = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colors.secondary};
`

const HeadlineText = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 40px;
  line-height: 48px;
  letter-spacing: -1%;
  text-align: center;
  margin-top: 280px;
`

const BunnyImageUrl = `${ASSET_CDN}/web/landing/earn-bunny.png`

export const PancakeBanner: React.FC = () => {
  const { partners, stats } = useAtomValue(homePageDataAtom)

  return (
    <Container>
      <BannerImage src={BunnyImageUrl} alt="PancakeSwap Banner" />
      <HeadlineText>
        Used by <Highlight1>millions.</Highlight1> Trusted with <Highlight2>billions.</Highlight2>
      </HeadlineText>
      <StatsSummary stats={stats} />
      <Partners partners={partners} />
    </Container>
  )
}
