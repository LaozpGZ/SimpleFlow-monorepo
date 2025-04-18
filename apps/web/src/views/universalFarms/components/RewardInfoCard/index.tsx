import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Link, RewardIcon, Text } from '@pancakeswap/uikit'
import React, { memo } from 'react'
import styled from 'styled-components'

const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.positive10};
  border: 1px solid ${({ theme }) => theme.colors.positive20};
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
`
const IconWrapper = styled(Box)`
  color: ${({ theme }) => theme.colors.success};
`
const StyledRewardIcon = styled(RewardIcon)`
  width: 24px;
  height: 24px;
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

export const RewardInfoCard: React.FC<RewardInfoCardProps> = memo(() => {
  const { t } = useTranslation()

  return (
    <StyledCard>
      <Flex alignItems="flex-start" justifyContent="center">
        <IconWrapper>
          <StyledRewardIcon />
        </IconWrapper>
        <Box>
          <Text bold mb="8px">
            {t('Boost Your Yield with Ethena')}
          </Text>
        </Box>
      </Flex>
      <Text mb="8px">
        {t('Add liquidity to these pools (USDe/USDT and sUSDe/USDe) to earn massive rewards - 30x Ethena Points!')}
      </Text>
      <StyledLink external href="https://app.ethena.fi/join">
        🔗 {t(`Claim your rewards & learn more`)}
      </StyledLink>
      <Text as="span">{t(`on Ethena's official site.`)}</Text>
    </StyledCard>
  )
})
