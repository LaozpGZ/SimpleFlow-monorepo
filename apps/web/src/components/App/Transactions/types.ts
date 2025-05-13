import { UserBridgeOrderRow } from 'views/Swap/Bridge/types'

export type CrossChainTransactionItem = {
  type: 'crossChainOrder'
  order: UserBridgeOrderRow
}
