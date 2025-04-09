import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { VerticalDivider } from '@pancakeswap/widgets-internal'
import { LightGreyCard } from 'components/Card'
import keyBy from 'lodash/keyBy'
import merge from 'lodash/merge'
import values from 'lodash/values'
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
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/CakeDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/CakeDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'
import { TabMenu } from '../TabMenu'

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
              {formatAmount(entry.totalSupply, { precision: getBurnInfoPrecision(entry.totalSupply) })}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between" gap="16px">
            <FlexGap alignItems="center" gap="4px">
              <DotIcon color="#02919D" width="12px" />
              <Text small>{t('Deflation')}</Text>
            </FlexGap>
            <Text small bold>
              {entry.deflation < 0 ? '-' : ''}
              {formatAmount(Math.abs(entry.deflation), { precision: getBurnInfoPrecision(entry.deflation) })}
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

  const { data: burnStats } = useBurnStats()

  const keyedDataA = keyBy(burnStats?.totalSupplyTimeSeries, 'timestamp')
  const keyedDataB = keyBy(burnStats?.deflationTimeSeries, 'timestamp')

  const mergedData = merge(keyedDataA, keyedDataB)
  const finalSeriesData = values(mergedData)

  const chartData = finalSeriesData.map((item) => ({
    name: new Date(item.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    totalSupply: item.total_supply,
    deflation: item.deflation,
  }))

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
        <ComposedChart width={900} height={300} data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F6F4FB" />
          <Line type="monotone" dataKey="totalSupply" stroke="#7645D9" strokeWidth={2} dot={false} />
          <Bar dataKey="deflation" fill="#02919D" barSize={4} radius={[4, 4, 4, 4]} />
          <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9383B4' }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#9383B4' }}
            tickFormatter={(value) => formatAmount(value, { precision: getBurnInfoPrecision(value) }) || value}
          />
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
