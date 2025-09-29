import {
  AutoColumn,
  AutoRow,
  Box,
  Card,
  CardBody,
  Flex,
  FlexGap,
  Spinner,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import styled, { useTheme } from 'styled-components'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  ReferenceLine,
  ReferenceArea,
  Label,
  Rectangle,
  YAxis,
} from 'recharts'
import { useSolanaV3PositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { usePriceRange, usePriceRangeData } from 'hooks/solana/usePriceRange'
import { POSITION_STATUS, SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3Pool } from 'state/pools/solana'
import { TickUtils } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { useIsMounted } from '@pancakeswap/hooks'
import { distanceToNowStrict } from 'utils/timeHelper'
import { usePoolCurrencies } from '../hooks/usePoolCurrencies'
import { usePoolChartData, ChartEntry } from '../hooks/usePoolChartData'

interface PositionChartProps {
  poolId: string
  position: SolanaV3PositionDetail
  poolInfo: SolanaV3Pool
  baseIn?: boolean
  priceLower?: number | string
  priceUpper?: number | string
  timePriceMin?: number
  timePriceMax?: number
  chartHeight?: number
  scale?: boolean
  onPriceRangeChange?: (lower: number, upper: number) => void
}

const maxRenderCount = 50

export const PositionChart = ({
  baseIn = true,
  position,
  poolInfo,
  chartHeight = 300,
  scale = true,
}: PositionChartProps) => {
  const { poolId } = useSolanaV3PositionIdRouteParams()
  const { symbol0, symbol1 } = usePoolCurrencies()
  const { t } = useTranslation()
  const { priceLower, priceUpper } = usePriceRange({
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    baseIn: true,
    poolInfo,
  })
  const price = useMemo(() => {
    if (poolInfo.tickCurrent !== undefined && Number.isFinite(poolInfo.tickCurrent)) {
      return Number(
        TickUtils.getTickPrice({
          poolInfo,
          tick: poolInfo.tickCurrent!,
          baseIn,
        }).price.toFixed(18),
      )
    }
    return Number(poolInfo.price.toFixed(18))
  }, [poolInfo, baseIn])
  const { formattedData: chartData, isLoading, error } = usePoolChartData(poolId, baseIn)
  const theme = useTheme()
  const [lower, upper] = useMemo(() => {
    const lower = Number(priceLower?.toFixed(18)) < price ? priceLower : price
    const upper = Number(priceUpper?.toFixed(18)) > price ? priceUpper : price
    return [lower, upper]
  }, [priceLower, priceUpper, price])
  const formattedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return []

    let filteredData = chartData

    if (scale && lower && upper && chartData.length > maxRenderCount) {
      const lowerPrice = Number(lower.toFixed(18))
      const upperPrice = Number(upper.toFixed(18))
      const range = upperPrice - lowerPrice
      const margin = range * 0.2

      const minPrice = lowerPrice - margin
      const maxPrice = upperPrice + margin

      filteredData = chartData.filter((item) => {
        const price = item.price0
        return price >= minPrice && price <= maxPrice
      })
    }

    filteredData.sort((a, b) => a.price0 - b.price0)

    return filteredData
  }, [chartData, price, scale, lower, upper])

  const [xLower, xCurrent, xUpper] = useMemo(() => {
    const { tickSpacing } = poolInfo.config
    return [
      formattedData.find((item) => item.tick === TickUtils.nearestUsableTick(position.tickLower, tickSpacing))?.price0,
      formattedData.find((item) => item.tick === TickUtils.nearestUsableTick(poolInfo.tickCurrent ?? 0, tickSpacing))
        ?.price0,
      formattedData.find((item) => item.tick === TickUtils.nearestUsableTick(position.tickUpper, tickSpacing))?.price0,
    ]
  }, [formattedData, poolInfo.tickCurrent, poolInfo.config.tickSpacing])

  const rangeColor = useMemo(() => {
    return position.status === POSITION_STATUS.ACTIVE ? theme.colors.success : theme.colors.failure
  }, [position.status, theme.colors.success, theme.colors.failure])

  const maxY = useMemo(() => {
    let max = 0
    for (const item of formattedData) {
      if (item.liquidity > max) {
        max = item.liquidity
      }
    }
    return max
  }, [formattedData])

  const [x1, setX1] = useState<number | undefined>(undefined)
  const [x2, setX2] = useState<number | undefined>(undefined)
  const [x0, setX0] = useState<number | undefined>(undefined)

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <Flex height={`${chartHeight}px`} justifyContent="center" alignItems="center">
            <Spinner />
          </Flex>
        </CardBody>
      </Card>
    )
  }

  if (error || !formattedData.length) {
    return (
      <Card>
        <CardBody>
          <Flex height={`${chartHeight}px`} justifyContent="center" alignItems="center">
            <Text color="textSubtle">{error ? 'Failed to load chart data' : 'No liquidity data available'}</Text>
          </Flex>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody p={32}>
        <RangeBar x0={x0} x1={x1} x2={x2} position={position} poolInfo={poolInfo} baseIn={baseIn} />
        <div style={{ position: 'relative', height: `${chartHeight}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              barCategoryGap={0}
              barGap={0}
              margin={{
                top: 20,
                right: 0,
                left: 0,
                bottom: 8,
              }}
            >
              <defs>
                <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(118, 69, 217, 0.8)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="rgba(118, 69, 217, 0.3)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="price0"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSubtle }}
                tickFormatter={(value) => formatAmount(value, { precision: 2 }) ?? ''}
              />
              <YAxis hide axisLine={false} tickLine={false} domain={[0, maxY]} />

              {xCurrent && (
                <>
                  <Rectangle x={xCurrent - 2.5} y={0} width={5} height={12} fill={theme.colors.secondary} radius={16} />
                  <ReferenceLine x={xCurrent} stroke={theme.colors.secondary} strokeWidth={2}>
                    <Label
                      value={formatAmount(xCurrent, { precision: 2 }) ?? ''}
                      position="top"
                      style={{ fill: theme.colors.secondary, fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </ReferenceLine>
                  <ReferenceLine
                    x={xCurrent}
                    stroke={theme.colors.secondary}
                    strokeWidth={1}
                    shape={(props) => <ComputeX1 x1={props.x1} onEffect={setX0} />}
                  />
                </>
              )}
              {xLower && xUpper && <ReferenceArea x1={xLower} x2={xUpper} fill={rangeColor} fillOpacity={0.1} />}
              {xLower && xUpper && (
                <>
                  <ReferenceLine
                    segment={[
                      { x: xLower, y: maxY },
                      { x: xUpper, y: maxY },
                    ]}
                    stroke={rangeColor}
                    position="start"
                    strokeWidth={0}
                    shape={(props) => <ComputeX1 x1={props.x1} onEffect={setX1} />}
                  />
                  <ReferenceLine
                    segment={[
                      { x: xLower, y: maxY },
                      { x: xUpper, y: maxY },
                    ]}
                    stroke={rangeColor}
                    position="end"
                    strokeWidth={0}
                    shape={(props) => <ComputeX2 x2={props.x2} onEffect={setX2} />}
                  />
                </>
              )}
              {xLower && (
                <ReferenceLine position="start" x={xLower} stroke={rangeColor} strokeWidth={2}>
                  {/* <Label
                    value={formatAmount(xLower, { precision: 2 }) ?? ''}
                    position="top"
                    style={{ fill: rangeColor, fontSize: '12px', fontWeight: 'bold' }}
                  /> */}
                </ReferenceLine>
              )}
              {xUpper && (
                <ReferenceLine position="end" x={xUpper} stroke={rangeColor} strokeWidth={2}>
                  {/* <Label
                    value={formatAmount(xUpper, { precision: 2 }) ?? ''}
                    position="top"
                    style={{ fill: rangeColor, fontSize: '12px', fontWeight: 'bold' }}
                  /> */}
                </ReferenceLine>
              )}

              <Bar dataKey="liquidity" fill="url(#liquidityGradient)" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <AutoRow justifyContent="space-between">
          <FlexGap alignItems="center" gap="4px">
            <Box
              style={{
                width: '7px',
                height: '7px',
                left: '0px',
                top: '6px',
                background: theme.colors.secondary,
                borderRadius: '10px',
              }}
            />
            <Text fontSize="12px" lineHeight={1.5}>
              {t('Current Price')}{' '}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="4px">
            <Text fontSize="12px" lineHeight={1.5} fontWeight={600}>
              {formatNumber(
                price,
                Number(price) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
              )}
            </Text>
            <Text fontSize="12px" lineHeight={1.5} color="textSubtle">
              {t('%subA% per %subB%', {
                subA: poolInfo.mintB.symbol,
                subB: poolInfo.mintA.symbol,
              })}
            </Text>
          </FlexGap>
        </AutoRow>
      </CardBody>
    </Card>
  )
}

const ComputeX1 = ({ x1, onEffect }) => {
  useEffect(() => {
    onEffect(x1)
  }, [x1])
  return <></>
}

const ComputeX2 = ({ x2, onEffect }) => {
  useEffect(() => {
    onEffect(x2)
  }, [x2])
  return <></>
}

const RangeBar = ({ position, poolInfo, baseIn, x1, x2, x0 }) => {
  return (
    <AutoColumn width="100%" py="8px" gap="4px">
      <PriceRangeLabel x1={x1} x2={x2} position={position} baseIn={baseIn} poolInfo={poolInfo} />
      <Box width="100%" position="relative">
        <TrackerBar />
        {x1 && x2 && <PriceRangeBar left={x1} right={x2} inRange={position.status === POSITION_STATUS.ACTIVE} />}
        {x0 && <CurrentPin left={x0} />}
      </Box>
    </AutoColumn>
  )
}

const PriceRangeLabel = ({ x1, x2, position, baseIn, poolInfo }) => {
  const {
    minPriceFormatted: minPrice,
    minPercentage,
    maxPriceFormatted: maxPrice,
    maxPercentage,
  } = usePriceRangeData({
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    baseIn,
    poolInfo,
  })
  const displayMinPrice =
    minPrice !== '0'
      ? formatNumber(
          minPrice,
          Number(minPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '0'
  const displayMaxPrice =
    maxPrice !== '∞'
      ? formatNumber(
          maxPrice,
          Number(maxPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '∞'

  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const isMounted = useIsMounted()
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined)
  const [rightWidth, setRightWidth] = useState<number | undefined>(undefined)
  const intersected = useMemo(() => {
    if (!leftWidth || !rightWidth) return false
    return rightWidth + leftWidth > x2 - x1
  }, [leftWidth, rightWidth, x1, x2])

  useEffect(() => {
    if (isMounted) {
      setLeftWidth(leftRef.current?.clientWidth)
      setRightWidth(rightRef.current?.clientWidth)
    }
  }, [isMounted])

  return (
    <Box width="100%" position="relative" height="30px">
      <PriceRangeContainer left={x1} right={x2} expanded={false}>
        <AutoRow justifyContent="space-between" flexWrap="nowrap">
          <AutoColumn alignItems="flex-start">
            <Transform distance={-(leftWidth ?? 0) / 2} enabled={intersected}>
              <Text fontSize="12px" lineHeight={1.5} fontWeight={600} ref={leftRef}>
                {displayMinPrice}
              </Text>
              <Text fontSize="10px" color="textSubtle">
                {minPercentage}
              </Text>
            </Transform>
          </AutoColumn>

          <AutoColumn alignItems="flex-end">
            <Transform distance={(rightWidth ?? 0) / 2} enabled={intersected}>
              <Text fontSize="12px" lineHeight={1.5} fontWeight={600} ref={rightRef}>
                {displayMaxPrice}
              </Text>
              <Text fontSize="10px" color="textSubtle" textAlign="right">
                {maxPercentage}
              </Text>
            </Transform>
          </AutoColumn>
        </AutoRow>
      </PriceRangeContainer>
    </Box>
  )
}

const TrackerBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.disabled};
  border: 0.5px solid ${({ theme }) => theme.colors.inputSecondary};
`

const CurrentPin = styled.div<{ left: number }>`
  position: absolute;
  top: -2px;
  left: ${({ left }) => left - 2.5}px;
  width: 5px;
  height: 12px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.secondary};

  &:before {
    background-image: url(data:image/svg+xml,%3Csvg%20width%3D%227%22%20height%3D%227%22%20viewBox%3D%220%200%207%207%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1.14844%202.4598C0.803786%201.79417%201.28689%201%202.03646%201H4.96209C5.71165%201%206.19476%201.79417%205.85011%202.4598L4.38729%205.28495C4.01435%206.00522%202.98419%206.00522%202.61125%205.28495L1.14844%202.4598Z%22%20fill%3D%22%237645D9%22%20stroke%3D%22white%22%2F%3E%3C%2Fsvg%3E);
    background-size: cover;
    background-repeat: no-repeat;
    content: '';
    position: absolute;
    top: -5px;
    left: -1px;
    width: 7px;
    height: 6px;
  }
`

const PriceRangeBar = styled.div<{ left: number; right: number; inRange: boolean }>`
  position: absolute;
  top: 0;
  left: ${({ left }) => left}px;
  width: ${({ right, left }) => right - left}px;
  height: 5px;
  border-radius: 8px;
  background: ${({ theme, inRange }) => (inRange ? theme.colors.success : theme.colors.failure)};
`
const PriceRangeContainer = styled.div<{ left: number; right: number; expanded: boolean }>`
  ${({ expanded, left, right }) =>
    expanded
      ? `
    display: flex;
    align-items: center;
    justify-content: space-between;
  `
      : `
  position: absolute;
  height: 30px;
  top: 0;
  left: ${left}px;
  width: ${right - left}px;
  `}
`
const Transform = styled.div<{ distance: number; enabled: boolean }>`
  ${({ distance, enabled }) =>
    enabled &&
    `
    transform: translateX(${distance}px);
  `}
`
