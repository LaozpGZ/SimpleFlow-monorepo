import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import React from 'react'
import styled from 'styled-components'

export type SiteStats = {
  allTimeTraders: number
  allTimeTv: number
  allTimeLPFees: number
  community: number
}

const StatCard = styled(Box)<{
  bgColor: string
  borderColor: string
  textColor: string
  isMobile?: boolean
  index: number
}>`
  width: ${({ isMobile }) => (isMobile ? '156px' : '210px')};
  height: ${({ isMobile }) => (isMobile ? '110px' : '146px')};
  border-radius: ${({ isMobile }) => (isMobile ? '36px' : '48px')};
  border-top-width: 1px;
  border-right-width: 1px;
  border-bottom-width: 2px;
  border-left-width: 1px;
  border-style: solid;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, bgColor }) => theme.colors[bgColor]};
  border-color: ${({ theme, borderColor }) => theme.colors[borderColor]};
  margin-top: ${({ isMobile }) => (isMobile ? '8px' : '0')};
  margin-right: ${({ isMobile, index }) => (isMobile ? (index % 2 === 0 ? '16px' : '0px') : '24px')};
`

const Title = styled.div<{ textColor: string; isMobile?: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile }) => (isMobile ? '14px' : '20px')};
  line-height: ${({ isMobile }) => (isMobile ? '24px' : '30px')};
  text-align: center;
  letter-spacing: -1%;
  color: ${({ theme, textColor }) => theme.colors[textColor]};
`

const Value = styled.div<{ textColor: string; isMobile?: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile }) => (isMobile ? '32px' : '40px')};
  line-height: ${({ isMobile }) => (isMobile ? '40px' : '48px')};
  letter-spacing: -1%;
  background: transparent;
  text-align: center;
  margin-top: ${({ isMobile }) => (isMobile ? '2px' : '4px')};
  color: ${({ theme, textColor }) => theme.colors[textColor]};
`

export const StatsSummary: React.FC<{ stats: SiteStats }> = ({ stats }) => {
  const { isMobile } = useMatchBreakpoints()
  const { t } = useTranslation()

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      flexWrap={isMobile ? 'wrap' : 'nowrap'}
      flexDirection={isMobile ? 'row' : 'row'}
      mt={isMobile ? '40px' : '80px'}
      width="100%"
      maxWidth={isMobile ? '420px' : 'none'}
      mx="auto"
      padding="0"
    >
      <StatCard bgColor="primary10" borderColor="primary20" textColor="primary60" isMobile={isMobile} index={0}>
        <Title textColor="primary60" isMobile={isMobile}>
          {t('All Time Traders')}
        </Title>
        <Value textColor="primary60" isMobile={isMobile}>
          ~{formatAmount(stats.allTimeTraders)}
        </Value>
      </StatCard>

      <StatCard bgColor="secondary10" borderColor="cardBorder" textColor="secondary" isMobile={isMobile} index={1}>
        <Title textColor="secondary" isMobile={isMobile}>
          {t('All Time TV')}
        </Title>
        <Value textColor="secondary" isMobile={isMobile}>
          ${formatAmount(stats.allTimeTv)}
        </Value>
      </StatCard>

      <StatCard bgColor="blue10" borderColor="blue20" textColor="blue60" isMobile={isMobile} index={2}>
        <Title textColor="blue60" isMobile={isMobile}>
          {t('All Time LP Fees')}
        </Title>
        <Value textColor="blue60" isMobile={isMobile}>
          ${formatAmount(stats.allTimeLPFees)}
        </Value>
      </StatCard>

      <StatCard
        index={3}
        bgColor="destructive10"
        borderColor="destructive20"
        textColor="destructive60"
        isMobile={isMobile}
      >
        <Title textColor="destructive60" isMobile={isMobile}>
          {t('Community')}
        </Title>
        <Value textColor="destructive60" isMobile={isMobile}>
          {formatAmount(stats.community)}
        </Value>
      </StatCard>
    </Flex>
  )
}
