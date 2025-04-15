import { Currency } from '@pancakeswap/sdk'
import { atom } from 'jotai'
import { InterfaceOrder } from 'views/Swap/utils'
import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../types'

export const crossChainOrderData = atom<{
  // status can be derived from steps status
  status: CrossChainOrderStatus | null
  resultInformation?: {
    amount: string
    currency: Currency
    chainName: string
  }

  order: InterfaceOrder | null | undefined
  originalOrder: InterfaceOrder | null | undefined
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
