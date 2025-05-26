import {
  ArrowForwardIcon,
  Box,
  BoxProps,
  CheckmarkCircleIcon,
  ErrorIcon,
  FlexGap,
  SwapLoading,
  Text,
  WarningIcon,
} from '@pancakeswap/uikit'
import { DualCurrencyDisplay } from '@pancakeswap/widgets-internal'
import { useAtomValue } from 'jotai'

import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/sdk'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { formatScientificToDecimal } from '@pancakeswap/utils/formatNumber'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { useMemo } from 'react'
import styled from 'styled-components'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { useBridgeStatus } from '../../hooks/useBridgeStatus'
import { ActiveBridgeOrderMetadata, BridgeResponseStatusData, BridgeStatus, Command } from '../../types'
import { activeBridgeOrderMetadataAtom } from '../state/orderDataState'
import { OrderDetailsPanel } from './OrderDetailsPanel'

const IconContainer = styled(Box)`
  position: relative;
  width: 24px;
  height: 24px;
`

const DisplayMessage = styled(FlexGap).attrs({ alignItems: 'center', gap: '8px' })<{
  $status?: BridgeStatus | null
}>`
  padding: 12px;
  border-radius: 20px;
  background-color: ${({ theme, $status }) =>
    $status === BridgeStatus.SUCCESS ? theme.colors.primary10 : theme.colors.warning10};
  border: 1px solid
    ${({ theme, $status }) => ($status === BridgeStatus.SUCCESS ? theme.colors.primary20 : theme.colors.warning20)};

  transition: all 0.3s ease-out;
  overflow: hidden;
  max-height: 100px;
  opacity: 1;
`

interface OrderResultModalContentProps extends BoxProps {
  overrideActiveOrderMetadata?: ActiveBridgeOrderMetadata
}
export const OrderResultModalContent = ({ overrideActiveOrderMetadata, ...props }: OrderResultModalContentProps) => {
  const { t } = useTranslation()
  const activeBridgeOrderMetadata = useAtomValue(activeBridgeOrderMetadataAtom)
  const bridgeMetadata = overrideActiveOrderMetadata || activeBridgeOrderMetadata

  const txHash = bridgeMetadata?.txHash
  const originChainId = bridgeMetadata?.originChainId
  const order = bridgeMetadata?.order
  const metadata = bridgeMetadata?.metadata

  const orderInputCurrency = order?.trade.inputAmount.currency
  const orderOutputCurrency = order?.trade.outputAmount.currency

  const { data: bridgeStatus } = useBridgeStatus(originChainId, txHash, metadata)

  const resultTokenData = useMemo(() => {
    // Derive result token and amount information from last command (swap or bridge)
    // TODO: Verify last command's FAIL condition and the data being sent
    let resultTokenAddress: string | undefined
    let resultAmount: string | undefined
    let resultTokenChainId: number | undefined

    let lastExecutedCommand: BridgeResponseStatusData | undefined
    if (bridgeStatus && bridgeStatus?.data) {
      for (const step of bridgeStatus.data.toReversed()) {
        if (step.status.code === BridgeStatus.PENDING || step.status.code === BridgeStatus.BRIDGE_PENDING) {
          continue
        }
        lastExecutedCommand = step
        break
      }
    }

    if (lastExecutedCommand && bridgeStatus) {
      switch (lastExecutedCommand.command) {
        case Command.SWAP: {
          resultTokenChainId = lastExecutedCommand.metadata.chainId
          resultAmount = lastExecutedCommand.metadata.outputAmount

          // If swap failed or partially succeeded, use input token as result token.
          // TODO: Check if this case is only for Partial Success or for Failed as well
          if (
            lastExecutedCommand.status.code === BridgeStatus.PARTIAL_SUCCESS ||
            lastExecutedCommand.status.code === BridgeStatus.FAILED
          ) {
            resultTokenAddress = lastExecutedCommand.metadata.inputToken
          } else {
            resultTokenAddress = lastExecutedCommand.metadata.outputToken
          }
          break
        }
        case Command.BRIDGE: {
          resultTokenAddress = bridgeStatus.outputToken
          resultTokenChainId = bridgeStatus.destinationChainId
          resultAmount = lastExecutedCommand.metadata.outputAmount
          break
        }
        default:
          break
      }
    }

    return {
      resultTokenAddress,
      resultTokenChainId,
      resultAmount,
    }
  }, [bridgeStatus])

  // Result currency
  const resultCurrency = useCurrencyByChainId(resultTokenData.resultTokenAddress, resultTokenData.resultTokenChainId)

  const resultCurrencyAmount = useMemo(() => {
    if (!resultCurrency || !resultTokenData.resultAmount) return undefined
    return CurrencyAmount.fromRawAmount(resultCurrency, formatScientificToDecimal(resultTokenData.resultAmount))
  }, [resultCurrency, resultTokenData.resultAmount])

  const outputAmount = useMemo(() => {
    if (bridgeStatus?.status === BridgeStatus.SUCCESS) {
      return bridgeStatus.outputCurrencyAmount
    }

    const minOutputAmount =
      bridgeStatus?.outputCurrencyAmount?.currency &&
      bridgeStatus?.minOutputAmount &&
      CurrencyAmount.fromRawAmount(
        bridgeStatus.outputCurrencyAmount?.currency,
        formatScientificToDecimal(bridgeStatus.minOutputAmount),
      )

    return minOutputAmount || bridgeStatus?.outputCurrencyAmount || order?.trade.outputAmount
  }, [bridgeStatus, order?.trade.outputAmount])

  const middleIcon = useMemo(() => {
    switch (bridgeStatus?.status || metadata?.status) {
      case BridgeStatus.PENDING:
        return (
          <IconContainer>
            <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />
            <SwapLoading style={{ position: 'absolute', top: '2px', left: '7px', scale: '2.5' }} />
          </IconContainer>
        )
      case BridgeStatus.SUCCESS:
        return (
          <IconContainer>
            <CheckmarkCircleIcon width="36px" color="success" />
          </IconContainer>
        )
      case BridgeStatus.PARTIAL_SUCCESS:
        return (
          <FlexGap flexDirection="column" alignItems="center" gap="4px">
            <WarningIcon width="20px" color="binance" />
            <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />
          </FlexGap>
        )
      default:
        return undefined
    }
  }, [bridgeStatus?.status])

  const displayInfo = useMemo(() => {
    if (!bridgeStatus || !bridgeStatus.data) return undefined

    let status = bridgeStatus?.status
    let isRefundCase = false

    // Refund case: If swap on origin chain is successful but bridging has failed
    if (
      bridgeStatus?.data.length >= 2 &&
      bridgeStatus?.data[0].status.code === BridgeStatus.SUCCESS &&
      bridgeStatus.data[0].command === Command.SWAP &&
      bridgeStatus.data[1].command === Command.BRIDGE &&
      (bridgeStatus?.data[1].status.code === BridgeStatus.FAILED ||
        bridgeStatus?.data[1].status.code === BridgeStatus.PARTIAL_SUCCESS)
    ) {
      isRefundCase = true
      status = BridgeStatus.PARTIAL_SUCCESS
    }

    return {
      status,
      isRefundCase,
    }
  }, [bridgeStatus])

  return (
    <Box {...props}>
      <Box
        style={{
          height: bridgeStatus && resultCurrencyAmount ? 'auto' : '0',
          opacity: bridgeStatus && resultCurrencyAmount ? 1 : 0,
          transition: 'all 0.3s ease-out',
          overflow: 'hidden',
          marginBottom: bridgeStatus && resultCurrencyAmount ? '24px' : '0',
        }}
      >
        {displayInfo && bridgeStatus && resultCurrencyAmount && (
          <DisplayMessage $status={displayInfo.status}>
            {displayInfo.status === BridgeStatus.SUCCESS ? (
              <CheckmarkCircleIcon width="24px" color="primary60" />
            ) : (
              <ErrorIcon width="24px" color="warning60" />
            )}
            <Text small bold>
              {displayInfo.isRefundCase
                ? t('%amount% %symbol% is being refunded to your wallet on %targetChain%', {
                    amount: resultCurrencyAmount.toSignificant(DISPLAY_PRECISION),
                    symbol: resultCurrencyAmount.currency.symbol,
                    targetChain: getFullChainNameById(resultCurrencyAmount.currency.chainId),
                  })
                : t('%amount% %symbol% has been sent to your wallet on %outputChain%', {
                    amount: resultCurrencyAmount.toSignificant(DISPLAY_PRECISION),
                    symbol: resultCurrencyAmount.currency.symbol,
                    outputChain: getFullChainNameById(resultCurrencyAmount.currency.chainId),
                  })}
            </Text>
          </DisplayMessage>
        )}
      </Box>
      <DualCurrencyDisplay
        inputCurrency={bridgeStatus?.inputCurrencyAmount?.currency || orderInputCurrency}
        outputCurrency={bridgeStatus?.outputCurrencyAmount?.currency || orderOutputCurrency}
        inputAmount={formatAmount(bridgeStatus?.inputCurrencyAmount || order?.trade.inputAmount)}
        outputAmount={formatAmount(outputAmount)}
        inputChainName={getFullChainNameById(bridgeStatus?.originChainId || orderInputCurrency?.chainId)}
        outputChainName={getFullChainNameById(bridgeStatus?.destinationChainId || orderOutputCurrency?.chainId)}
        overrideIcon={middleIcon}
        textRightOpacity={
          bridgeStatus?.status === BridgeStatus.FAILED || bridgeStatus?.status === BridgeStatus.PARTIAL_SUCCESS
            ? 0.5
            : 1
        }
      />
      {bridgeStatus && bridgeStatus.data && bridgeStatus.data.length > 0 && (
        <OrderDetailsPanel mt="24px" overrideActiveOrderMetadata={bridgeMetadata} />
      )}
    </Box>
  )
}
