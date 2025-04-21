import { CrossChainOrderStatus } from 'views/SwapSimplify/V4Swap/CrossChainConfirmSwapModal/types'

export type CrossChainTransactionItem = {
  type: 'crossChainOrder'
  item: {
    status: CrossChainOrderStatus
    timestamp?: number
    hash: string
    inputs: {
      token: string
      chainId: number
      amount: string
    }
    outputs: {
      token: string
      chainId: number
      amount: string
    }
  }
}
