import { Box, Card, CardBody, Flex, Text } from '@pancakeswap/uikit'
import React, { ReactNode } from 'react'
import styled from 'styled-components'

const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: ${({ theme }) => theme.colors.card};
  max-width: 588px;
  padding: 0px 32px;
  border-radius: 48px;
`

interface CardSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
}

const Title = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  letter-spacing: -1%;
  color: ${({ theme }) => theme.colors.text};
`

const Subtitle = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 20px;
  line-height: 30px;
  letter-spacing: -1%;
  color: ${({ theme }) => theme.colors.textSubtle};
`

export const CardSection: React.FC<CardSectionProps> = ({ title, subtitle, children }) => (
  <StyledCard>
    <CardBody>
      <Box
        style={{
          padding: '24px 0px',
        }}
      >
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Box>
      <Flex flexDirection="column">{children}</Flex>
    </CardBody>
  </StyledCard>
)
