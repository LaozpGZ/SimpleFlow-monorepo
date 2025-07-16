import { Currency } from '@pancakeswap/sdk'
import { tokens } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useRef } from 'react'
import { styled } from 'styled-components'
import type { TradingViewWidget, TradingViewWidgetOptions } from './lib/pancakeswap-charting-library.d.ts'
import { createTradingViewWidget, loadTradingViewLibrary } from './lib/pancakeswap-charting-library.es.js'

interface TradingViewChartProps {
  symbol?: string
  interval?: string
  theme?: 'Light' | 'Dark'
  height?: string
  width?: string
  currency0?: Currency
  currency1?: Currency
  on24HPriceDataChange: (low24h: number, high24h: number, priceChangePercent: number, price: number) => void
  onLiveDataChanges: (price: number) => void
}

const ChartContainer = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  font-family: 'Kanit', sans-serif;

  /* Force TradingView to use Kanit font */
  * {
    font-family: 'Kanit', sans-serif !important;
  }

  /* Specific TradingView elements */
  iframe {
    font-family: 'Kanit', sans-serif !important;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 0;
    width: 100%;
    height: 450px;
  }
`

const update24HPriceData = async (
  on24HPriceDataChange: (low24h: number, high24h: number, priceChangePercent: number, price: number) => void,
) => {
  if (window?.pcsExtraData?.fetch24HrData) {
    try {
      const data = await window.pcsExtraData.fetch24HrData()
      if (data) {
        on24HPriceDataChange(data.high, data.low, data.close, data.changes)
      }
    } catch (error) {
      console.error('Failed to fetch 24H price data:', error)
      on24HPriceDataChange(-1, -1, -1, -1)
    }
  }
}

const setSymbolInfo = (
  currency0: Currency,
  currency1: Currency,
  on24HPriceDataChange: (low24h: number, high24h: number, priceChangePercent: number, price: number) => void,
  onLiveDataChanges: (price: number) => void,
) => {
  window.pcsExtraData = window.pcsExtraData || {}
  window.pcsExtraData.token0Address = currency0?.isToken ? currency0?.address : currency0?.wrapped?.address
  window.pcsExtraData.token1Address = currency1?.isToken ? currency1?.address : currency1?.wrapped?.address
  window.pcsExtraData.fromChainId = currency0?.chainId
  window.pcsExtraData.toChainId = currency1?.chainId
  update24HPriceData(on24HPriceDataChange)
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  currency0,
  currency1,
  on24HPriceDataChange,
  onLiveDataChanges,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TradingViewWidget | null>(null)
  const isInitialized = useRef(false)
  const isWidgetReady = useRef(false)
  const currentSymbol = useRef('')
  const currentChainId = useRef<number | undefined>(undefined)
  const currentCurrency0Address = useRef<string | undefined>(undefined)
  const currentCurrency1Address = useRef<string | undefined>(undefined)
  const initializationTimeout = useRef<NodeJS.Timeout | null>(null)
  const { isDark, theme } = useTheme()
  const symbol = currency0 && currency1 ? `${currency0?.symbol}/${currency1?.symbol}` : ''
  const { chainId } = useActiveChainId()

  // Debug logging for currency and chain updates
  useEffect(() => {
    console.log('[Chart Debug] Currency/Chain update:', {
      chainId,
      currency0: currency0?.symbol,
      currency1: currency1?.symbol,
      symbol,
      currency0Address: currency0?.isToken ? currency0?.address : currency0?.wrapped?.address,
      currency1Address: currency1?.isToken ? currency1?.address : currency1?.wrapped?.address,
    })
  }, [chainId, currency0, currency1, symbol])

  useEffect(() => {
    const chainChanged = chainId !== currentChainId.current
    const symbolChanged = symbol !== currentSymbol.current
    const currency0Address = currency0?.isToken ? currency0?.address : currency0?.wrapped?.address
    const currency1Address = currency1?.isToken ? currency1?.address : currency1?.wrapped?.address
    const currency0AddressChanged = currency0Address !== currentCurrency0Address.current
    const currency1AddressChanged = currency1Address !== currentCurrency1Address.current

    console.log('[Chart Debug] Change detection:', {
      chainChanged,
      symbolChanged,
      currency0AddressChanged,
      currency1AddressChanged,
      hasWidget: !!widgetRef.current,
      isInitialized: isInitialized.current,
      isWidgetReady: isWidgetReady.current,
    })

    if (
      currency0 &&
      currency1 &&
      (symbolChanged || chainChanged || currency0AddressChanged || currency1AddressChanged)
    ) {
      console.log('[Chart Debug] Processing change:', {
        action: chainChanged || currency0AddressChanged || currency1AddressChanged ? 'recreate' : 'update',
        chainChanged,
        currency0AddressChanged,
        currency1AddressChanged,
      })

      currentSymbol.current = symbol
      currentChainId.current = chainId
      currentCurrency0Address.current = currency0Address
      currentCurrency1Address.current = currency1Address

      // If chain changed or currency addresses changed, force widget recreation
      if (chainChanged || currency0AddressChanged || currency1AddressChanged) {
        console.log('[Chart Debug] Forcing widget recreation')
        if (widgetRef.current) {
          try {
            if (widgetRef.current.remove) {
              widgetRef.current.remove()
            }
          } catch (error) {
            console.error('Error removing widget:', error)
          }
          widgetRef.current = null
        }
        isInitialized.current = false
        isWidgetReady.current = false
        console.log('[Chart Debug] Widget refs cleared, should trigger recreation')
        return // Let the main effect handle recreation
      }

      // Only try to update existing widget if we have one and it's ready
      if (widgetRef.current && isInitialized.current && isWidgetReady.current) {
        setSymbolInfo(currency0, currency1, on24HPriceDataChange, onLiveDataChanges)

        try {
          // Check if widget has activeChart method
          if (widgetRef.current && typeof widgetRef.current.activeChart === 'function') {
            const activeChart = widgetRef.current.activeChart()
            if (activeChart && typeof activeChart.setSymbol === 'function') {
              activeChart.setSymbol(symbol)
            }
          }
        } catch (error) {
          console.error('Error setting symbol:', error)
        }
      }
    }
  }, [currency0, currency1, chainId, symbol])

  useEffect(() => {
    async function initChart() {
      try {
        await loadTradingViewLibrary()

        // Inject global CSS for TradingView font
        const style = document.createElement('style')
        style.textContent = `
          .tv-chart-container *,
          .tradingview-widget-container *,
          div[data-name="legend-series-item"] *,
          div[class*="price-axis"] *,
          div[class*="time-axis"] *,
          div[class*="legend"] * {
            font-family: 'Kanit', sans-serif !important;
          }
        `
        document.head.appendChild(style)

        // Clean up existing widget if chain changed
        if (widgetRef.current && isInitialized.current) {
          try {
            if (widgetRef.current.remove) {
              widgetRef.current.remove()
            }
          } catch (error) {
            console.error('Error removing existing widget:', error)
          }
          widgetRef.current = null
          isInitialized.current = false
          isWidgetReady.current = false
        }

        // Clear any pending initialization
        if (initializationTimeout.current) {
          clearTimeout(initializationTimeout.current)
          initializationTimeout.current = null
        }

        // Add delay to wait for currency updates when chain changes
        const shouldDelay = chainId !== currentChainId.current && (!currency0 || !currency1)

        const doInitialization = () => {
          console.log('[Chart Debug] doInitialization called:', {
            hasContainer: !!containerRef.current,
            hasWidget: !!widgetRef.current,
            symbol,
            hasCurrency0: !!currency0,
            hasCurrency1: !!currency1,
            chainId,
            shouldInitialize: !!(
              containerRef.current &&
              !widgetRef.current &&
              symbol &&
              currency0 &&
              currency1 &&
              chainId
            ),
          })

          if (containerRef.current && !widgetRef.current && symbol && currency0 && currency1 && chainId) {
            console.log('[Chart Debug] Starting widget initialization')

            const options: TradingViewWidgetOptions = {
              symbol,
              theme: isDark ? 'Dark' : 'Light',
              overrides: {
                'mainSeriesProperties.candleStyle.upColor': isDark
                  ? tokens.colors.dark.success
                  : tokens.colors.light.success,
                'mainSeriesProperties.candleStyle.downColor': isDark
                  ? tokens.colors.dark.destructive
                  : tokens.colors.light.destructive,
                'mainSeriesProperties.candleStyle.borderUpColor': isDark
                  ? tokens.colors.dark.success
                  : tokens.colors.light.success,
                'mainSeriesProperties.candleStyle.borderDownColor': isDark
                  ? tokens.colors.dark.destructive
                  : tokens.colors.light.destructive,
                'mainSeriesProperties.candleStyle.wickUpColor': isDark
                  ? tokens.colors.dark.success
                  : tokens.colors.light.success,
                'mainSeriesProperties.candleStyle.wickDownColor': isDark
                  ? tokens.colors.dark.destructive
                  : tokens.colors.light.destructive,
                'paneProperties.background': isDark ? tokens.colors.dark.card : tokens.colors.light.card,
                'paneProperties.backgroundType': 'solid',
                'paneProperties.grid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
                'paneProperties.grid.style': 0,
                'paneProperties.vertGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
                'paneProperties.vertGrid.style': 0,
                'paneProperties.horzGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
                'paneProperties.horzGrid.style': 0,
                headerToolbarBg: isDark ? tokens.colors.dark.backgroundAlt : tokens.colors.light.backgroundAlt,
                custom_font_family: `'Kanit', sans-serif`,
                'scalesProperties.fontFamily': `'Kanit', sans-serif`,
                'scalesProperties.fontSize': 12,
                'scalesProperties.textColor': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
                'legendProperties.fontFamily': `'Kanit', sans-serif`,
                'legendProperties.fontSize': 12,
              },
              disabled_features: [
                'left_toolbar',
                // 'header_widget',
                'symbol_info',
                'header_symbol_search',
                'create_volume_indicator_by_default',
                'create_volume_indicator_by_default_once',
                'volume_force_overlay',
                'symbol_info_price_source',
                'allow_arbitrary_symbol_search_input',
                'symbol_search_hot_key',
                'header_compare',
                'compare_symbol_search_spread_operators',
                'studies_symbol_search_spread_operators',
                'symbol_info_long_description',
                'show_symbol_logos',
                'show_symbol_logo_in_legend',
                'show_symbol_logo_for_compare_studies',
                'uppercase_instrument_names',
                'study_symbol_ticker_description',
                'auto_enable_symbol_labels',
                // disable marks on bars (earnings, dividends )
                'marks_on_bars',
                'show_event_marks',
                'show_earnings_marks',
                'show_dividend_marks',
                'show_splits_marks',
                // disable timescale marks
                'timescale_marks',
                'timeframes_toolbar',
                // 'legend_widget',
                'display_legend_on_all_charts',
                'two_character_bar_marks_labels',
                // Hide most toolbar buttons except the ones we want to keep
                'header_saveload',
                'header_undo_redo',
                'header_settings',
                'header_screenshot',
                'header_widget_dom_node',
                'header_compare',
                'control_bar',
                'edit_buttons_in_legend',
                'border_around_the_chart',
                'show_interval_dialog_on_key_press',
                'property_pages',
                'save_chart_properties_to_local_storage',
                'use_localstorage_for_settings',
                'border_around_the_chart',
                'toolbar_button_newtab',
                'toolbar_button_compare',
                'toolbar_button_properties',
                'toolbar_button_text',
                'toolbar_button_shapes',
                'toolbar_button_line_tools',
                'toolbar_button_measure',
                'toolbar_button_zoom_in',
                'toolbar_button_zoom_out',
                'toolbar_button_undo',
                'toolbar_button_redo',
                'toolbar_button_saveload',
                'toolbar_button_settings',
                'toolbar_button_screenshot',
                'toolbar_button_hotlist',
              ],
              enabled_features: ['hide_left_toolbar_by_default'],
              autosize: true,
              height: '100%',
              width: '100%',
            }
            setSymbolInfo(currency0, currency1, on24HPriceDataChange, onLiveDataChanges)
            widgetRef.current = createTradingViewWidget(containerRef.current, options)

            // Wait for widget to be ready
            if (widgetRef.current && widgetRef.current.onChartReady) {
              widgetRef.current.onChartReady(() => {
                isWidgetReady.current = true
              })
            } else {
              // If no onChartReady method, set as ready after delay
              setTimeout(() => {
                isWidgetReady.current = true
              }, 1000)
            }

            update24HPriceData(on24HPriceDataChange)
            isInitialized.current = true
          }
        }

        if (shouldDelay) {
          initializationTimeout.current = setTimeout(doInitialization, 100)
        } else {
          doInitialization()
        }
      } catch (error) {
        console.error('Failed to initialize chart:', error)
      }
    }

    initChart()
  }, [symbol, isDark, theme, currency0, currency1, chainId])

  useEffect(() => {
    async function changeTheme() {
      if (widgetRef.current && isInitialized.current && isWidgetReady.current) {
        try {
          await widgetRef.current.changeTheme(isDark ? 'Dark' : 'Light')
          widgetRef.current.applyOverrides({
            'mainSeriesProperties.candleStyle.upColor': isDark
              ? tokens.colors.dark.success
              : tokens.colors.light.success,
            'mainSeriesProperties.candleStyle.downColor': isDark
              ? tokens.colors.dark.destructive
              : tokens.colors.light.destructive,
            'mainSeriesProperties.candleStyle.borderUpColor': isDark
              ? tokens.colors.dark.success
              : tokens.colors.light.success,
            'mainSeriesProperties.candleStyle.borderDownColor': isDark
              ? tokens.colors.dark.destructive
              : tokens.colors.light.destructive,
            'mainSeriesProperties.candleStyle.wickUpColor': isDark
              ? tokens.colors.dark.success
              : tokens.colors.light.success,
            'mainSeriesProperties.candleStyle.wickDownColor': isDark
              ? tokens.colors.dark.destructive
              : tokens.colors.light.destructive,
            'paneProperties.background': isDark ? tokens.colors.dark.card : tokens.colors.light.card,
            'paneProperties.backgroundType': 'solid',
            'paneProperties.grid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
            'paneProperties.grid.style': 0,
            'paneProperties.vertGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
            'paneProperties.vertGrid.style': 0,
            'paneProperties.horzGrid.color': isDark ? '#ffffff' : tokens.colors.light.cardBorder,
            'paneProperties.horzGrid.style': 0,
            'scalesProperties.fontFamily': `'Kanit', sans-serif`,
            'scalesProperties.fontSize': 12,
            'scalesProperties.textColor': isDark ? '#ffffff' : '#000000',
            'legendProperties.fontFamily': `'Kanit', sans-serif`,
            'legendProperties.fontSize': 12,
          })
        } catch (error) {
          console.error('Error changing theme:', error)
        }
      }
    }
    changeTheme()
  }, [isDark, theme])

  useEffect(() => {
    return () => {
      // Clear initialization timeout
      if (initializationTimeout.current) {
        clearTimeout(initializationTimeout.current)
        initializationTimeout.current = null
      }

      // Clean up widget
      if (widgetRef.current?.remove) {
        widgetRef.current.remove()
      }
      widgetRef.current = null
    }
  }, [])

  return <ChartContainer id="swap-chart" ref={containerRef} />
}

export default TradingViewChart
