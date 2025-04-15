import { useTranslation } from '@pancakeswap/localization'
import { BridgeOrder, ClassicOrder } from '@pancakeswap/price-api-sdk'
import { TradeType } from '@pancakeswap/sdk'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { crossChainOrderData, crossChainOrderStatus } from '../state/orderData'
import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../types'
import { OrderResultModalContent } from './OrderResultModalContent'

interface OrderStatusModalContentProps {
  order: ClassicOrder<TradeType> | BridgeOrder<TradeType> | null | undefined
  originalOrder: ClassicOrder<TradeType> | BridgeOrder<TradeType> | null | undefined
}

export const OrderStatusModalContent = ({ order, originalOrder }: OrderStatusModalContentProps) => {
  const { t } = useTranslation()
  const orderStatus = useAtomValue(crossChainOrderStatus)
  const [orderData, setOrderData] = useAtom(crossChainOrderData)

  // TODO: listen to order status changes

  useEffect(() => {
    if (order && order !== orderData?.order) {
      setOrderData({
        status: CrossChainOrderStatus.ORDER_PARTIAL_SUCCESS,
        resultInformation: {
          amount: '100',
          currency: order.trade.outputAmount.currency,
          chainName: getFullChainNameById(order.trade.outputAmount.currency.chainId),
        },

        order,
        originalOrder,
        steps: [
          {
            type: CrossChainOrderStepType.SWAP_AT_SOURCE_CHAIN,
            status: CrossChainOrderStepStatus.SUCCESS,
            inputCurrency: order.trade.inputAmount.currency, // Swap Source Currency
            outputCurrency: order.trade.outputAmount.currency, // Swap Destination Currency
            inputChainName: getFullChainNameById(order.trade.inputAmount.currency.chainId),
          },
          {
            type: CrossChainOrderStepType.BRIDGE,
            status: CrossChainOrderStepStatus.PARTIAL_SUCCESS,

            inputCurrency: order.trade.inputAmount.currency, // Bridge Currency (Previously Swap Destination Currency)
            inputChainName: getFullChainNameById(order.trade.inputAmount.currency.chainId),
            outputChainName: getFullChainNameById(order.trade.outputAmount.currency.chainId),
            failureMessage: t('Failed due to: %reason%', { reason: 'Insufficient balance' }),
          },
          {
            type: CrossChainOrderStepType.SWAP_AT_DESTINATION_CHAIN,
            status: CrossChainOrderStepStatus.FAILED,

            inputCurrency: order.trade.inputAmount.currency, // Swap Source Currency (Previously Bridge Currency)
            outputCurrency: order.trade.outputAmount.currency, // Swap Destination Currency
            outputChainName: getFullChainNameById(order.trade.outputAmount.currency.chainId),
            failureMessage: t('Failed due to: %reason%', { reason: 'Insufficient balance' }),
          },
        ],
      })
    }
  }, [t, order, originalOrder, orderData, setOrderData])

  if (orderStatus) {
    return <OrderResultModalContent />
  }

  return null
}
