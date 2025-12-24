import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { SiteStats } from 'edge/home/types'
import React, { useCallback, useEffect, useState } from 'react'
import CountUp from 'react-countup'
import styled, { keyframes } from 'styled-components'

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const fadeOutDown = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`

const CardWrapper = styled(Box)<{ isMobile: boolean; isTablet: boolean }>`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ isMobile, isTablet }) => (isMobile ? '20px' : isTablet ? '28px' : '32px')};
  padding: ${({ isMobile, isTablet }) => (isMobile ? '16px 20px' : isTablet ? '20px 28px' : '24px 32px')};
  min-width: ${({ isMobile, isTablet }) => (isMobile ? '140px' : isTablet ? '180px' : '200px')};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const StatContent = styled(Box)<{ isAnimating: boolean; isExiting: boolean }>`
  animation: ${({ isAnimating, isExiting }) => (isAnimating ? (isExiting ? fadeOutDown : fadeInUp) : 'none')} 0.3s
    ease-out forwards;
`

const Label = styled(Text)<{ isMobile: boolean; isTablet: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isTablet }) => (isMobile ? '12px' : isTablet ? '14px' : '14px')};
  color: ${({ theme }) => theme.colors.textSubtle};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Value = styled(Text)<{ isMobile: boolean; isTablet: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isTablet }) => (isMobile ? '24px' : isTablet ? '28px' : '32px')};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
`

const DotsContainer = styled(Flex)`
  gap: 6px;
  margin-top: 8px;
`

const Dot = styled(Box)<{ isActive: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.textDisabled)};
  transition: background 0.2s ease;
`

type StatItem = {
  label: string
  value: number
  prefix?: string
  suffix?: string
}

interface StatsRotatingCardProps {
  stats?: SiteStats
  autoRotateInterval?: number
}

const formatFunction = (num: number) => {
  return (
    formatAmount(num, {
      precision: 1,
    }) || ''
  ).replace('.0', '')
}

export const StatsRotatingCard: React.FC<StatsRotatingCardProps> = ({ stats, autoRotateInterval = 4000 }) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const statItems: StatItem[] = React.useMemo(() => {
    if (!stats) return []
    return [
      { label: t('TVL'), value: stats.totalValueLocked, prefix: '$' },
      { label: t('Total Trades'), value: stats.totalTrades, suffix: '+' },
      { label: t('Total Users'), value: stats.totalUsers, suffix: '+' },
      { label: t('Community'), value: stats.community, suffix: '+' },
    ]
  }, [stats, t])

  const rotateToNext = useCallback(() => {
    if (statItems.length === 0) return

    setIsExiting(true)
    setIsAnimating(true)

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % statItems.length)
      setIsExiting(false)

      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }, 300)
  }, [statItems.length])

  useEffect(() => {
    if (statItems.length === 0) return undefined

    const interval = setInterval(rotateToNext, autoRotateInterval)
    return () => clearInterval(interval)
  }, [rotateToNext, autoRotateInterval, statItems.length])

  const handleClick = () => {
    rotateToNext()
  }

  if (!stats || statItems.length === 0) {
    return null
  }

  const currentStat = statItems[currentIndex]

  return (
    <CardWrapper isMobile={isMobile} isTablet={isTablet} onClick={handleClick}>
      <StatContent isAnimating={isAnimating} isExiting={isExiting}>
        <Label isMobile={isMobile} isTablet={isTablet}>
          {currentStat.label}
        </Label>
        <Value isMobile={isMobile} isTablet={isTablet}>
          {currentStat.prefix}
          <CountUp
            key={currentIndex}
            end={currentStat.value}
            duration={1.5}
            separator=","
            formattingFn={formatFunction}
          />
          {currentStat.suffix}
        </Value>
      </StatContent>
      <DotsContainer justifyContent="center">
        {statItems.map((_, index) => (
          <Dot key={`dot-${index}`} isActive={index === currentIndex} />
        ))}
      </DotsContainer>
    </CardWrapper>
  )
}
