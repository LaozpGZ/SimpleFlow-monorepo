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
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { useMemo } from 'react'
import styled from 'styled-components'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { useBridgeStatus } from '../../hooks/useBridgeStatus'
import { ActiveBridgeOrderMetadata, BridgeStatus, Command } from '../../types'
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
    ${({ theme, $status }) => ($status === BridgeStatus.SUCCESS ? theme.colors.primary20 : theme.colors.warning10)};

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

  console.log('order chains and currency', {
    input: {
      chainId: orderInputCurrency?.chainId,
      symbol: orderInputCurrency?.symbol,
    },
    output: {
      chainId: orderOutputCurrency?.chainId,
      symbol: orderOutputCurrency?.symbol,
    },
  })

  const { data: bridgeStatus } = useBridgeStatus(originChainId, txHash, metadata)

  const resultTokenData = useMemo(() => {
    // Derive result token and amount information from last command (swap or bridge)
    // TODO: Verify last command's FAIL condition and the data being sent
    let resultTokenAddress: string | undefined
    let resultAmount: string | undefined
    let resultTokenChainId: number | undefined

    const lastCommand =
      bridgeStatus && bridgeStatus.data && bridgeStatus.data.length > 0
        ? bridgeStatus.data[bridgeStatus.data.length - 1]
        : undefined
    const command = lastCommand?.command

    if (lastCommand && bridgeStatus) {
      switch (command) {
        case Command.SWAP: {
          resultTokenAddress = lastCommand.metadata.outputToken
          resultAmount = lastCommand.metadata.outputAmount
          resultTokenChainId = lastCommand.metadata.chainId
          break
        }
        case Command.BRIDGE: {
          // temporarily use data.outputToken
          resultTokenAddress = bridgeStatus.outputToken // TODO: Get bridge output token address...
          resultTokenChainId = bridgeStatus.destinationChainId
          resultAmount = lastCommand.metadata.outputAmount
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
    return CurrencyAmount.fromRawAmount(resultCurrency, resultTokenData.resultAmount)
  }, [resultCurrency, resultTokenData.resultAmount])

  const middleIcon = useMemo(() => {
    switch (bridgeStatus?.status) {
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
        {bridgeStatus && resultCurrencyAmount && (
          <DisplayMessage $status={bridgeStatus.status}>
            {bridgeStatus.status === BridgeStatus.SUCCESS ? (
              <CheckmarkCircleIcon width="24px" color="primary60" />
            ) : (
              <ErrorIcon width="24px" color="warning60" />
            )}
            <Text small>
              {t('%amount% %symbol% has been sent to your wallet on %outputChain%', {
                amount: resultCurrencyAmount.toSignificant(DISPLAY_PRECISION),
                symbol: resultCurrencyAmount.currency.symbol,
                outputChain: getFullChainNameById(bridgeStatus.destinationChainId),
              })}
            </Text>
          </DisplayMessage>
        )}
      </Box>
      <DualCurrencyDisplay
        inputCurrency={bridgeStatus?.inputCurrencyAmount?.currency || orderInputCurrency}
        outputCurrency={bridgeStatus?.outputCurrencyAmount?.currency || orderOutputCurrency}
        inputAmount={formatAmount(bridgeStatus?.inputCurrencyAmount || order?.trade.inputAmount)}
        outputAmount={formatAmount(bridgeStatus?.outputCurrencyAmount || order?.trade.outputAmount)}
        inputChainName={getFullChainNameById(bridgeStatus?.originChainId || orderInputCurrency?.chainId)}
        outputChainName={getFullChainNameById(bridgeStatus?.destinationChainId || orderOutputCurrency?.chainId)}
        overrideIcon={middleIcon}
      />
      {bridgeStatus && bridgeStatus.data && bridgeStatus.data.length > 0 && (
        <OrderDetailsPanel mt="24px" overrideActiveOrderMetadata={bridgeMetadata} />
      )}
    </Box>
  )
}
