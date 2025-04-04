import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'

const data = [
  {
    name: 'Dec 2nd',
    tradingFeeV2: 400000,
    tradingFeeV3: 600000,
    prediction: 100000,
    lottery: 50000,
    perpetual: 100000,
    stableSwap: 75000,
  },
  {
    name: 'Dec 23rd',
    tradingFeeV2: 300000,
    tradingFeeV3: 500000,
    prediction: 150000,
    lottery: 50000,
    perpetual: 125000,
    stableSwap: 100000,
  },
  {
    name: 'Jan 13th',
    tradingFeeV2: 200000,
    tradingFeeV3: 300000,
    prediction: 100000,
    lottery: 50000,
    perpetual: 150000,
    stableSwap: 125000,
  },
  {
    name: 'Feb 3rd',
    tradingFeeV2: 300000,
    tradingFeeV3: 600000,
    prediction: 150000,
    lottery: 50000,
    perpetual: 175000,
    stableSwap: 150000,
  },
  {
    name: 'Feb 24th',
    tradingFeeV2: 500000,
    tradingFeeV3: 1200000,
    prediction: 200000,
    lottery: 100000,
    perpetual: 200000,
    stableSwap: 175000,
  },
  {
    name: 'Mar 17th',
    tradingFeeV2: 1000000,
    tradingFeeV3: 1500000,
    prediction: 300000,
    lottery: 200000,
    perpetual: 225000,
    stableSwap: 200000,
  },
  {
    name: 'Apr 7th',
    tradingFeeV2: 900000,
    tradingFeeV3: 1300000,
    prediction: 250000,
    lottery: 150000,
    perpetual: 200000,
    stableSwap: 180000,
  },
  {
    name: 'Apr 28th',
    tradingFeeV2: 1100000,
    tradingFeeV3: 1700000,
    prediction: 280000,
    lottery: 180000,
    perpetual: 190000,
    stableSwap: 160000,
  },
  {
    name: 'May 19th',
    tradingFeeV2: 800000,
    tradingFeeV3: 1400000,
    prediction: 220000,
    lottery: 120000,
    perpetual: 170000,
    stableSwap: 140000,
  },
  {
    name: 'Jun 9th',
    tradingFeeV2: 1200000,
    tradingFeeV3: 1900000,
    prediction: 320000,
    lottery: 220000,
    perpetual: 210000,
    stableSwap: 190000,
  },
  {
    name: 'Jun 30th',
    tradingFeeV2: 950000,
    tradingFeeV3: 1600000,
    prediction: 270000,
    lottery: 170000,
    perpetual: 190000,
    stableSwap: 170000,
  },
  {
    name: 'Jul 21st',
    tradingFeeV2: 1300000,
    tradingFeeV3: 2100000,
    prediction: 350000,
    lottery: 250000,
    perpetual: 230000,
    stableSwap: 210000,
  },
  {
    name: 'Aug 11th',
    tradingFeeV2: 1100000,
    tradingFeeV3: 1800000,
    prediction: 290000,
    lottery: 190000,
    perpetual: 210000,
    stableSwap: 190000,
  },
  {
    name: 'Sep 1st',
    tradingFeeV2: 1400000,
    tradingFeeV3: 2300000,
    prediction: 380000,
    lottery: 280000,
    perpetual: 250000,
    stableSwap: 230000,
  },
  {
    name: 'Sep 22nd',
    tradingFeeV2: 1200000,
    tradingFeeV3: 2000000,
    prediction: 320000,
    lottery: 220000,
    perpetual: 230000,
    stableSwap: 210000,
  },
  {
    name: 'Oct 13th',
    tradingFeeV2: 1500000,
    tradingFeeV3: 2500000,
    prediction: 420000,
    lottery: 320000,
    perpetual: 270000,
    stableSwap: 250000,
  },
  {
    name: 'Nov 3rd',
    tradingFeeV2: 1300000,
    tradingFeeV3: 2200000,
    prediction: 360000,
    lottery: 260000,
    perpetual: 250000,
    stableSwap: 230000,
  },
  {
    name: 'Nov 24th',
    tradingFeeV2: 1600000,
    tradingFeeV3: 2700000,
    prediction: 450000,
    lottery: 350000,
    perpetual: 290000,
    stableSwap: 270000,
  },
  {
    name: 'Dec 15th',
    tradingFeeV2: 1400000,
    tradingFeeV3: 2400000,
    prediction: 390000,
    lottery: 290000,
    perpetual: 270000,
    stableSwap: 250000,
  },
  {
    name: 'Jan 5th',
    tradingFeeV2: 1700000,
    tradingFeeV3: 2900000,
    prediction: 480000,
    lottery: 380000,
    perpetual: 310000,
    stableSwap: 290000,
  },
  {
    name: 'Jan 26th',
    tradingFeeV2: 1500000,
    tradingFeeV3: 2600000,
    prediction: 420000,
    lottery: 320000,
    perpetual: 290000,
    stableSwap: 270000,
  },
  {
    name: 'Feb 16th',
    tradingFeeV2: 1800000,
    tradingFeeV3: 3100000,
    prediction: 510000,
    lottery: 410000,
    perpetual: 330000,
    stableSwap: 310000,
  },
  {
    name: 'Mar 9th',
    tradingFeeV2: 1600000,
    tradingFeeV3: 2800000,
    prediction: 450000,
    lottery: 350000,
    perpetual: 310000,
    stableSwap: 290000,
  },
  {
    name: 'Mar 30th',
    tradingFeeV2: 1900000,
    tradingFeeV3: 3300000,
    prediction: 540000,
    lottery: 440000,
    perpetual: 350000,
    stableSwap: 330000,
  },
  {
    name: 'Apr 20th',
    tradingFeeV2: 1700000,
    tradingFeeV3: 3000000,
    prediction: 480000,
    lottery: 380000,
    perpetual: 330000,
    stableSwap: 310000,
  },
  {
    name: 'May 11th',
    tradingFeeV2: 2000000,
    tradingFeeV3: 3500000,
    prediction: 570000,
    lottery: 470000,
    perpetual: 370000,
    stableSwap: 350000,
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    return (
      <TooltipCard>
        <Text small mb="8px">
          {label}
        </Text>
        {payload.map((entry: any) => (
          <FlexGap justifyContent="space-between" gap="16px" key={entry.name}>
            <FlexGap key={entry.name} alignItems="center" gap="6px" mb="4px">
              <DotIcon color={entry.color} width="8px" mt="2px" />
              <Text small>{t(entry.name)}</Text>
            </FlexGap>
            <Text small bold>
              {entry.value.toLocaleString()}
            </Text>
          </FlexGap>
        ))}
      </TooltipCard>
    )
  }
  return null
}

export const WeeklyEmissionsStackedBarChart = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Weekly Emissions')}</StatsCardHeader>

      <FlexGap height="100%" flexWrap={['wrap', 'wrap', 'wrap', 'wrap', 'nowrap']}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={300}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <Bar dataKey="tradingFeeV2" fill="#1FC7D4" stackId="stack" radius={[0, 0, 4, 4]} barSize={20} />
            <Bar dataKey="tradingFeeV3" fill="#7645D9" stackId="stack" barSize={20} />
            <Bar dataKey="prediction" fill="#FFB237" stackId="stack" barSize={20} />
            <Bar dataKey="lottery" fill="#ED4B9E" stackId="stack" barSize={20} />
            <Bar dataKey="perpetual" fill="#2882CC" stackId="stack" barSize={20} />
            <Bar dataKey="stableSwap" fill="#31D0AA" stackId="stack" radius={[4, 4, 0, 0]} barSize={20} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} wrapperStyle={{ outline: 'none' }} />
            <XAxis dataKey="name" fontSize="12px" tick={{ fill: '#9383B4' }} tickLine={false} axisLine={false} />
            <YAxis fontSize="12px" tick={{ fill: '#9383B4' }} tickLine={false} axisLine={false} />
          </BarChart>
        </ResponsiveContainer>
        <LightGreyCard padding="8px 16px" width="fit-content" height="fit-content">
          <FlexGap flexDirection={['row', 'row', 'row', 'row', 'column']} gap="8px" flexWrap="wrap">
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#1FC7D4" width="12px" />
              <Text color="textSubtle" width="max-content" small>
                {t('Trading Fee V2')}
              </Text>
            </FlexGap>
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#7645D9" width="12px" />
              <Text color="textSubtle" width="max-content" small>
                {t('Trading Fee V3')}
              </Text>
            </FlexGap>
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#FFB237" width="12px" />
              <Text color="textSubtle" small>
                {t('Prediction')}
              </Text>
            </FlexGap>
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#ED4B9E" width="12px" />
              <Text color="textSubtle" small>
                {t('Lottery')}
              </Text>
            </FlexGap>
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#2882CC" width="12px" />
              <Text color="textSubtle" small>
                {t('Perpetual')}
              </Text>
            </FlexGap>
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#31D0AA" width="12px" />
              <Text color="textSubtle" small>
                {t('StableSwap')}
              </Text>
            </FlexGap>
          </FlexGap>
        </LightGreyCard>
      </FlexGap>
    </StatsCard>
  )
}
