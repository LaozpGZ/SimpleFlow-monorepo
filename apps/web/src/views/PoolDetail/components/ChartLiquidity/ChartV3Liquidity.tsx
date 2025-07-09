import { useTheme } from '@pancakeswap/hooks'
import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { Box, Flex, Spinner } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { FeeAmount, Pool, TICK_SPACINGS, TickMath } from '@pancakeswap/v3-sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { maxUint128 } from 'viem'
import { TickProcessed } from 'views/V3Info/data/pool/tickData'
import { usePoolTickData } from 'views/V3Info/hooks'
import { ChartToolTip } from './ChartToolTip'
import { CurrentPriceLabel } from './CurrentPriceLabel'
import { ActionButton, ControlsWrapper } from './styled'
import type { ChartLiquidityProps, LiquidityChartData } from './type'

const ZOOM_INTERVAL = 20
const DEFAULT_ZOOM_LEVEL = 14

export const ChartV3Liquidity: React.FC<ChartLiquidityProps> = ({ address, poolInfo }) => {
  // tick data tracking
  const poolTickData = usePoolTickData(address)
  const feeTier = useMemo(() => poolInfo?.feeTier, [poolInfo?.feeTier])
  const { theme } = useTheme()

  const [loading, setLoading] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL)
  const [zoomInDisabled, setZoomInDisabled] = useState(false)
  const [formattedData, setFormattedData] = useState<LiquidityChartData[] | undefined>()

  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  const handleZoomIn = useCallback(() => {
    if (!zoomInDisabled) {
      setZoomLevel(zoomLevel + 1)
    }
  }, [zoomInDisabled, zoomLevel])

  const handleZoomOut = useCallback(() => {
    setZoomInDisabled(false)
    if (zoomLevel <= 0) {
      setLoading(true)
      setFormattedData(undefined)
    }
    setZoomLevel((z) => z - 1)
  }, [zoomLevel])

  const zoomedData = useMemo(() => {
    if (formattedData) {
      if (zoomLevel <= 0) return formattedData
      return formattedData.slice(ZOOM_INTERVAL * zoomLevel, -ZOOM_INTERVAL * zoomLevel)
    }
    return undefined
  }, [formattedData, zoomLevel])

  useEffect(() => {
    if (!formattedData || !formattedData.length) {
      setZoomInDisabled(true)
    } else {
      setZoomInDisabled(2 * ZOOM_INTERVAL * (zoomLevel + 1) + 1 >= formattedData?.length)
    }
  }, [zoomLevel, formattedData])

  // reset data on address change
  useEffect(() => {
    setFormattedData(undefined)
  }, [address])

  useEffect(() => {
    async function formatData() {
      if (poolTickData && poolInfo && feeTier) {
        const newData = await Promise.all(
          poolTickData.ticksProcessed.map(async (t: TickProcessed, i) => {
            const active = t.tickIdx === poolTickData.activeTickIdx
            const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx)
            const feeAmount: FeeAmount = feeTier
            const token0 = poolInfo.token0?.wrapped
            const token1 = poolInfo.token1?.wrapped
            const mockTicks = [
              {
                index: t.tickIdx - TICK_SPACINGS[feeAmount],
                liquidityGross: t.liquidityGross,
                liquidityNet: t.liquidityNet * BigInt('-1'),
              },
              {
                index: t.tickIdx,
                liquidityGross: t.liquidityGross,
                liquidityNet: t.liquidityNet,
              },
            ]
            const pool =
              token0 && token1 && feeTier
                ? new Pool(token0, token1, feeTier, sqrtPriceX96, t.liquidityActive, t.tickIdx, mockTicks)
                : undefined
            const nextSqrtX96 = poolTickData.ticksProcessed[i - 1]
              ? TickMath.getSqrtRatioAtTick(poolTickData.ticksProcessed[i - 1].tickIdx)
              : undefined
            const maxAmountToken0 = token0 ? CurrencyAmount.fromRawAmount(token0, maxUint128) : undefined
            const outputRes0 =
              pool && maxAmountToken0 ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96) : undefined

            const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined

            const amount0 = token1Amount ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1) : 0
            const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0

            return {
              index: i,
              isCurrent: active,
              activeLiquidity: parseFloat(t.liquidityActive.toString()),
              price0: parseFloat(t.price0),
              price1: parseFloat(t.price1),
              tvlToken0: amount0,
              tvlToken1: amount1,
            }
          }),
        )
        newData?.forEach((entry, i) => {
          if (i > 0) {
            newData[i - 1].tvlToken0 = entry.tvlToken0
            newData[i - 1].tvlToken1 = entry.tvlToken1
          }
        })

        if (newData) {
          if (loading) {
            setLoading(false)
          }
          setFormattedData(newData)
        }
      }
      return []
    }
    if (!formattedData) {
      formatData()
    }
  }, [feeTier, formattedData, loading, poolInfo, poolTickData])

  if (!poolTickData) {
    return (
      <Flex mt="80px" justifyContent="center">
        <Spinner />
      </Flex>
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
            tickFormatter={(value) => formatNumber(value, { maxDecimalDisplayDigits: 2 })}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9383B4' }}
            tickFormatter={(value) =>
              Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value / 1e18)
            }
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
          <Bar dataKey="activeLiquidity" fill={theme.colors.primary} isAnimationActive={false} radius={16}>
            {zoomedData?.map((entry, index) => {
              return (
                <Cell
                  key={`cell-${entry.index}`}
                  fill={entry.isCurrent ? theme.colors.failure : theme.colors.primary}
                  fillOpacity={activeIndex === undefined ? 1 : activeIndex === index ? 1 : 0.3}
                  style={{ transition: 'fill-opacity 0.2s ease' }}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <CurrentPriceLabel data={zoomedData} poolInfo={poolInfo || undefined} />
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
