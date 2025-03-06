import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text } from '@pancakeswap/uikit'
import React from 'react'
import styled from 'styled-components'

export type HomepageChain = {
  logo: string
  banner: string
}

const Wrapper = styled(Box)`
  padding: 24px;
  text-align: center;
  background-color: transparent;
`

const ChainIcons = styled(Flex)`
  justify-content: flex-start;
  margin-top: 16px;

  img {
    width: 32px;
    height: 32px;
    margin: 0 4px;
  }
`

const TitleText = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 88px;
  line-height: 88px;
  letter-spacing: -2%;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
`

const HighlightedText = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 88px;
  line-height: 88px;
  letter-spacing: -2%;
  text-align: left;
  color: ${({ theme }) => theme.colors.secondary};
`

const DescriptionText = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: -1%;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 40px;
  margin-bottom: 24px;
`

interface FavoriteDEXBannerProps {
  chains: HomepageChain[]
}

export const FavoriteDEXBanner: React.FC<FavoriteDEXBannerProps> = ({ chains }) => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <TitleText>{t("Everyone's")}</TitleText>
      <HighlightedText>{t('Favorite DEX')}</HighlightedText>
      <DescriptionText>{t('Trade Crypto Instantly Across %count%+ Chains', { count: chains.length })}</DescriptionText>
      <ChainIcons>
        {chains.map((chain) => (
          <img
            style={{
              marginLeft: '8px',
            }}
            key={chain.logo}
            src={chain.logo}
            alt={chain.banner}
          />
        ))}
      </ChainIcons>
    </Wrapper>
  )
}
