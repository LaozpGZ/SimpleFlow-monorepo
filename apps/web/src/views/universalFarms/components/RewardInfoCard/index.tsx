import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Flex, Link, PresentWonIcon, Text } from '@pancakeswap/uikit'
import React from 'react'
import styled from 'styled-components'

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.colors.positive10};
  border: 1px solid ${({ theme }) => theme.colors.positive20};
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
`

const IconWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`

const StyledPresentIcon = styled(PresentWonIcon)`
  width: 24px;
  height: 24px;
  path {
    fill: ${({ theme }) => theme.colors.success};
  }
`

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
  display: inline-flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }
`

interface RewardInfoCardProps {
  title?: string
  description?: string
  linkText?: string
  linkUrl?: string
}

const RewardInfoCard: React.FC<RewardInfoCardProps> = ({
  title = 'Boost Your Yield with Ethena',
  description = 'Add liquidity to these pools (USDe/USDT and sUSDe/USDe) to earn massive rewards - 30x Ethena Points!',
  linkText = "Claim your rewards & learn more on Ethena's official site.",
  linkUrl = 'https://ethena.fi',
}) => {
  const { t } = useTranslation()

  return (
    <StyledCard>
      <Flex alignItems="flex-start">
        <IconWrapper>
          <StyledPresentIcon />
        </IconWrapper>
        <Box>
          <Text bold color="success" mb="8px">
            {t(title)}
          </Text>
          <Text mb="8px">{t(description)}</Text>
          <StyledLink external href={linkUrl}>
            🔗 {t(linkText)}
          </StyledLink>
        </Box>
      </Flex>
    </StyledCard>
  )
}

export default RewardInfoCard
