import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import keyBy from 'lodash/keyBy'
import merge from 'lodash/merge'
import values from 'lodash/values'
import { useCallback, useMemo, useState } from 'react'
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
        <Text small>
          {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>

        <FlexGap mt="8px" flexDirection="column" gap="4px">
          <FlexGap justifyContent="space-between" gap="16px">
            <FlexGap alignItems="center" gap="6px">
              <DotIcon color="#7645D9" width="8px" mt="1px" />
              <Text small>{t('Total Supply')}</Text>
            </FlexGap>
            <Text small bold>
              {formatAmount(entry.totalSupply, { precision: getBurnInfoPrecision(entry.totalSupply) })}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between" gap="16px">
            <FlexGap alignItems="center" gap="6px">
              <DotIcon color="#02919D" width="8px" mt="1px" />
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

export const SupplyDeflationCombinedGraph = (props: CardProps) => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState('3m')

  const { data: burnStats } = useBurnStats()

  const allChartData = useMemo(() => {
    const keyedDataA = keyBy(burnStats?.totalSupplyTimeSeries, 'timestamp')
    const keyedDataB = keyBy(burnStats?.deflationTimeSeries, 'timestamp')

    const mergedData = merge(keyedDataA, keyedDataB)
    const finalSeriesData = values(mergedData)

    return finalSeriesData.map((item) => ({
      timestamp: item.timestamp,
      timestampFormatted: new Date(item.timestamp).toLocaleDateString('en-US', {
        ...(selectedTab !== '3m' && { year: 'numeric' }),
        month: 'short',
        day: selectedTab === 'All' ? undefined : 'numeric',
      }),
      totalSupply: item.total_supply,
      deflation: item.deflation,
    }))
  }, [selectedTab, burnStats])

  const filteredChartData = useMemo(() => {
    if (selectedTab === 'All') return allChartData

    const now = Date.now()
    let startTime: number

    switch (selectedTab) {
      case '3m':
        startTime = now - 3 * 30 * 24 * 60 * 60 * 1000 // 3 months in milliseconds
        break
      case '6m':
        startTime = now - 6 * 30 * 24 * 60 * 60 * 1000 // 6 months in milliseconds
        break
      case '1y':
        startTime = now - 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
        break
      default:
        return allChartData
    }

    return allChartData.filter((item) => item.timestamp >= startTime)
  }, [allChartData, selectedTab])

  const handleTabChange = useCallback((tab: string) => {
    setSelectedTab(tab)
  }, [])

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
        <TabMenu tabs={['3m', '6m', '1y', 'All']} defaultTab="3m" onTabChange={handleTabChange} />
      </FlexGap>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart width={900} height={300} data={filteredChartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F6F4FB" />
          <Line type="monotone" dataKey="totalSupply" stroke="#7645D9" strokeWidth={2} dot={false} />
          <Bar dataKey="deflation" fill="#02919D" barSize={4} radius={[4, 4, 4, 4]} />
          <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
          <XAxis
            dataKey="timestampFormatted"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#9383B4' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#9383B4' }}
            tickFormatter={(value) =>
              `${value < 0 ? '-' : ''}${formatAmount(Math.abs(value), {
                precision: getBurnInfoPrecision(value),
              })}`
            }
            domain={['auto', 'dataMax']}
          />
          {/* <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#9383B4' }}
            tickFormatter={(value) =>
              `${value < 0 ? '-' : ''}${formatAmount(Math.abs(value), {
                precision: getBurnInfoPrecision(value),
              })}`
            }
            domain={['dataMin', 0]}
          /> */}
        </ComposedChart>
      </ResponsiveContainer>

      <LightGreyCard padding="8px 16px" width="fit-content" mx="auto" mt="4px">
        <FlexGap alignItems="center" gap="16px" flexWrap="wrap">
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#7645D9" width="12px" />
            <Text color="textSubtle" small>
              {t('Total Supply')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#02919D" width="12px" />
            <Text color="textSubtle" small>
              {t('Deflation')}
            </Text>
          </FlexGap>
        </FlexGap>
      </LightGreyCard>
    </StatsCard>
  )
}
