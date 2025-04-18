import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Link, PresentWonIcon, Text, useTooltip } from '@pancakeswap/uikit'

import React from 'react'
import styled from 'styled-components'

const IconWrapper = styled(Box)`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
`

const StyledPresentIcon = styled(PresentWonIcon)`
  width: 20px;
  height: 20px;
  path {
    fill: ${({ theme }) => theme.colors.success};
  }
`

const RewardStatusDisplay: React.FC = () => {
  const { t } = useTranslation()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <Box>
      <Box>
        <Text bold as="span">
          {t('Earn 30x Ethena Points!')}
        </Text>
        <Text ml="4px" as="span">
          {t('Add liquidity to this pool and earn 30x Ethena points!')}
        </Text>
      </Box>
      <Link mt="8px" external href="https://ethena.fi">
        {t("Claim your rewards & learn more on Ethena's official site.")}
      </Link>
    </Box>,
    {
      placement: 'right',
    },
  )

  return (
    <Flex alignItems="center">
      <IconWrapper ref={targetRef}>
        <StyledPresentIcon />
      </IconWrapper>
      {tooltipVisible && tooltip}
    </Flex>
  )
}

export default RewardStatusDisplay
