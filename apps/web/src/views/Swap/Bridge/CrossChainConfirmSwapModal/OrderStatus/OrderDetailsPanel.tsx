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
  Link,
  QuestionHelperV2,
  RowBetween,
  RowFixed,
  SkeletonV2,
  Text,
} from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { LightGreyCard } from 'components/Card'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { useAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import styled from 'styled-components'
import { isBridgeOrder } from 'views/Swap/utils'
import { computeSlippageAdjustedAmounts as computeSlippageAdjustedAmountsWithSmartRouter } from 'views/Swap/V3Swap/utils/exchange'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

import { convertScientificToDecimal } from '@pancakeswap/utils/formatNumber'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import { isNotUndefinedOrNull } from 'utils/isNotUndefinedOrNull'
import { useBridgeStatus } from '../../hooks'
import { ActiveBridgeOrderMetadata, BridgeStatus, BridgeStatusData } from '../../types'
import { BridgeOrderFee, computeBridgeOrderFee } from '../../utils'
import { Timeline } from '../components/Timeline'
import { useTimelineItems } from '../hooks/useTimelineItems'
import { activeBridgeOrderMetadataAtom } from '../state/orderDataState'

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

const DetailsTitle = styled(Text)`
  text-decoration: underline dotted;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 150%;
  cursor: help;
`

const FeePanelCard = styled(LightGreyCard)`
  background-color: ${({ theme }) => (theme.isDark ? theme.colors.backgroundAlt : theme.colors.backgroundAlt3)};
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

  const priceBreakdown: BridgeOrderFee[] | undefined = useMemo(() => {
    if (isBridgeOrder(order)) {
      const bridgeOrderFee = computeBridgeOrderFee(order)
      if (Array.isArray(bridgeOrderFee)) {
        return bridgeOrderFee
      }
      return undefined
    }
    return undefined
  }, [order])

  const minimumReceived = useMemo(() => {
    const slippageAdjustedAmount = formatAmount(slippageAdjustedAmounts?.[Field.OUTPUT], DISPLAY_PRECISION)
    if (slippageAdjustedAmount) return slippageAdjustedAmount

    if (!bridgeStatus?.outputCurrencyAmount?.currency || !bridgeStatus.minOutputAmount) return undefined
    return CurrencyAmount.fromRawAmount(
      bridgeStatus?.outputCurrencyAmount?.currency,
      convertScientificToDecimal(bridgeStatus?.minOutputAmount),
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

            <BridgeFeesBreakdown
              priceBreakdown={priceBreakdown}
              feesBreakdown={bridgeStatus?.feesBreakdown}
              status={bridgeStatus?.status}
            />

            <RowBetween>
              <Text color="textSubtle" small>
                {t('Minimum received')}
              </Text>
              <Text small>
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

const BridgeFeesBreakdown = ({
  priceBreakdown,
  feesBreakdown,
  status,
}: {
  // Price breakdown for ongoing bridge order
  priceBreakdown?: BridgeOrderFee[]

  // Fees breakdown for data from status API
  feesBreakdown?: BridgeStatusData['feesBreakdown']

  status?: BridgeStatus
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // // Calculate ongoing order fees from Price Breakdown
  // const currencies = useMemo(() => {
  //   if (!priceBreakdown) return undefined
  //   return priceBreakdown?.map((p) => p.lpFeeAmount!.currency)
  // }, [priceBreakdown])

  // const usdPrices = useAtomValue(currenciesUSDPriceAtom(currencies ?? []))

  // // Group and sum up fees by type
  // const groupedFees = useMemo(() => {
  //   if (!priceBreakdown) return undefined

  //   return priceBreakdown?.reduce((acc, curr, index) => {
  //     const type = curr.type === OrderType.PCS_BRIDGE ? 'bridge' : 'trading'
  //     const existingFee = acc[type] || {
  //       label: curr.type === OrderType.PCS_BRIDGE ? t('Bridge Fee') : t('Trading Fee'),
  //       amount: new BigNumber(0),
  //     }

  //     const usdAmount = new BigNumber(curr.lpFeeAmount?.toExact() ?? 0).times(usdPrices[index] ?? 0)

  //     return {
  //       ...acc,
  //       [type]: {
  //         ...existingFee,
  //         amount: existingFee.amount.plus(usdAmount),
  //       },
  //     }
  //   }, {} as Record<string, { label: string; amount: BigNumber }>)
  // }, [priceBreakdown, usdPrices, t])

  // const priceBreakdownTotalFeesUSD = useMemo(() => {
  //   return Object.values(groupedFees ?? {})
  //     .reduce((acc, curr) => acc.plus(curr.amount), new BigNumber(0))
  //     .toNumber()
  // }, [groupedFees])

  return (
    <SwapUIV2.Collapse
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      title={
        <RowBetween>
          <RowFixed>
            <QuestionHelperV2
              text={
                <>
                  <Text mb="12px">
                    <Text bold display="inline-block">
                      {t('AMM')}
                    </Text>
                    : {t('Trading fee varies by pool fee tier. Check it via the magnifier icon under "Route."')}
                  </Text>
                  <Text mt="12px">
                    <Link
                      style={{ display: 'inline' }}
                      ml="4px"
                      external
                      href="https://docs.pancakeswap.finance/products/pancakeswap-exchange/faq#what-will-be-the-trading-fee-breakdown-for-v3-exchange"
                    >
                      {t('Fee Breakdown and Tokenomics')}
                    </Link>
                  </Text>
                  <Text mt="10px">
                    <Text bold display="inline-block">
                      {t('X')}
                    </Text>
                    : {t('No fee when trading through PancakeSwap X (subject to change).')}
                  </Text>
                </>
              }
              placement="top"
            >
              <DetailsTitle fontSize="14px" color="textSubtle">
                {status === BridgeStatus.PARTIAL_SUCCESS ? t('Partial Fee') : t('Total Fee')}
              </DetailsTitle>
            </QuestionHelperV2>
          </RowFixed>
          <SkeletonV2
            width="70px"
            height="16px"
            borderRadius="8px"
            minHeight="auto"
            isDataReady={isNotUndefinedOrNull(feesBreakdown && feesBreakdown.totalFeesUSD)}
          >
            <Text fontSize="14px" textAlign="right">
              {/* {formatDollarAmount(priceBreakdown ? priceBreakdownTotalFeesUSD : feesBreakdown?.totalFeesUSD || 0, 3)} */}
              {formatDollarAmount(feesBreakdown?.totalFeesUSD || 0, 3)}
            </Text>
          </SkeletonV2>
        </RowBetween>
      }
      content={
        <FeePanelCard mt="4px" padding="8px 16px">
          {/* {priceBreakdown && groupedFees ? (
              Object.values(groupedFees).map((fee, index) => (
                <RowBetween key={index}>
                  <Text fontSize="14px" color="textSubtle">
                    {fee.label}
                  </Text>
                  <Text fontSize="14px" textAlign="right">
                    {`${formatDollarAmount(fee.amount.toNumber(), 3)}`}
                  </Text>
                </RowBetween>
              ))
            ) : (
              <> */}
          <RowBetween>
            <Text fontSize="14px" color="textSubtle">
              {t('Bridge Fee')}
            </Text>
            <Text fontSize="14px" textAlign="right">
              {`${formatDollarAmount(feesBreakdown?.bridgeFeesUSD || 0, 3)}`}
            </Text>
          </RowBetween>
          <RowBetween>
            <Text fontSize="14px" color="textSubtle">
              {t('Trading Fee')}
            </Text>
            <Text fontSize="14px" textAlign="right">
              {`${formatDollarAmount(feesBreakdown?.swapFeesUSD || 0, 3)}`}
            </Text>
          </RowBetween>
          {/* </>
            )} */}
        </FeePanelCard>
      }
    />
  )
}
