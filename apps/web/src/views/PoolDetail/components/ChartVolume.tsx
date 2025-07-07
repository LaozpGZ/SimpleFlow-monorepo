import { useTheme } from '@pancakeswap/hooks'
import { Flex, Text } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { usePoolChartVolumeData } from '../hooks/usePoolChartVolumeData'

const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 10;
`

type ChartVolumeProps = {
  address?: string
  poolInfo?: PoolInfo | null
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <TooltipCard>
        <Text small color="textSubtle">
          {dayjs(data.time).format('MMM D, YYYY, HH:mm A')} UTC
        </Text>
        <Text bold>{formatDollarAmount(data.value)}</Text>
      </TooltipCard>
    )
  }
  return null
}

export const ChartVolume: React.FC<ChartVolumeProps> = ({ address, poolInfo }) => {
  const { data } = usePoolChartVolumeData(address, poolInfo?.protocol, '1Y')
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  const { theme } = useTheme()

  // Transform data for recharts
  const chartData =
    data?.map((item) => ({
      time: item.time,
      value: item.value,
      formattedTime: dayjs(item.time).format('MMM D'),
    })) || []

  return (
    <>
      <Flex mb="24px" flexDirection="column">
        <Text bold fontSize={24}>
          {formatDollarAmount(latestValue ?? data?.[data.length - 1]?.value)}
        </Text>
        <Text small color="secondary">
          {`${dayjs(valueLabel ?? data?.[data.length - 1]?.time).format('MMM D, YYYY')} (UTC)`}
        </Text>
      </Flex>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          onMouseMove={(state) => {
            if (state?.activePayload?.[0]?.payload) {
              setLatestValue(state.activePayload[0].payload.value)
              setValueLabel(state.activePayload[0].payload.time)
            }
          }}
          onMouseLeave={() => {
            setLatestValue(undefined)
            setValueLabel(undefined)
          }}
        >
          <XAxis dataKey="formattedTime" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9383B4' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" fill={theme.colors.primary} radius={[16, 16, 16, 16]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
