import { useTranslation } from '@pancakeswap/localization'
import { zeroAddress } from '@pancakeswap/price-api-sdk'
import { CurrencyAmount, Native } from '@pancakeswap/sdk'
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
import { LightGreyCard } from 'components/Card'
import { GELATO_NATIVE } from 'config/constants'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { useAllTokensByChainIds } from 'hooks/Tokens'
import { useAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import styled from 'styled-components'
import { safeGetAddress } from 'utils'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { Address } from 'viem/accounts'
import { isBridgeOrder, isXOrder } from 'views/Swap/utils'
import {
  computeSlippageAdjustedAmounts as computeSlippageAdjustedAmountsWithSmartRouter,
  computeTradePriceBreakdown as computeTradePriceBreakdownWithSmartRouter,
} from 'views/Swap/V3Swap/utils/exchange'
import { Timeline, TimelineItemStatus } from '../components/Timeline'

import { activeBridgeOrderMetadataAtom } from '../state/orderDataState'

import { useBridgeStatus } from '../../hooks'
import { ActiveBridgeOrderMetadata, BridgeStatus, Command } from '../../types'

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

  const allTokens = useAllTokensByChainIds([
    bridgeStatus?.originChainId || order?.trade.inputAmount.currency.chainId || 0,
    bridgeStatus?.destinationChainId || order?.trade.outputAmount.currency.chainId || 0,
  ])

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

  const getCurrencyByAddress = useCallback(
    (chainId: number, address: Address) => {
      // Check if it is a native currency
      const native = Native.onChain(chainId)
      const isNative = address?.toLowerCase() === zeroAddress || address?.toLowerCase() === GELATO_NATIVE
      if (isNative) return native

      if (
        address === bridgeStatus?.inputCurrencyAmount?.currency.wrapped.address &&
        chainId === bridgeStatus?.inputCurrencyAmount?.currency.chainId
      ) {
        return bridgeStatus?.inputCurrencyAmount?.currency
      }
      if (
        address === bridgeStatus?.outputCurrencyAmount?.currency.wrapped.address &&
        chainId === bridgeStatus?.outputCurrencyAmount?.currency.chainId
      ) {
        return bridgeStatus?.outputCurrencyAmount?.currency
      }

      console.log('getCurrencyByAddress', chainId, address)
      console.log('allTokens', allTokens?.[chainId]?.[safeGetAddress(address) || ''], allTokens)
      if (allTokens) {
        const token = allTokens?.[chainId]?.[safeGetAddress(address) || '']
        if (token) return token
      }

      return undefined

      // Else, read name, symbol and decimals from contract
      // try {
      //   const chainClient = publicClient({ chainId })
      //   const [name, symbol, decimals] = await chainClient.multicall({
      //     allowFailure: false,
      //     contracts: [
      //       {
      //         address,
      //         abi: erc20Abi,
      //         functionName: 'name',
      //       },
      //       {
      //         address,
      //         abi: erc20Abi,
      //         functionName: 'symbol',
      //       },
      //       {
      //         address,
      //         abi: erc20Abi,
      //         functionName: 'decimals',
      //       },
      //     ],
      //   })

      //   return new ERC20Token(chainId, address, decimals ?? 18, symbol ?? '', name ?? '')
      // } catch (error) {
      //   console.error(error)
      //   return undefined
      // }
    },
    [allTokens],
  )

  const timelineItems = useMemo(() => {
    return (
      bridgeStatus?.data?.map((step) => {
        const getText = () => {
          switch (step.command) {
            case Command.SWAP:
              return t('Swapped %currencyA% to %currencyB% (%chainName%)', {
                currencyA: getCurrencyByAddress(step.metadata.chainId, step.metadata.inputToken)?.symbol || '', // TODO: Get output of bridged token... can be different if prev swap step present
                currencyB: getCurrencyByAddress(step.metadata.chainId, step.metadata.outputToken)?.symbol || '',
                chainName: getFullChainNameById(step.metadata.chainId),
              })
            case Command.BRIDGE:
              return t('Bridge %currency% (%inputChain% to %outputChain%)', {
                currency: order?.trade.inputAmount.currency.symbol || '', // TODO: Verify this currency symbol for Swap->Bridge?-> Cases
                inputChain: getFullChainNameById(step.metadata.originChainId),
                outputChain: getFullChainNameById(step.metadata.destinationChainId),
              })
            default:
              return ''
          }
        }

        const getStatus = (): TimelineItemStatus => {
          switch (step.status.code) {
            case BridgeStatus.SUCCESS:
              return 'completed'
            case BridgeStatus.PARTIAL_SUCCESS:
              return 'warning'
            case BridgeStatus.FAILED:
              return 'failed'
            case BridgeStatus.PENDING:
            case BridgeStatus.BRIDGE_PENDING:
              return 'inProgress'
            default:
              return 'notStarted'
          }
        }

        const timelineStatus = getStatus()

        // TODO: Get and Handle error codes
        const failureMessage =
          step.status.code === BridgeStatus.FAILED
            ? 'Failed'
            : step.status.code === BridgeStatus.PARTIAL_SUCCESS
            ? 'Partial Success'
            : undefined

        return {
          id: step.command,
          title: getText(),
          status: timelineStatus,
          isLast: bridgeStatus?.data && step.command === bridgeStatus?.data[bridgeStatus?.data.length - 1]?.command,
          ...(failureMessage
            ? timelineStatus === 'failed'
              ? { errorMessage: failureMessage }
              : { warningMessage: failureMessage }
            : undefined),
          tx: {
            hash: step.command === Command.SWAP ? step.metadata.tx : step.metadata.depositTxHash,
            chainId: step.command === Command.SWAP ? step.metadata.chainId : step.metadata.originChainId,
          },
        }
      }) ?? []
    )
  }, [bridgeStatus, order, t, getCurrencyByAddress])

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
                {lpFeeAmount?.toSignificant(2) || '-'}&nbsp;
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
