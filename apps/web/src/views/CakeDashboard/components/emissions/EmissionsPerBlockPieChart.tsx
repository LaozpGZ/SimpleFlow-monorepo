import { useTranslation } from '@pancakeswap/localization'
import { Box, CardProps, DotIcon, FlexGap, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import styled from 'styled-components'
import { StatsCard, StatsCardHeader } from '../StatsCard'

const ChartWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const TextContainer = styled(Box)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: fit-content;
`

const data = [
  { name: 'Burned', value: 200, color: '#ED4B9E' },
  { name: 'V2Farms + StableSwap', value: 100, color: '#31D0AA' },
  { name: 'Special Farms', value: 300, color: '#FC9D31' },
]

export const EmissionsPerBlockPieChart = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Emission (per block)')}</StatsCardHeader>

      <ChartWrapper>
        <TextContainer>
          <Text fontSize="20px" bold>
            40 CAKE / block
          </Text>
        </TextContainer>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart width={280} height={280}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={110}
              cornerRadius={10}
              paddingAngle={2}
              fill="#8884d8"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <LightGreyCard padding="8px 16px">
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#ED4B9E" width="10px" height="10px" />
            <Text small>{t('Burned')}</Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#31D0AA" width="10px" height="10px" />
            <Text small>{t('V2Farms + StableSwap')}</Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#FC9D31" width="10px" height="10px" />
            <Text small>{t('Special Farms')}</Text>
          </FlexGap>

          <Text ml="24px" color="textSubtle" small>
            {t('Lottery')}
            <br />
            {t('Ecosystem Growth')}
            <br />
            {t('v3 Farms')}
            <br />
            {t('veCAKE')}
            <br />
            {t('v4 Farms')}
          </Text>
        </FlexGap>
      </LightGreyCard>
    </StatsCard>
  )
}
