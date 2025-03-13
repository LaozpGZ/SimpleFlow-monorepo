import { Box, Flex, Text, TriangleDownIcon, TriangleUpIcon, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useHoverContext } from 'hooks/useHover'
import React, { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

interface HomepageCardBadgeProps {
  text: string | ReactNode
  priceChange?: number
}

const Badge = styled(Flex)<{ isMobile: boolean; isHover: boolean }>`
  height: 40px;
  padding: 4px ${({ isMobile }) => (isMobile ? 8 : 16)}px;
  border-radius: ${({ isMobile }) => (isMobile ? '16px' : '999px')};
  border-color: ${({ theme, isHover }) => (isHover ? theme.colors.positive20 : 'transparent')};
  border-width: 2px;
  transition: border-width 0.5s;
  border-style: solid;
  background: ${({ theme }) => theme.colors.positive10};
  display: flex;
  align-items: center;
  text-align: right;
`

const Percent = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 11px;
    height: auto; /* recommended */
  }
`

export const HomepageCardBadge: React.FC<HomepageCardBadgeProps> = ({ text, priceChange }) => {
  const theme = useTheme()
  const positive = (priceChange ?? 0) >= 0
  const { isMobile } = useMatchBreakpoints()
  const isHover = useHoverContext()

  return (
    <Badge isMobile={isMobile} isHover={isHover}>
      <Box>
        {typeof text !== 'string' ? (
          text
        ) : (
          <Text bold color={positive ? theme.colors.positive60 : theme.colors.destructive60} mr="4px">
            {text}
          </Text>
        )}
      </Box>
      {priceChange !== undefined && (
        <Percent>
          {priceChange > 0 && <TriangleUpIcon />}
          {priceChange < 0 && <TriangleDownIcon />}
          <Text bold color="textSubtitle" ml="4px">
            {priceChange.toFixed(2)}%
          </Text>
        </Percent>
      )}
    </Badge>
  )
}
