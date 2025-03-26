import { useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import {
  Button,
  PencilIcon,
  RiskAlertIcon,
  useMatchBreakpoints,
  useTooltip,
  WarningIcon,
  Text,
} from '@pancakeswap/uikit'
import GlobalSettings from 'components/Menu/GlobalSettings'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { ReactElement, useMemo } from 'react'
import styled from 'styled-components'
import { basisPointsToPercent } from 'utils/exchange'
import useClassicAutoSlippageTolerance from 'hooks/useAutoSlippage'
import { SmartRouterTrade, V4Router } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/sdk'

const TertiaryButton = styled(Button).attrs({ variant: 'tertiary' })<{ $color: string }>`
  height: unset;
  padding: 7px 8px;
  font-size: 14px;
  border-radius: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  color: ${({ $color }) => $color};
`

const AutoSlippageText = styled(Text)`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

interface SlippageButtonProps {
  slippage?: number | ReactElement
  trade?: SmartRouterTrade<TradeType> | V4Router.V4TradeWithoutGraph<TradeType>
}

export const SlippageButton = ({ slippage, trade }: SlippageButtonProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isMobile } = useMatchBreakpoints()

  const isRiskyLow = typeof slippage === 'number' && slippage < 50
  const isRiskyHigh = typeof slippage === 'number' && slippage > 100
  const isRiskyVeryHigh = typeof slippage === 'number' && slippage > 2000

  // Calculate auto slippage
  const autoSlippage = useClassicAutoSlippageTolerance(trade)
  const autoSlippageValue = useMemo(() => {
    if (!autoSlippage) return null
    return autoSlippage.toFixed(2)
  }, [autoSlippage])

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    isRiskyLow
      ? t('Your transaction may fail. Reset settings to avoid potential loss')
      : isRiskyHigh
      ? t('Your transaction may be frontrun. Reset settings to avoid potential loss')
      : '',
    { placement: 'top' },
  )

  const color = isRiskyVeryHigh
    ? theme.colors.failure
    : isRiskyLow || isRiskyHigh
    ? theme.colors.yellow
    : theme.colors.primary60

  return (
    <>
      <GlobalSettings
        id="slippage_btn_global_settings"
        key="slippage_btn_global_settings"
        mode={SettingsMode.SWAP_LIQUIDITY}
        overrideButton={(onClick) => (
          <div style={{ textAlign: 'center' }}>
            <div ref={!isMobile ? targetRef : undefined}>
              <TertiaryButton
                $color={color}
                startIcon={
                  isRiskyVeryHigh ? (
                    <RiskAlertIcon color={color} width={16} />
                  ) : isRiskyLow || isRiskyHigh ? (
                    <WarningIcon color={color} width={16} />
                  ) : undefined
                }
                endIcon={<PencilIcon color={color} width={12} />}
                onClick={onClick}
              >
                {typeof slippage === 'number' ? `${basisPointsToPercent(slippage).toFixed(2)}%` : slippage}
              </TertiaryButton>
            </div>
            {autoSlippageValue && (
              <AutoSlippageText>{t('Auto: %value%', { value: `${autoSlippageValue}%` })}</AutoSlippageText>
            )}
            {(isRiskyLow || isRiskyHigh) && tooltipVisible && tooltip}
          </div>
        )}
      />
    </>
  )
}
