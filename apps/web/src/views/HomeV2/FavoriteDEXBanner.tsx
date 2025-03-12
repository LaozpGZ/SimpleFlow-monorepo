import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { HomepageChain } from 'pages/api/home/types'
import React from 'react'
import styled from 'styled-components'
import { MultipleLogos } from './cards/component/MultipleLogos'

const Wrapper = styled(Box)`
  padding: 24px;
  text-align: center;
  background-color: transparent;
`

const TitleText = styled(Text)<{ isMobile: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile }) => (isMobile ? '40px' : '88px')};
  line-height: ${({ isMobile }) => (isMobile ? '48px' : '88px')};
  letter-spacing: -2%;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
  color: ${({ theme }) => theme.colors.text};
`

const HighlightedText = styled(Text)<{ isMobile: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile }) => (isMobile ? '48px' : '88px')};
  line-height: ${({ isMobile }) => (isMobile ? '48px' : '88px')};
  letter-spacing: -2%;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
  color: ${({ theme }) => theme.colors.secondary};
  white-space: nowrap;
`

const DescriptionText = styled(Text)<{ isMobile: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile }) => (isMobile ? '18px' : '24px')};
  line-height: ${({ isMobile }) => (isMobile ? '28px' : '36px')};
  letter-spacing: -1%;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
  color: ${({ theme }) => theme.colors.text};
  margin-top: 40px;
  margin-bottom: 24px;
`

interface FavoriteDEXBannerProps {
  chains: HomepageChain[]
}

export const FavoriteDEXBanner: React.FC<FavoriteDEXBannerProps> = ({ chains }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <Wrapper>
      <TitleText as={isMobile ? 'span' : 'h2'} isMobile={isMobile}>
        {t("Everyone's")}{' '}
      </TitleText>
      <HighlightedText as={isMobile ? 'span' : 'h2'} isMobile={isMobile}>
        {t('Favorite DEX')}
      </HighlightedText>
      <DescriptionText isMobile={isMobile}>
        {t('Trade Crypto Instantly Across %count%+ Chains', { count: chains.length })}
      </DescriptionText>
      <Flex alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
        <MultipleLogos
          clickExpand={{
            logos: chains.map((x) => x.logoM),
          }}
          borderRadius="12px"
          gap={isMobile ? -8 : 20}
          logos={chains.map((x) => x.logo)}
          maxDisplay={20}
        />
      </Flex>
    </Wrapper>
  )
}
