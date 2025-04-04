import { useTranslation } from '@pancakeswap/localization'
import { Box, CardProps, DotIcon, FlexGap, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import styled from 'styled-components'
import { StatsCard, StatsCardHeader } from '../StatsCard'

const TextContainer = styled(Box)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: fit-content;
`

const ChartWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 280px;
`

export const SupplyPieChart = (props: CardProps) => {
  const { t } = useTranslation()

  const TOTAL_MAX = 450
  const TOTAL_SUPPLY = 380
  const CIRCULATING = 290

  const data = [
    { name: 'Circulating', value: CIRCULATING, color: '#1FC7D4' },
    { name: 'Non-Circulating', value: TOTAL_SUPPLY - CIRCULATING, color: '#7645D9' },
    { name: 'Remaining', value: TOTAL_MAX - TOTAL_SUPPLY, color: '#FFB237' },
  ]

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload
      return (
        <LightGreyCard padding="8px 16px" style={{ userSelect: 'none' }}>
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color={entry.color} width="12px" />
            <Text small>
              {entry.name}: {entry.value}M CAKE
            </Text>
          </FlexGap>
        </LightGreyCard>
      )
    }
    return null
  }

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Supply')}</StatsCardHeader>
      <ChartWrapper mt="24px">
        <TextContainer>
          <Text small>Circulating</Text>
          <Text fontSize="24px" bold>
            {CIRCULATING}M CAKE
          </Text>
          <Text fontSize="14px" color="secondary" bold>
            Out of {TOTAL_SUPPLY}M
          </Text>
          <Text fontSize="12px" color="textSubtle">
            Max {TOTAL_MAX}M
          </Text>
        </TextContainer>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart width={280} height={280}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={210}
              endAngle={-150}
              cornerRadius={10}
              innerRadius={85}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </StatsCard>
  )
}
