import { Box, Flex, Spinner } from '@pancakeswap/uikit'
import { formatFiatNumber } from '@pancakeswap/utils/formatFiatNumber'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartToolTip } from './ChartToolTip'
import { CurrentPriceLabel } from './CurrentPriceLabel'
import { ActionButton, ControlsWrapper } from './styled'
import { BasicChartLiquidityProps } from './type'

const ZOOM_INTERVAL = 20
const DEFAULT_ZOOM_LEVEL = 14

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="16" />
    </g>
  )
}

export const BasicChartLiquidity: React.FC<BasicChartLiquidityProps> = ({ poolInfo, liquidityChartData }) => {
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL)
  const [zoomInDisabled, setZoomInDisabled] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  const handleZoomIn = useCallback(() => {
    if (!zoomInDisabled) {
      setZoomLevel(zoomLevel + 1)
    }
  }, [zoomInDisabled, zoomLevel])

  const handleZoomOut = useCallback(() => {
    setZoomInDisabled(false)
    setZoomLevel((z) => z - 1)
  }, [])

  const zoomedData = useMemo(() => {
    if (liquidityChartData) {
      if (zoomLevel <= 0) return liquidityChartData
      return liquidityChartData.slice(ZOOM_INTERVAL * zoomLevel, -ZOOM_INTERVAL * zoomLevel)
    }
    return undefined
  }, [liquidityChartData, zoomLevel])

  useEffect(() => {
    if (!liquidityChartData || !liquidityChartData.length) {
      setZoomInDisabled(true)
    } else {
      setZoomInDisabled(2 * ZOOM_INTERVAL * (zoomLevel + 1) + 1 >= liquidityChartData?.length)
    }
  }, [zoomLevel, liquidityChartData])

  if (!liquidityChartData) {
    return (
      <Box height="380px" mb="-20px">
        <ResponsiveContainer width="100%" height="100%">
          <Flex justifyContent="center">
            <Spinner />
          </Flex>
        </ResponsiveContainer>
      </Box>
    )
  }

  return (
    <Box height="380px" mb="-20px" position="relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={zoomedData}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 60,
          }}
          onMouseMove={(state) => {
            if (state?.activePayload?.[0]?.payload) {
              setActiveIndex(state.activeTooltipIndex)
            }
          }}
          onMouseLeave={() => {
            setActiveIndex(undefined)
          }}
        >
          <XAxis
            dataKey="price0"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9383B4' }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9383B4' }}
            tickFormatter={(value) => formatFiatNumber(value, '')}
            orientation="right"
          />
          <Tooltip
            content={(props) => (
              <ChartToolTip
                {...props.payload?.[0]?.payload}
                currentPrice={poolInfo?.token0Price}
                currency0={poolInfo?.token0.wrapped}
                currency1={poolInfo?.token1.wrapped}
                activeLiquidity={props.payload?.[0]?.payload?.activeLiquidity}
                isCurrent={props.payload?.[0]?.payload?.isCurrent}
              />
            )}
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="activeLiquidity" fill="#1FC7D4" isAnimationActive={false} radius={16}>
            {zoomedData?.map((entry, index) => {
              return (
                <Cell
                  key={`cell-${entry.index}`}
                  fill={entry.isCurrent ? '#ED4B9E' : '#1FC7D4'}
                  fillOpacity={activeIndex === undefined ? 1 : activeIndex === index ? 1 : 0.3}
                  style={{ transition: 'fill-opacity 0.2s ease' }}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <CurrentPriceLabel data={zoomedData} poolInfo={poolInfo} />
      <ControlsWrapper>
        <ActionButton disabled={false} onClick={handleZoomOut}>
          -
        </ActionButton>
        <ActionButton disabled={zoomInDisabled} onClick={handleZoomIn}>
          +
        </ActionButton>
      </ControlsWrapper>
    </Box>
  )
}
