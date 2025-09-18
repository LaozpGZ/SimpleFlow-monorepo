import { Order, OrderStatus } from '../types/orders.types'

export const parseOrders = (orders: Order[]) => {
  return orders.map((order) => {
    return {
      sell: '1',
      buy: '1',
      limitPrice: '1',
      status: order.status as OrderStatus,
      filled: '1',
      amountReceived: '1',
      actions: 'none',
    }
  })
}
