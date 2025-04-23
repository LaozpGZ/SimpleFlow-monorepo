import { CrossChainOrderData } from 'views/SwapSimplify/V4Swap/CrossChainConfirmSwapModal/types'

export type CrossChainTransactionItem = {
  type: 'crossChainOrder'
  orderData: CrossChainOrderData
}
