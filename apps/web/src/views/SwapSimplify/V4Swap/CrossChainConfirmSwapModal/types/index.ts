import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { Currency } from '@pancakeswap/swap-sdk-core'

export enum CrossChainOrderStatus {
  ORDER_SUBMITTED = 'ORDER_SUBMITTED',
  ORDER_PARTIAL_SUCCESS = 'ORDER_PARTIAL_SUCCESS',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  ORDER_FAILED = 'ORDER_FAILED',
}

export enum CrossChainOrderStepType {
  SWAP_AT_SOURCE_CHAIN = 'SWAP_AT_SOURCE_CHAIN',
  BRIDGE = 'BRIDGE',
  SWAP_AT_DESTINATION_CHAIN = 'SWAP_AT_DESTINATION_CHAIN',
}

export enum CrossChainOrderStepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface CrossChainOrderData {
  // status can be derived from steps status
  status: CrossChainOrderStatus | null
  resultInformation?: {
    amount: string
    currency: Currency
    chainName: string
  }

  order: PriceOrder | null | undefined
  originalOrder: PriceOrder | null | undefined
  // TODO: Add txHash, orderId, etc. as needed
  steps?: {
    type: CrossChainOrderStepType
    status?: CrossChainOrderStepStatus
    inputCurrency?: Currency
    outputCurrency?: Currency
    inputAmount?: string
    outputAmount?: string
    inputChainName?: string
    outputChainName?: string
    tx?: {
      hash: string
      chainId: number
    }
    failureMessage?: string
  }[]
}
