import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, Text } from '@pancakeswap/uikit'
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

const data = [
  {
    name: 'Jan 2020',
    totalSupply: 25,
    circulatingSupply: 20,
    deflation: 0.2,
  },
  {
    name: 'Jul 2020',
    totalSupply: 85,
    circulatingSupply: 35,
    deflation: 0.2,
  },
  {
    name: 'Jan 2021',
    totalSupply: 150,
    circulatingSupply: 50,
    deflation: 0.2,
  },
  {
    name: 'Jul 2021',
    totalSupply: 170,
    circulatingSupply: 55,
    deflation: 0.25,
  },
  {
    name: 'Jan 2022',
    totalSupply: 190,
    circulatingSupply: 60,
    deflation: 0.3,
  },
  {
    name: 'Jul 2022',
    totalSupply: 205,
    circulatingSupply: 70,
    deflation: 0.35,
  },
  {
    name: 'Jan 2023',
    totalSupply: 220,
    circulatingSupply: 80,
    deflation: 0.4,
  },
  {
    name: 'Apr 2023',
    totalSupply: 230,
    circulatingSupply: 100,
    deflation: 0.2,
  },
  {
    name: 'Jul 2023',
    totalSupply: 240,
    circulatingSupply: 120,
    deflation: -0.5,
  },
  {
    name: 'Oct 2023',
    totalSupply: 245,
    circulatingSupply: 135,
    deflation: -1,
  },
  {
    name: 'Jan 2024',
    totalSupply: 250,
    circulatingSupply: 150,
    deflation: -2,
  },
  {
    name: 'Apr 2024',
    totalSupply: 248,
    circulatingSupply: 165,
    deflation: -4,
  },
  {
    name: 'Jul 2024',
    totalSupply: 245,
    circulatingSupply: 175,
    deflation: -6,
  },
  {
    name: 'Oct 2024',
    totalSupply: 242,
    circulatingSupply: 185,
    deflation: -7,
  },
  {
    name: 'Jan 2025',
    totalSupply: 240,
    circulatingSupply: 190,
    deflation: -120,
  },
  {
    name: 'Mar 2025',
    totalSupply: 238,
    circulatingSupply: 192,
    deflation: -200.5,
  },
  {
    name: 'Jun 2025',
    totalSupply: 236,
    circulatingSupply: 194,
    deflation: -220.8,
  },
  {
    name: 'Sep 2025',
    totalSupply: 234,
    circulatingSupply: 196,
    deflation: -240.2,
  },
  {
    name: 'Dec 2025',
    totalSupply: 232,
    circulatingSupply: 198,
    deflation: -260.5,
  },
  {
    name: 'Mar 2026',
    totalSupply: 230,
    circulatingSupply: 200,
    deflation: -280.7,
  },
  {
    name: 'Jun 2026',
    totalSupply: 228,
    circulatingSupply: 202,
    deflation: -300.9,
  },
  {
    name: 'Sep 2026',
    totalSupply: 226,
    circulatingSupply: 204,
    deflation: -320.3,
  },
  {
    name: 'Dec 2026',
    totalSupply: 224,
    circulatingSupply: 206,
    deflation: -340.6,
  },
  {
    name: 'Mar 2027',
    totalSupply: 222,
    circulatingSupply: 208,
    deflation: -360.8,
  },
  {
    name: 'Jun 2027',
    totalSupply: 220,
    circulatingSupply: 210,
    deflation: -380.2,
  },
  {
    name: 'Sep 2027',
    totalSupply: 218,
    circulatingSupply: 212,
    deflation: -400.5,
  },
  {
    name: 'Dec 2027',
    totalSupply: 216,
    circulatingSupply: 214,
    deflation: -420.7,
  },
  {
    name: 'Mar 2028',
    totalSupply: 214,
    circulatingSupply: 216,
    deflation: -440.1,
  },
  {
    name: 'Jun 2028',
    totalSupply: 212,
    circulatingSupply: 218,
    deflation: -460.4,
  },
  {
    name: 'Sep 2028',
    totalSupply: 210,
    circulatingSupply: 220,
    deflation: -480.6,
  },
  {
    name: 'Dec 2028',
    totalSupply: 208,
    circulatingSupply: 222,
    deflation: -500.0,
  },
  {
    name: 'Mar 2029',
    totalSupply: 206,
    circulatingSupply: 224,
    deflation: -520.3,
  },
  {
    name: 'Jun 2029',
    totalSupply: 204,
    circulatingSupply: 226,
    deflation: -540.5,
  },
  {
    name: 'Sep 2029',
    totalSupply: 202,
    circulatingSupply: 228,
    deflation: -560.9,
  },
  {
    name: 'Dec 2029',
    totalSupply: 200,
    circulatingSupply: 230,
    deflation: -580.2,
  },
  {
    name: 'Mar 2030',
    totalSupply: 198,
    circulatingSupply: 232,
    deflation: -600.4,
  },
  {
    name: 'Jun 2030',
    totalSupply: 196,
    circulatingSupply: 234,
    deflation: -620.8,
  },
  {
    name: 'Sep 2030',
    totalSupply: 194,
    circulatingSupply: 236,
    deflation: -640.1,
  },
  {
    name: 'Dec 2030',
    totalSupply: 192,
    circulatingSupply: 238,
    deflation: -660.3,
  },
  {
    name: 'Mar 2031',
    totalSupply: 190,
    circulatingSupply: 240,
    deflation: -680.7,
  },
  {
    name: 'Jun 2031',
    totalSupply: 188,
    circulatingSupply: 242,
    deflation: -700.0,
  },
  {
    name: 'Sep 2031',
    totalSupply: 186,
    circulatingSupply: 244,
    deflation: -720.2,
  },
  {
    name: 'Dec 2031',
    totalSupply: 184,
    circulatingSupply: 246,
    deflation: -740.6,
  },
  {
    name: 'Mar 2032',
    totalSupply: 182,
    circulatingSupply: 248,
    deflation: -760.9,
  },
  {
    name: 'Jun 2032',
    totalSupply: 180,
    circulatingSupply: 250,
    deflation: -780.1,
  },
  {
    name: 'Sep 2032',
    totalSupply: 178,
    circulatingSupply: 252,
    deflation: -800.5,
  },
  {
    name: 'Dec 2032',
    totalSupply: 176,
    circulatingSupply: 254,
    deflation: -820.8,
  },
  {
    name: 'Mar 2033',
    totalSupply: 174,
    circulatingSupply: 256,
    deflation: -840.0,
  },
  {
    name: 'Jun 2033',
    totalSupply: 172,
    circulatingSupply: 258,
    deflation: -860.4,
  },
  {
    name: 'Sep 2033',
    totalSupply: 170,
    circulatingSupply: 260,
    deflation: -880.7,
  },
  {
    name: 'Dec 2033',
    totalSupply: 168,
    circulatingSupply: 262,
    deflation: -900.1,
  },
  {
    name: 'Mar 2034',
    totalSupply: 166,
    circulatingSupply: 264,
    deflation: -920.3,
  },
  {
    name: 'Jun 2034',
    totalSupply: 164,
    circulatingSupply: 266,
    deflation: -940.6,
  },
  {
    name: 'Sep 2034',
    totalSupply: 162,
    circulatingSupply: 268,
    deflation: -960.0,
  },
  {
    name: 'Dec 2034',
    totalSupply: 160,
    circulatingSupply: 270,
    deflation: -980.2,
  },
  {
    name: 'Mar 2035',
    totalSupply: 158,
    circulatingSupply: 272,
    deflation: -1000.5,
  },
  {
    name: 'Jun 2035',
    totalSupply: 156,
    circulatingSupply: 274,
    deflation: -1020.7,
  },
  {
    name: 'Sep 2035',
    totalSupply: 154,
    circulatingSupply: 276,
    deflation: -1040.1,
  },
  {
    name: 'Dec 2035',
    totalSupply: 152,
    circulatingSupply: 278,
    deflation: -1060.4,
  },
  {
    name: 'Mar 2036',
    totalSupply: 150,
    circulatingSupply: 280,
    deflation: -1080.6,
  },
  {
    name: 'Jun 2036',
    totalSupply: 148,
    circulatingSupply: 282,
    deflation: -1100.0,
  },
  {
    name: 'Sep 2036',
    totalSupply: 146,
    circulatingSupply: 284,
    deflation: -1120.3,
  },
  {
    name: 'Dec 2036',
    totalSupply: 144,
    circulatingSupply: 286,
    deflation: -1140.5,
  },
  {
    name: 'Mar 2037',
    totalSupply: 142,
    circulatingSupply: 288,
    deflation: -1160.9,
  },
  {
    name: 'Jun 2037',
    totalSupply: 140,
    circulatingSupply: 290,
    deflation: -1180.2,
  },
  {
    name: 'Sep 2037',
    totalSupply: 138,
    circulatingSupply: 292,
    deflation: -1200.4,
  },
  {
    name: 'Dec 2037',
    totalSupply: 136,
    circulatingSupply: 294,
    deflation: -1220.8,
  },
  {
    name: 'Mar 2038',
    totalSupply: 134,
    circulatingSupply: 296,
    deflation: -1240.1,
  },
  {
    name: 'Jun 2038',
    totalSupply: 132,
    circulatingSupply: 298,
    deflation: -1260.3,
  },
  {
    name: 'Sep 2038',
    totalSupply: 130,
    circulatingSupply: 300,
    deflation: -1280.7,
  },
  {
    name: 'Dec 2038',
    totalSupply: 128,
    circulatingSupply: 302,
    deflation: -1300.0,
  },
  {
    name: 'Mar 2039',
    totalSupply: 126,
    circulatingSupply: 304,
    deflation: -1320.2,
  },
  {
    name: 'Jun 2039',
    totalSupply: 124,
    circulatingSupply: 306,
    deflation: -1340.6,
  },
  {
    name: 'Sep 2039',
    totalSupply: 122,
    circulatingSupply: 308,
    deflation: -1360.9,
  },
  {
    name: 'Dec 2039',
    totalSupply: 120,
    circulatingSupply: 310,
    deflation: -1380.1,
  },
  {
    name: 'Mar 2040',
    totalSupply: 118,
    circulatingSupply: 312,
    deflation: -1400.5,
  },
  {
    name: 'Jun 2040',
    totalSupply: 116,
    circulatingSupply: 314,
    deflation: -1420.8,
  },
  {
    name: 'Sep 2040',
    totalSupply: 114,
    circulatingSupply: 316,
    deflation: -1440.0,
  },
  {
    name: 'Dec 2040',
    totalSupply: 112,
    circulatingSupply: 318,
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
              <DotIcon color="#31D0AA" width="12px" />
              <Text small>{t('Circulating Supply')}</Text>
            </FlexGap>
            <Text small bold>
              {entry.circulatingSupply}
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
export const CumulativeDeflationCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <StatsCardHeader mb="16px">{t('Cumulative Deflation')}</StatsCardHeader>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart width={900} height={300} data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F6F4FB" />
          <Line type="monotone" dataKey="circulatingSupply" stroke="#31D0AA" strokeWidth={2} dot={false} />
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
            <DotIcon color="#31D0AA" width="12px" />
            <Text small>{t('Cumulative Deflation')}</Text>
          </FlexGap>
          <VerticalDivider bg="#D7CAEC" />
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#7645D9" width="12px" />
            <Text small>{t('Deflation')}</Text>
          </FlexGap>
          <VerticalDivider bg="#D7CAEC" />
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#02919D" width="12px" />
            <Text small>{t('Net Mint')}</Text>
          </FlexGap>
        </FlexGap>
      </LightGreyCard>
    </StatsCard>
  )
}
