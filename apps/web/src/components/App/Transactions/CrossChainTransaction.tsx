import { useTranslation } from '@pancakeswap/localization'
import { ChevronRightIcon, FlexGap, ModalV2, MotionModal, Text, useModalV2 } from '@pancakeswap/uikit'
import { useMemo } from 'react'

import {
  ChainLogo,
  TransactionListItem,
  TransactionListItemTitle,
  TransactionStatus,
} from '@pancakeswap/widgets-internal'

import styled from 'styled-components'

import { getFullChainNameById } from 'utils/getFullChainNameById'
import { OrderResultModalContent } from 'views/Swap/Bridge/CrossChainConfirmSwapModal/OrderStatus/OrderResultModalContent'
import { BridgeStatus } from 'views/Swap/Bridge/types'
// import { CrossChainOrderData, CrossChainOrderStatus } from 'views/Swap/Bridge/types'

const StyledChainLogo = styled(ChainLogo)`
  width: 22px;
  height: 22px;
  border: 2px solid ${({ theme }) => theme.colors.invertedContrast};
  border-radius: 20px;
`

export function CrossChainTransaction({ orderData }: { orderData: any }) {
  const { t } = useTranslation()
  const modal = useModalV2()

  const status = useMemo(() => {
    if (orderData.status === BridgeStatus.SUCCESS) {
      return TransactionStatus.Success
    }
    if (
      orderData.status === BridgeStatus.FAILED ||
      orderData.status === BridgeStatus.PARTIAL_SUCCESS // TODO: Add another one, warning status, to TransactionStatus for Partial Success
    ) {
      return TransactionStatus.Failed
    }
    return TransactionStatus.Pending
  }, [orderData.status])

  const inputToken = orderData.order?.trade?.inputAmount.currency
  const outputToken = orderData.order?.trade?.outputAmount.currency
  const inputChainId = orderData.order?.trade?.inputAmount.currency.chainId
  const outputChainId = orderData.order?.trade?.outputAmount.currency.chainId
  const inputChainName = getFullChainNameById(inputChainId)
  const outputChainName = getFullChainNameById(outputChainId)

  if (!inputToken || !outputToken || !inputChainId || !outputChainId) {
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
              <StyledChainLogo chainId={orderData.order?.trade?.inputAmount.currency.chainId} />
              <StyledChainLogo chainId={orderData.order?.trade?.outputAmount.currency.chainId} ml="-8px" />
            </FlexGap>

            <TransactionListItemTitle>
              {t('Swap %inputChainName% to %outputChainName%', {
                inputChainName: getFullChainNameById(orderData.order?.trade?.inputAmount.currency.chainId),
                outputChainName: getFullChainNameById(orderData.order?.trade?.outputAmount.currency.chainId),
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
          {t('Swap')}&nbsp;
          <Text as="span" bold small>
            {orderData.order?.trade?.inputAmount.toExact()}&nbsp;
            {inputToken?.symbol}
          </Text>
          &nbsp; ({t('on %chainSymbol%', { chainSymbol: inputChainName })}) {t('for')}&nbsp;
          <Text as="span" bold small>
            {orderData.order?.trade?.outputAmount.toExact()}&nbsp;
            {outputToken?.symbol}
          </Text>
          &nbsp; ({t('on %chainSymbol%', { chainSymbol: outputChainName })})
        </Text>
      </TransactionListItem>
      <ModalV2 {...modal}>
        <MotionModal
          title={t('Order details')}
          headerBorderColor="transparent"
          bodyPadding="0 24px 24px"
          minWidth="400px"
        >
          <OrderResultModalContent overrideActiveOrderMetadata={orderData} />
        </MotionModal>
      </ModalV2>
    </>
  )
}
