import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/sdk'
import {
  AutoColumn,
  Box,
  BoxProps,
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  FlexGap,
  RowBetween,
  RowFixed,
  Text,
} from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { LightGreyCard } from 'components/Card'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { useAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import styled from 'styled-components'
import { isBridgeOrder, isXOrder } from 'views/Swap/utils'
import {
  computeSlippageAdjustedAmounts as computeSlippageAdjustedAmountsWithSmartRouter,
  computeTradePriceBreakdown as computeTradePriceBreakdownWithSmartRouter,
} from 'views/Swap/V3Swap/utils/exchange'
import { Timeline } from '../components/Timeline'

import { activeBridgeOrderMetadataAtom } from '../state/orderDataState'

import { useBridgeStatus } from '../../hooks'
import { ActiveBridgeOrderMetadata, BridgeStatus } from '../../types'
import { useTimelineItems } from '../hooks/useTimelineItems'

const AnimatedContainer = styled.div<{ expanded: boolean }>`
  overflow: hidden;
  max-height: ${({ expanded }) => (expanded ? '1000px' : '0')};
  opacity: ${({ expanded }) => (expanded ? 1 : 0)};
  transition: all 0.2s ease;
`

const ProgressPill = styled(Box)<{ $color: string }>`
  width: 16px;
  height: 4px;
  border-radius: 8px;
  background-color: ${({ theme, $color }) => theme.colors[$color]};
`

interface OrderDetailsPanelProps extends BoxProps {
  overrideActiveOrderMetadata?: ActiveBridgeOrderMetadata | null
}
export const OrderDetailsPanel = ({ overrideActiveOrderMetadata, ...props }: OrderDetailsPanelProps) => {
  const { t } = useTranslation()

  const activeBridgeOrderMetadata = useAtomValue(activeBridgeOrderMetadataAtom)
  const bridgeMetadata = overrideActiveOrderMetadata || activeBridgeOrderMetadata

  const order = bridgeMetadata?.order
  const originChainId = bridgeMetadata?.originChainId
  const originTxHash = bridgeMetadata?.txHash
  const metadata = bridgeMetadata?.metadata

  const { data: bridgeStatus } = useBridgeStatus(originChainId, originTxHash, metadata)

  const timelineItems = useTimelineItems({ bridgeStatus, order })

  // If the order is failed or partial success, open the details panel by default
  const [detailsExpanded, setDetailsExpanded] = useState(
    bridgeStatus?.status === BridgeStatus.PARTIAL_SUCCESS || bridgeStatus?.status === BridgeStatus.FAILED,
  )
  const [progressExpanded, setProgressExpanded] = useState(
    bridgeStatus?.status === BridgeStatus.PARTIAL_SUCCESS || bridgeStatus?.status === BridgeStatus.FAILED,
  )

  // TODO: Remove/Update auto-slippage usage in bridging
  const { slippageTolerance: allowedSlippage } = useAutoSlippageWithFallback()

  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmountsWithSmartRouter(order, allowedSlippage),
    [order, allowedSlippage],
  )

  const { lpFeeAmount } = useMemo(
    () => computeTradePriceBreakdownWithSmartRouter(isBridgeOrder(order) || isXOrder(order) ? undefined : order?.trade),
    [order],
  )

  const minimumReceived = useMemo(() => {
    const slippageAdjustedAmount = formatAmount(slippageAdjustedAmounts?.[Field.OUTPUT], DISPLAY_PRECISION)
    if (slippageAdjustedAmount) return slippageAdjustedAmount

    if (!bridgeStatus?.outputCurrencyAmount?.currency || !bridgeStatus.minOutputAmount) return undefined
    return CurrencyAmount.fromRawAmount(
      bridgeStatus?.outputCurrencyAmount?.currency,
      bridgeStatus?.minOutputAmount,
    ).toSignificant(DISPLAY_PRECISION)
  }, [bridgeStatus, slippageAdjustedAmounts])

  const toggleDetailsExpanded = useCallback(() => {
    setDetailsExpanded(!detailsExpanded)
  }, [detailsExpanded, setDetailsExpanded])

  const toggleProgressExpanded = useCallback(() => {
    setProgressExpanded(!progressExpanded)
  }, [progressExpanded, setProgressExpanded])

  return (
    <Box {...props}>
      {!detailsExpanded ? (
        <AutoColumn justify="center">
          <Button variant="text" onClick={toggleDetailsExpanded}>
            <Text color="primary60" bold>
              {t('Details')}
            </Text>
            <ChevronDownIcon ml="2px" color="primary60" />
          </Button>
        </AutoColumn>
      ) : (
        <LightGreyCard padding="16px 16px 0 16px">
          <AutoColumn gap="16px">
            {bridgeStatus && bridgeStatus?.data && bridgeStatus?.data.length > 0 && (
              <>
                <RowBetween width="100%">
                  <Text color="textSubtle" small>
                    {t('Progress')}
                  </Text>
                  <Button variant="text" scale="xs" px="0" onClick={toggleProgressExpanded}>
                    <FlexGap gap="4px" alignItems="center">
                      {bridgeStatus?.data?.map((step) => {
                        return (
                          <ProgressPill
                            $color={
                              step.status.code === BridgeStatus.SUCCESS
                                ? 'success'
                                : step.status.code === BridgeStatus.FAILED
                                ? 'failure'
                                : step.status.code === BridgeStatus.PARTIAL_SUCCESS
                                ? 'warning'
                                : 'inputSecondary'
                            }
                          />
                        )
                      })}
                      {progressExpanded ? <ChevronUpIcon color="primary60" /> : <ChevronDownIcon color="primary60" />}
                    </FlexGap>
                  </Button>
                </RowBetween>
                <AnimatedContainer expanded={progressExpanded}>
                  <RowFixed ml="8px">
                    <Timeline items={timelineItems} />
                  </RowFixed>
                </AnimatedContainer>
              </>
            )}

            <RowBetween>
              <Text color="textSubtle" small>
                {bridgeStatus?.status === BridgeStatus.PARTIAL_SUCCESS ? t('Partial Fee') : t('Total Fee')}
              </Text>
              <Text color="textSubtle" small>
                {lpFeeAmount?.toSignificant(2) ||
                  (bridgeStatus?.feesBreakdown?.totalFeesUSD &&
                    `$${formatNumber(bridgeStatus?.feesBreakdown?.totalFeesUSD, { maximumSignificantDigits: 4 })}`) ||
                  '-'}
                &nbsp;
              </Text>
            </RowBetween>

            <RowBetween>
              <Text color="textSubtle" small>
                {t('Minimum received')}
              </Text>
              <Text color="textSubtle" small>
                {minimumReceived}
                &nbsp;
                {bridgeStatus?.outputCurrencyAmount?.currency.symbol || order?.trade.outputAmount.currency.symbol}
              </Text>
            </RowBetween>
          </AutoColumn>
          <AutoColumn justify="center">
            <Button variant="text" onClick={toggleDetailsExpanded}>
              <Text color="primary60" bold>
                {t('Hide')}
              </Text>
              <ChevronUpIcon ml="2px" color="primary60" />
            </Button>
          </AutoColumn>
        </LightGreyCard>
      )}
    </Box>
  )
}
