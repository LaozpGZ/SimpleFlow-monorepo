import { useTranslation } from '@pancakeswap/localization'
import { zeroAddress } from '@pancakeswap/price-api-sdk'
import { ERC20Token, Native } from '@pancakeswap/sdk'
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
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
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
import { Timeline } from '../components/Timeline'
import { detailsPanelExpanded, detailsPanelProgressExpanded } from '../state/detailsPanel'
import { activeBridgeOrderMetadataAtom } from '../state/orderDataState'

import { useBridgeStatus } from '../../hooks'
import { ActiveBridgeOrderMetadata, BridgeStatus, Command } from '../../types'

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

  const bridgeStatus = useBridgeStatus(originChainId, originTxHash)

  const availableChainIds: number[] = []
  if (order?.trade.inputAmount.currency.chainId) {
    availableChainIds.push(order.trade.inputAmount.currency.chainId)
  }
  if (order?.trade.outputAmount.currency.chainId) {
    availableChainIds.push(order.trade.outputAmount.currency.chainId)
  }
  const allTokens = useAllTokensByChainIds(availableChainIds)

  const [detailsExpanded, setDetailsExpanded] = useAtom(detailsPanelExpanded)
  const [progressExpanded, setProgressExpanded] = useAtom(detailsPanelProgressExpanded)

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

  const toggleDetailsExpanded = useCallback(() => {
    setDetailsExpanded(!detailsExpanded)
  }, [detailsExpanded, setDetailsExpanded])

  const toggleProgressExpanded = useCallback(() => {
    setProgressExpanded(!progressExpanded)
  }, [progressExpanded, setProgressExpanded])

  const getCurrencyByAddress = useCallback(
    (chainId: number, address: Address) => {
      const token: ERC20Token = allTokens[chainId][safeGetAddress(address) || '']
      if (token) return token

      // Check if it is a native currency
      const native = Native.onChain(chainId)
      const isNative = address?.toLowerCase() === zeroAddress || address?.toLowerCase() === GELATO_NATIVE
      if (isNative) return native

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
                currencyA: getCurrencyByAddress(step.metadata.chainId, step.metadata.inputToken)?.symbol,
                currencyB: getCurrencyByAddress(step.metadata.chainId, step.metadata.outputToken)?.symbol,
                chainName: getFullChainNameById(step.metadata.chainId),
              })
            case Command.BRIDGE:
              return t('Bridge %currency% (%inputChain% to %outputChain%)', {
                currency: order?.trade.inputAmount.currency.symbol, // TODO: Verify this currency symbol for Swap->Bridge?-> Cases
                inputChain: getFullChainNameById(step.metadata.originChainId),
                outputChain: getFullChainNameById(step.metadata.destinationChainId),
              })
            default:
              return ''
          }
        }

        const getStatus = () => {
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
                {progressExpanded && bridgeStatus?.data && (
                  <RowFixed ml="8px">
                    <Timeline items={timelineItems} />
                  </RowFixed>
                )}
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
                {formatAmount(slippageAdjustedAmounts?.[Field.OUTPUT], DISPLAY_PRECISION)}
                &nbsp;
                {order?.trade.outputAmount.currency.symbol}
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
