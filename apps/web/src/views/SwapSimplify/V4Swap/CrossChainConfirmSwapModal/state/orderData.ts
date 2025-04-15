import { BridgeOrder, ClassicOrder } from '@pancakeswap/price-api-sdk'
import { Currency, TradeType } from '@pancakeswap/sdk'
import { atom } from 'jotai'
import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../types'

export const crossChainOrderData = atom<{
  // status can be derived from steps status
  status: CrossChainOrderStatus | null
  resultInformation?: {
    amount: string
    currency: Currency
    chainName: string
  }

  order: ClassicOrder<TradeType> | BridgeOrder<TradeType> | null | undefined | null | undefined
  originalOrder: ClassicOrder<TradeType> | BridgeOrder<TradeType> | null | undefined | null | undefined
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
    txHash?: string
    failureMessage?: string
  }[]
}>({
  status: null,
  order: null,
  originalOrder: null,
  steps: [],
})

export const crossChainOrderStatus = atom((get) => get(crossChainOrderData).status)
