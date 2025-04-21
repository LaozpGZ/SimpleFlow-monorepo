import { useTranslation } from '@pancakeswap/localization'
import { ChevronRightIcon, FlexGap, ModalV2, MotionModal, Text, useModalV2 } from '@pancakeswap/uikit'
import { useCurrency } from 'hooks/Tokens'
import { useMemo } from 'react'

import { useCountdown } from '@pancakeswap/hooks'
import {
  ChainLogo,
  TransactionListItem,
  TransactionListItemTitle,
  TransactionStatus,
} from '@pancakeswap/widgets-internal'
import dayjs from 'dayjs'

import styled from 'styled-components'

import { getChainName } from '@pancakeswap/chains'
import { OrderType } from '@pancakeswap/price-api-sdk'
import { CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { OrderResultModalContent } from 'views/SwapSimplify/V4Swap/CrossChainConfirmSwapModal/OrderStatus/OrderResultModalContent'
import {
  CrossChainOrderStatus,
  CrossChainOrderStepStatus,
  CrossChainOrderStepType,
} from 'views/SwapSimplify/V4Swap/CrossChainConfirmSwapModal/types'
import { CrossChainTransactionItem } from './types'

const StyledChainLogo = styled(ChainLogo)`
  width: 22px;
  height: 22px;
  border: 2px solid ${({ theme }) => theme.colors.invertedContrast};
  border-radius: 20px;
`

export function CrossChainTransaction({ order }: { order: CrossChainTransactionItem['item'] }) {
  const { t } = useTranslation()
  const modal = useModalV2()

  const status = useMemo(() => {
    if (order.status === CrossChainOrderStatus.ORDER_SUCCESS) {
      return TransactionStatus.Success
    }
    if (
      order.status === CrossChainOrderStatus.ORDER_FAILED ||
      order.status === CrossChainOrderStatus.ORDER_PARTIAL_SUCCESS // TODO: Add another one, warning status, to TransactionStatus for Partial Success
    ) {
      return TransactionStatus.Failed
    }
    return TransactionStatus.Pending
  }, [order.status])

  const inputToken = useCurrency(order.inputs.token)
  const outputToken = useCurrency(order.outputs.token)

  if (!inputToken || !outputToken) {
    return null
  }

  return (
    <>
      <TransactionListItem
        onClick={modal.onOpen}
        status={status}
        title={
          <FlexGap alignItems="center" gap="4px">
            <FlexGap alignItems="center">
              <StyledChainLogo chainId={order.inputs.chainId} />
              <StyledChainLogo chainId={order.outputs.chainId} ml="-8px" />
            </FlexGap>
            <TransactionListItemTitle>
              {t('Swap %inputChainName% to %outputChainName%', {
                inputChainName: getFullChainNameById(order.inputs.chainId),
                outputChainName: getFullChainNameById(order.outputs.chainId),
              })}
            </TransactionListItemTitle>
          </FlexGap>
        }
        action={
          <FlexGap gap="0.25rem" justifyContent="flex-end">
            {/* {status === TransactionStatus.Pending ? <Countdown to={order.deadline} /> : null} */}
            {/* {order.timestamp && new Date(order.timestamp).toDateString()} */}
            <ChevronRightIcon
              style={{ cursor: 'pointer' }}
              fontSize="1.25rem"
              color="textSubtle"
              onClick={modal.onOpen}
            />
          </FlexGap>
        }
      >
        <Text small>
          {t('Swap ')}
          <Text as="span" bold small>
            {order.inputs.amount}&nbsp;
            {inputToken?.symbol}
          </Text>
          &nbsp; ({t('on %chainSymbol%', { chainSymbol: getChainName(order.inputs.chainId) })}){t(' for ')}
          <Text as="span" bold small>
            {order.outputs.amount}&nbsp;
            {outputToken?.symbol}
          </Text>
          &nbsp; ({t('on %chainSymbol%', { chainSymbol: getChainName(order.outputs.chainId) })})
        </Text>
      </TransactionListItem>
      <ModalV2 {...modal}>
        <MotionModal title={t('Order details')} border="0">
          <OrderResultModalContent
            overrideOrderData={{
              status: CrossChainOrderStatus.ORDER_SUCCESS,
              resultInformation: {
                amount: '100',
                currency: inputToken,
                chainName: getFullChainNameById(order.inputs.chainId),
              },
              order: {
                type: OrderType.PCS_BRIDGE,
                trade: {
                  inputAmount: CurrencyAmount.fromRawAmount(inputToken, (100 * 1e18).toString()),
                  outputAmount: CurrencyAmount.fromRawAmount(outputToken, (100 * 1e18).toString()),
                  tradeType: TradeType.EXACT_INPUT,
                  routes: [],
                },
              },
              originalOrder: undefined,
              steps: [
                {
                  type: CrossChainOrderStepType.SWAP_AT_SOURCE_CHAIN,
                  status: CrossChainOrderStepStatus.SUCCESS,
                  inputCurrency: inputToken,
                  outputCurrency: outputToken,

                  inputChainName: getFullChainNameById(order.inputs.chainId),
                  outputChainName: getFullChainNameById(order.outputs.chainId),

                  tx: {
                    hash: '0x123',
                    chainId: order.inputs.chainId,
                  },
                },
                {
                  type: CrossChainOrderStepType.BRIDGE,
                  status: CrossChainOrderStepStatus.FAILED,
                  inputCurrency: inputToken,
                  outputCurrency: outputToken,
                  inputChainName: getFullChainNameById(order.inputs.chainId),
                  outputChainName: getFullChainNameById(order.outputs.chainId),

                  tx: {
                    hash: '0x123',
                    chainId: order.inputs.chainId,
                  },
                  failureMessage: 'Failed to bridge',
                },
              ],
            }}
          />
        </MotionModal>
      </ModalV2>
    </>
  )
}

function Countdown({ to }: { to?: number | string }) {
  const countdown = useCountdown(dayjs(to).unix())

  if (!countdown) {
    return null
  }
  return (
    <Text mr="0.25rem">
      {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
    </Text>
  )
}
