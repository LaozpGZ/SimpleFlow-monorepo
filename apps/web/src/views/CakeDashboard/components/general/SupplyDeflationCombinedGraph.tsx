import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { VerticalDivider } from '@pancakeswap/widgets-internal'
import { LightGreyCard } from 'components/Card'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'
import { TabMenu } from '../TabMenu'

const data = [
  {
    name: 'Jan 2020',
    totalSupply: 25,
    deflation: 0.2,
  },
  {
    name: 'Jul 2020',
    totalSupply: 85,
    deflation: 0.2,
  },
  {
    name: 'Jan 2021',
    totalSupply: 150,
    deflation: 0.2,
  },
  {
    name: 'Jul 2021',
    totalSupply: 170,
    deflation: 0.25,
  },
  {
    name: 'Jan 2022',
    totalSupply: 190,
    deflation: 0.3,
  },
  {
    name: 'Jul 2022',
    totalSupply: 205,
    deflation: 0.35,
  },
  {
    name: 'Jan 2023',
    totalSupply: 220,
    deflation: 0.4,
  },
  {
    name: 'Apr 2023',
    totalSupply: 230,
    deflation: 0.2,
  },
  {
    name: 'Jul 2023',
    totalSupply: 240,
    deflation: -0.5,
  },
  {
    name: 'Oct 2023',
    totalSupply: 245,
    deflation: -1,
  },
  {
    name: 'Jan 2024',
    totalSupply: 250,
    deflation: -2,
  },
  {
    name: 'Apr 2024',
    totalSupply: 248,
    deflation: -4,
  },
  {
    name: 'Jul 2024',
    totalSupply: 245,
    deflation: -6,
  },
  {
    name: 'Oct 2024',
    totalSupply: 242,
    deflation: -7,
  },
  {
    name: 'Jan 2025',
    totalSupply: 240,
    deflation: -120,
  },
  {
    name: 'Mar 2025',
    totalSupply: 238,
    deflation: -200.5,
  },
  {
    name: 'Jun 2025',
    totalSupply: 236,
    deflation: -220.8,
  },
  {
    name: 'Sep 2025',
    totalSupply: 234,
    deflation: -240.2,
  },
  {
    name: 'Dec 2025',
    totalSupply: 232,
    deflation: -260.5,
  },
  {
    name: 'Mar 2026',
    totalSupply: 230,
    deflation: -280.7,
  },
  {
    name: 'Jun 2026',
    totalSupply: 228,
    deflation: -300.9,
  },
  {
    name: 'Sep 2026',
    totalSupply: 226,
    deflation: -320.3,
  },
  {
    name: 'Dec 2026',
    totalSupply: 224,
    deflation: -340.6,
  },
  {
    name: 'Mar 2027',
    totalSupply: 222,
    deflation: -360.8,
  },
  {
    name: 'Jun 2027',
    totalSupply: 220,
    deflation: -380.2,
  },
  {
    name: 'Sep 2027',
    totalSupply: 218,
    deflation: -400.5,
  },
  {
    name: 'Dec 2027',
    totalSupply: 216,
    deflation: -420.7,
  },
  {
    name: 'Mar 2028',
    totalSupply: 214,
    deflation: -440.1,
  },
  {
    name: 'Jun 2028',
    totalSupply: 212,
    deflation: -460.4,
  },
  {
    name: 'Sep 2028',
    totalSupply: 210,
    deflation: -480.6,
  },
  {
    name: 'Dec 2028',
    totalSupply: 208,
    deflation: -500.0,
  },
  {
    name: 'Mar 2029',
    totalSupply: 206,
    deflation: -520.3,
  },
  {
    name: 'Jun 2029',
    totalSupply: 204,
    deflation: -540.5,
  },
  {
    name: 'Sep 2029',
    totalSupply: 202,
    deflation: -560.9,
  },
  {
    name: 'Dec 2029',
    totalSupply: 200,
    deflation: -580.2,
  },
  {
    name: 'Mar 2030',
    totalSupply: 198,
    deflation: -600.4,
  },
  {
    name: 'Jun 2030',
    totalSupply: 196,
    deflation: -620.8,
  },
  {
    name: 'Sep 2030',
    totalSupply: 194,
    deflation: -640.1,
  },
  {
    name: 'Dec 2030',
    totalSupply: 192,
    deflation: -660.3,
  },
  {
    name: 'Mar 2031',
    totalSupply: 190,
    deflation: -680.7,
  },
  {
    name: 'Jun 2031',
    totalSupply: 188,
    deflation: -700.0,
  },
  {
    name: 'Sep 2031',
    totalSupply: 186,
    deflation: -720.2,
  },
  {
    name: 'Dec 2031',
    totalSupply: 184,
    deflation: -740.6,
  },
  {
    name: 'Mar 2032',
    totalSupply: 182,
    deflation: -760.9,
  },
  {
    name: 'Jun 2032',
    totalSupply: 180,
    deflation: -780.1,
  },
  {
    name: 'Sep 2032',
    totalSupply: 178,
    deflation: -800.5,
  },
  {
    name: 'Dec 2032',
    totalSupply: 176,
    deflation: -820.8,
  },
  {
    name: 'Mar 2033',
    totalSupply: 174,
    deflation: -840.0,
  },
  {
    name: 'Jun 2033',
    totalSupply: 172,
    deflation: -860.4,
  },
  {
    name: 'Sep 2033',
    totalSupply: 170,
    deflation: -880.7,
  },
  {
    name: 'Dec 2033',
    totalSupply: 168,
    deflation: -900.1,
  },
  {
    name: 'Mar 2034',
    totalSupply: 166,
    deflation: -920.3,
  },
  {
    name: 'Jun 2034',
    totalSupply: 164,
    deflation: -940.6,
  },
  {
    name: 'Sep 2034',
    totalSupply: 162,
    deflation: -960.0,
  },
  {
    name: 'Dec 2034',
    totalSupply: 160,
    deflation: -980.2,
  },
  {
    name: 'Mar 2035',
    totalSupply: 158,
    deflation: -1000.5,
  },
  {
    name: 'Jun 2035',
    totalSupply: 156,
    deflation: -1020.7,
  },
  {
    name: 'Sep 2035',
    totalSupply: 154,
    deflation: -1040.1,
  },
  {
    name: 'Dec 2035',
    totalSupply: 152,
    deflation: -1060.4,
  },
  {
    name: 'Mar 2036',
    totalSupply: 150,
    deflation: -1080.6,
  },
  {
    name: 'Jun 2036',
    totalSupply: 148,
    deflation: -1100.0,
  },
  {
    name: 'Sep 2036',
    totalSupply: 146,
    deflation: -1120.3,
  },
  {
    name: 'Dec 2036',
    totalSupply: 144,
    deflation: -1140.5,
  },
  {
    name: 'Mar 2037',
    totalSupply: 142,
    deflation: -1160.9,
  },
  {
    name: 'Jun 2037',
    totalSupply: 140,
    deflation: -1180.2,
  },
  {
    name: 'Sep 2037',
    totalSupply: 138,
    deflation: -1200.4,
  },
  {
    name: 'Dec 2037',
    totalSupply: 136,
    deflation: -1220.8,
  },
  {
    name: 'Mar 2038',
    totalSupply: 134,
    deflation: -1240.1,
  },
  {
    name: 'Jun 2038',
    totalSupply: 132,
    deflation: -1260.3,
  },
  {
    name: 'Sep 2038',
    totalSupply: 130,
    deflation: -1280.7,
  },
  {
    name: 'Dec 2038',
    totalSupply: 128,
    deflation: -1300.0,
  },
  {
    name: 'Mar 2039',
    totalSupply: 126,
    deflation: -1320.2,
  },
  {
    name: 'Jun 2039',
    totalSupply: 124,
    deflation: -1340.6,
  },
  {
    name: 'Sep 2039',
    totalSupply: 122,
    deflation: -1360.9,
  },
  {
    name: 'Dec 2039',
    totalSupply: 120,
    deflation: -1380.1,
  },
  {
    name: 'Mar 2040',
    totalSupply: 118,
    deflation: -1400.5,
  },
  {
    name: 'Jun 2040',
    totalSupply: 116,
    deflation: -1420.8,
  },
  {
    name: 'Sep 2040',
    totalSupply: 114,
    deflation: -1440.0,
  },
  {
    name: 'Dec 2040',
    totalSupply: 112,
    deflation: -1460.4,
  },
]

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  const { t } = useTranslation()

  if (active && payload && payload.length) {
    const entry = payload[0].payload
    return (
      <TooltipCard>
        <Text small>{entry.name}</Text>

        <FlexGap mt="8px" flexDirection="column" gap="4px">
          <FlexGap justifyContent="space-between" gap="16px">
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#7645D9" width="12px" />
              <Text small>{t('Total Supply')}</Text>
            </FlexGap>
            <Text small bold>
              {entry.totalSupply}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between" gap="16px">
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#02919D" width="12px" />
              <Text small>{t('Deflation')}</Text>
            </FlexGap>
            <Text small bold>
              {entry.deflation}
            </Text>
          </FlexGap>
        </FlexGap>
      </TooltipCard>
    )
  }
  return null
}

export const SupplyDeflationCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <FlexGap mb="16px" justifyContent="space-between" flexWrap="wrap" gap="8px">
        <StatsCardHeader>
          <FlexGap alignItems="center" gap="8px">
            {t('Supply & Deflation')}
            <QuestionHelperV2
              text={t('Weekly decrease in CAKE supply (Deflation) and the corresponding CAKE supply')}
              placement="top"
            >
              <InfoIcon color="textSubtle" />
            </QuestionHelperV2>
          </FlexGap>
        </StatsCardHeader>
        <TabMenu />
      </FlexGap>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart width={900} height={300} data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F6F4FB" />
          <Line type="monotone" dataKey="totalSupply" stroke="#7645D9" strokeWidth={2} dot={false} />
          <Bar dataKey="deflation" fill="#02919D" barSize={4} radius={[4, 4, 4, 4]} />
          <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9383B4' }} />
          <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9383B4' }} />
        </ComposedChart>
      </ResponsiveContainer>

      <LightGreyCard padding="8px" width="fit-content" mx="auto" mt="4px">
        <FlexGap alignItems="center" gap="4px" flexWrap="wrap">
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#7645D9" width="12px" />
            <Text small>{t('Total Supply')}</Text>
          </FlexGap>
          <VerticalDivider bg="#D7CAEC" />
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#02919D" width="12px" />
            <Text small>{t('Deflation')}</Text>
          </FlexGap>
        </FlexGap>
      </LightGreyCard>
    </StatsCard>
  )
}
