import { CrossChainOrderData } from 'views/Swap/Bridge/types'

export type CrossChainTransactionItem = {
  type: 'crossChainOrder'
  orderData: CrossChainOrderData
}
