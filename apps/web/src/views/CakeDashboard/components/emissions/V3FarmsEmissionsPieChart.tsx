import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, Grid, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import styled from 'styled-components'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'

const ChartWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const TextContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const data = [
  { name: 'BNB Chain', value: 400, color: '#F0B90B' },
  { name: 'Ethereum', value: 300, color: '#6074E3' },
  { name: 'zkEVM', value: 200, color: '#7645D9' },
  { name: 'ZKsync Era', value: 200, color: '#000000' },
  { name: 'Arbitrum', value: 300, color: '#28A0F0' },
  { name: 'Linea', value: 200, color: '#87CEEB' },
  { name: 'Base', value: 300, color: '#0052FF' },
  { name: 'Aptos', value: 200, color: '#27D17F' },
  { name: 'Monad', value: 200, color: '#C5A1FF' },
  { name: 'opBNB', value: 200, color: '#F0943C' },
  { name: 'Solana', value: 200, color: '#E42575' },
]

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const percentage = ((entry.value / total) * 100).toFixed(2)

    return (
      <TooltipCard>
        <FlexGap justifyContent="space-between" gap="8px">
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color={entry.color} width="12px" />
            <Text small>{entry.name}</Text>
          </FlexGap>
          <Text small bold>
            {percentage}%
          </Text>
        </FlexGap>
      </TooltipCard>
    )
  }
  return null
}

export const V3FarmsEmissionsPieChart = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('V3 Farms Allocation')}</StatsCardHeader>

      <ChartWrapper>
        <TextContainer>
          <Text fontSize="20px" bold>
            {t('XX CAKE / Block')}
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
              innerRadius={95}
              outerRadius={110}
              cornerRadius={10}
              paddingAngle={2}
              fill="#8884d8"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <LightGreyCard padding="8px 16px">
        <Grid gridTemplateColumns="1fr 1fr" gridTemplateRows="span 6" style={{ gap: '8px' }}>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#F0B90B" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('BNB Chain')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#6074E3" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('Ethereum')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#7645D9" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('zkEVM')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#000000" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('ZKsync Era')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#28A0F0" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('Arbitrum')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#87CEEB" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('Linea')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#0052FF" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('Base')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#27D17F" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('Aptos')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#C5A1FF" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('Monad')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#F0943C" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('opBNB')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="8px">
            <DotIcon color="#E42575" width="10px" height="10px" />
            <Text color="textSubtle" small>
              {t('Solana')}
            </Text>
          </FlexGap>
        </Grid>
      </LightGreyCard>
    </StatsCard>
  )
}
