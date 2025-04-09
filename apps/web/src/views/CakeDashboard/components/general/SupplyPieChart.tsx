import { useTranslation } from '@pancakeswap/localization'
import { Box, CardProps, DotIcon, FlexGap, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import styled from 'styled-components'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'

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

  const PEAK_SUPPLY = 450
  const TOTAL_SUPPLY = 380

  const data = [
    { name: 'Total CAKE Supply', value: TOTAL_SUPPLY, color: '#1FC7D4' },
    { name: 'Burned CAKE Supply', value: PEAK_SUPPLY - TOTAL_SUPPLY, color: '#7645D9' },
  ]

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload
      return (
        <TooltipCard>
          <FlexGap justifyContent="space-between" gap="8px">
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color={entry.color} width="12px" />
              <Text small>{entry.name}</Text>
            </FlexGap>
            <Text small bold>
              {entry.value}M CAKE
            </Text>
          </FlexGap>
        </TooltipCard>
      )
    }
    return null
  }

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Supply')}</StatsCardHeader>
      <ChartWrapper mt="24px">
        <TextContainer>
          <Text small>{t('Total Supply')}</Text>
          <Text fontSize="24px" bold>
            {TOTAL_SUPPLY}M CAKE
          </Text>
          <Text fontSize="14px" color="secondary" bold>
            {t('Burned')} {PEAK_SUPPLY - TOTAL_SUPPLY}M
          </Text>
          <Text fontSize="12px" color="textSubtle">
            {t('Peak Supply')} {PEAK_SUPPLY}M
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

      <LightGreyCard mt="auto" padding="8px 16px">
        <FlexGap gap="8px" alignItems="center">
          <DotIcon color="#1FC7D4" width="12px" />
          <Text small>{t('Total CAKE Supply')}:</Text>
          <Text fontSize="14px" bold>
            {TOTAL_SUPPLY}M CAKE
          </Text>
        </FlexGap>
        <FlexGap mt="8px" gap="8px" alignItems="center">
          <DotIcon color="#7645D9" width="12px" />
          <Text small>{t('Burned CAKE Supply')}:</Text>
          <Text fontSize="14px" bold>
            {PEAK_SUPPLY - TOTAL_SUPPLY}M CAKE
          </Text>
        </FlexGap>
      </LightGreyCard>
    </StatsCard>
  )
}
