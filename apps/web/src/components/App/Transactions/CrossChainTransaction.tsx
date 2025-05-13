import { useTranslation } from '@pancakeswap/localization'
import { ChevronRightIcon, FlexGap, ModalV2, MotionModal, Text, useModalV2 } from '@pancakeswap/uikit'
import { useMemo } from 'react'

import {
  ChainLogo,
  TransactionListItemTitle,
  TransactionListItemV2,
  TransactionStatusV2,
} from '@pancakeswap/widgets-internal'

import styled from 'styled-components'

import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { ViewOnExplorerButton } from 'components/ViewOnExplorerButton'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { OrderResultModalContent } from 'views/Swap/Bridge/CrossChainConfirmSwapModal/OrderStatus/OrderResultModalContent'
import { BridgeStatus, UserBridgeOrderRow } from 'views/Swap/Bridge/types'

const StyledChainLogo = styled(ChainLogo)`
  width: 22px;
  height: 22px;
  border: 2px solid ${({ theme }) => theme.colors.invertedContrast};
  border-radius: 20px;
`

export function CrossChainTransaction({ order }: { order: UserBridgeOrderRow }) {
  const { t } = useTranslation()
  const modal = useModalV2()

  const status = useMemo(() => {
    if (order.status === BridgeStatus.SUCCESS) {
      return TransactionStatusV2.Success
    }
    if (
      order.status === BridgeStatus.FAILED ||
      order.status === BridgeStatus.PARTIAL_SUCCESS // TODO: Add another one, warning status, to TransactionStatus for Partial Success
    ) {
      return TransactionStatusV2.Failed
    }
    return TransactionStatusV2.Pending
  }, [order.status])

  const inputChainId = order.originChainId
  const outputChainId = order.destinationChainId

  const inputChainName = getFullChainNameById(inputChainId)
  const outputChainName = getFullChainNameById(outputChainId)

  const inputToken = useCurrencyByChainId(order.inputToken, inputChainId)
  const outputToken = useCurrencyByChainId(order.outputToken, outputChainId)

  const inputAmount = inputToken && CurrencyAmount.fromRawAmount(inputToken, order.inputAmount)
  const outputAmount = outputToken && CurrencyAmount.fromRawAmount(outputToken, order.outputAmount)

  if (!inputToken || !outputToken || !inputChainId || !outputChainId) {
    return null
  }

  return (
    <>
      <TransactionListItemV2
        onClick={modal.onOpen}
        status={status}
        title={
          <FlexGap alignItems="center" gap="4px">
            <FlexGap alignItems="center">
              <StyledChainLogo chainId={inputChainId} />
              <StyledChainLogo chainId={outputChainId} ml="-8px" />
            </FlexGap>

            <TransactionListItemTitle>
              {t('Swap %inputChainName% to %outputChainName%', {
                inputChainName,
                outputChainName,
              })}
            </TransactionListItemTitle>
          </FlexGap>
        }
        action={
          <FlexGap gap="0.25rem" justifyContent="flex-end">
            {/* {status === TransactionStatus.Pending ? <Countdown to={order.deadline} /> : null} */}
            {/* {order.timestamp && new Date(order.timestamp).toDateString()} */}
            {order.transactionHash ? (
              <ViewOnExplorerButton
                chainId={order.originChainId}
                address={order.transactionHash}
                type="transaction"
                color="primary60"
              />
            ) : (
              <ChevronRightIcon
                style={{ cursor: 'pointer' }}
                fontSize="1.25rem"
                color="textSubtle"
                onClick={modal.onOpen}
              />
            )}
          </FlexGap>
        }
      >
        <Text small>
          {t('Swap')}&nbsp;
          <Text as="span" bold small>
            {inputAmount?.toSignificant(DISPLAY_PRECISION)}&nbsp;
            {inputToken?.symbol}
          </Text>
          &nbsp; ({t('on %chainSymbol%', { chainSymbol: inputChainName })}) {t('for')}&nbsp;
          <Text as="span" bold small>
            {outputAmount?.toSignificant(DISPLAY_PRECISION)}&nbsp;
            {outputToken?.symbol}
          </Text>
          &nbsp; ({t('on %chainSymbol%', { chainSymbol: outputChainName })})
        </Text>
      </TransactionListItemV2>
      <ModalV2 {...modal}>
        <MotionModal
          title={t('Order details')}
          headerBorderColor="transparent"
          bodyPadding="0 24px 24px"
          minWidth="400px"
        >
          <OrderResultModalContent
            overrideActiveOrderMetadata={{
              txHash: order.transactionHash,
              originChainId: order.originChainId,
              order: null,
            }}
          />
        </MotionModal>
      </ModalV2>
    </>
  )
}
