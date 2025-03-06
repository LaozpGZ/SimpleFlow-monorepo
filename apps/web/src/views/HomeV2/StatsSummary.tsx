import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex } from '@pancakeswap/uikit'
import React from 'react'
import styled from 'styled-components'
import { formatNumber } from './util/formatNumber'

export type SiteStats = {
  allTimeTraders: number
  allTimeTv: number
  allTimeLPFees: number
  community: number
}

const StatCard = styled(Box)<{ bgColor: string; borderColor: string; textColor: string }>`
  width: 210px;
  height: 146px;
  border-radius: 48px;
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
  margin: 8px;
`

const Title = styled.div<{ textColor: string }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: 20px;
  line-height: 30px;
  text-align: center;
  letter-spacing: -1%;
  color: ${({ theme, textColor }) => theme.colors[textColor]};
`

const Value = styled.div<{ textColor: string }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: 40px;
  line-height: 48px;
  letter-spacing: -1%;
  background: transparent;
  text-align: center;
  margin-top: 4px;
  color: ${({ theme, textColor }) => theme.colors[textColor]};
`

export const StatsSummary: React.FC<{ stats: SiteStats }> = ({ stats }) => {
  const { t } = useTranslation()

  return (
    <Flex justifyContent="center" alignItems="center" flexWrap="wrap" mt="80px">
      <StatCard bgColor="primary10" borderColor="primary20" textColor="primary60">
        <Title textColor="primary60">{t('All Time Traders')}</Title>
        <Value textColor="primary60">{formatNumber(stats.allTimeTraders)}</Value>
      </StatCard>

      <StatCard bgColor="secondary10" borderColor="cardBorder" textColor="secondary">
        <Title textColor="secondary">{t('All Time TV')}</Title>
        <Value textColor="secondary">${formatNumber(stats.allTimeTv)}</Value>
      </StatCard>

      <StatCard bgColor="blue10" borderColor="blue20" textColor="blue60">
        <Title textColor="blue60">{t('All Time LP Fees')}</Title>
        <Value textColor="blue60">${formatNumber(stats.allTimeLPFees)}</Value>
      </StatCard>

      <StatCard bgColor="destructive10" borderColor="destructive20" textColor="destructive60">
        <Title textColor="destructive60">{t('Community')}</Title>
        <Value textColor="destructive60">{formatNumber(stats.community)}</Value>
      </StatCard>
    </Flex>
  )
}
