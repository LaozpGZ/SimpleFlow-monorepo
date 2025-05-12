import { BRIDGE_API_ENDPOINT } from 'config/constants/endpoints'
import { Address } from 'viem'
// import { CrossChainOrderData } from '../../types'

export interface GetRecentCrossChainOrdersResponse {
  orders: any[]
}

export const getRecentCrossChainOrders = async (chainId: number, address: Address) => {
  // TODO: Update route and its params
  const response = await fetch(`${BRIDGE_API_ENDPOINT}/orders?chainId=${chainId}&offerer=${address}`)
  return response.json()
}
